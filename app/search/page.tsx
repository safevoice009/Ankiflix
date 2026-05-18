"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/DeckCard";
import DeckModal from "@/components/DeckModal";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Deck } from "@/lib/types";
import { trackDeckEvent } from "@/lib/telemetry";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Category {
  id: string;
  name: string;
}

interface DeckWithProgress extends Deck {
  user_deck_progress?: Array<{ ease: number }>;
}

async function applyBehaviorRanking(input: Deck[], query: string | null = null): Promise<Deck[]> {
  if (input.length === 0) return input;

  try {
    const deckIds = input.map((d) => d.id);
    const { data: events } = await supabase
      .from("deck_events")
      .select("deck_id,event_type,created_at")
      .in("deck_id", deckIds)
      .in("event_type", ["open_ankiweb", "download_ankiweb"]);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const engagementByDeck = new Map<string, number>();
    for (const id of deckIds) engagementByDeck.set(id, 0);
    for (const event of events || []) {
      const current = engagementByDeck.get(event.deck_id) || 0;
      const eventTime = event.created_at ? new Date(event.created_at) : new Date(0);
      const weight = eventTime >= sevenDaysAgo ? 2.0 : 1.0;
      engagementByDeck.set(event.deck_id, current + weight);
    }

    const ranked = input.map((deck) => {
      const engagement = engagementByDeck.get(deck.id) ?? 0;
      const quality = (deck.ranking ?? 0) * 20;
      const cardsSignal = Math.min(10, Math.log10(Math.max(1, deck.total_cards ?? 0) + 1) * 4);
      const telemetrySignal = Math.log1p(engagement) * 8;
      const hasAnkiIdSignal = deck.anki_id ? 3 : 0;

      // 7-Day Recency Boost
      const deckCreatedAt = deck.created_at ? new Date(deck.created_at) : null;
      const isNewDeck = deckCreatedAt && deckCreatedAt >= sevenDaysAgo;
      const recencyBoost = isNewDeck ? 15 : 0;

      // Search-Intent Query Match
      let queryBoost = 0;
      if (query) {
        const q = query.toLowerCase().trim();
        const titleLower = (deck.title || "").toLowerCase().trim();
        const descLower = (deck.description || "").toLowerCase().trim();

        if (titleLower === q) {
          queryBoost = 30;
        } else if (titleLower.startsWith(q)) {
          queryBoost = 20;
        } else if (titleLower.includes(q)) {
          queryBoost = 10;
        } else if (descLower.includes(q)) {
          queryBoost = 5;
        }
      }

      const blendedScore = quality + cardsSignal + telemetrySignal + hasAnkiIdSignal + recencyBoost + queryBoost;
      return { deck, blendedScore };
    });

    return ranked
      .sort((a, b) => b.blendedScore - a.blendedScore)
      .map((r) => r.deck);
  } catch (err) {
    console.error("Telemetry query failed, falling back to quality/card ranking:", err);
    // Graceful fallback ranking
    const fallbackRanked = [...input].sort((a, b) => {
      const aQuality = (a.ranking ?? 0) * 20 + Math.min(10, Math.log10(Math.max(1, a.total_cards ?? 0) + 1) * 4) + (a.anki_id ? 3 : 0);
      const bQuality = (b.ranking ?? 0) * 20 + Math.min(10, Math.log10(Math.max(1, b.total_cards ?? 0) + 1) * 4) + (b.anki_id ? 3 : 0);
      return bQuality - aQuality;
    });
    return fallbackRanked;
  }
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<Deck[]>([]);
  const [externalResults, setExternalResults] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("ranking");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      setLoading(true);

      const cleanQuery = query.toLowerCase().trim();

      // --- 1) Hot Query Cache Check ---
      try {
        const cacheKey = `${cleanQuery}:${filterCategory || "all"}:${sortBy}`;
        const { data: cached } = await supabase
          .from("search_cache")
          .select("results, expires_at")
          .eq("query", cacheKey)
          .maybeSingle();

        if (cached && new Date(cached.expires_at) > new Date()) {
          setResults(cached.results.local || []);
          setExternalResults(cached.results.external || []);
          setLoading(false);
          setIsSearchingExternal(false);
          return;
        }
      } catch (cacheErr) {
        console.error("Cache read failed:", cacheErr);
      }

      // --- 2) Query Expansion with Synonyms ---
      let synonymsList: string[] = [cleanQuery];
      const queryWords = cleanQuery.split(/\s+/).filter(Boolean);
      if (queryWords.length > 0) {
        try {
          const { data: synData } = await supabase
            .from("search_synonyms")
            .select("term, synonyms")
            .in("term", queryWords);

          if (synData) {
            for (const s of synData) {
              synonymsList.push(s.term);
              if (s.synonyms && Array.isArray(s.synonyms)) {
                synonymsList.push(...s.synonyms);
              }
            }
          }
        } catch (synErr) {
          console.error("Synonyms expansion query failed:", synErr);
        }
      }
      synonymsList = Array.from(new Set(synonymsList));

      // Construct dynamic OR clause for synonyms
      const orConditions = synonymsList
        .flatMap((syn) => [
          `title.ilike.%${syn}%`,
          `description.ilike.%${syn}%`,
        ])
        .join(",");

      // Search in local decks
      let deckQuery = supabase
        .from("decks")
        .select("*, categories!inner(*), user_deck_progress(*)");

      if (orConditions) {
        deckQuery = deckQuery.or(orConditions);
      }

      if (filterCategory) {
        deckQuery = deckQuery.eq("category_id", filterCategory);
      }

      if (sortBy === "ranking") {
        deckQuery = deckQuery.order("ranking", { ascending: false });
      } else if (sortBy === "newest") {
        deckQuery = deckQuery.order("created_at", { ascending: false });
      } else if (sortBy === "cards") {
        deckQuery = deckQuery.order("total_cards", { ascending: false });
      }

      let localDecks: Deck[] = [];
      let behaviorRanked: Deck[] = [];
      const { data, error } = await deckQuery;
      if (!error && data) {
        localDecks = data as Deck[];
        behaviorRanked = await applyBehaviorRanking(localDecks, query);
        setResults(behaviorRanked);
      } else {
        console.error("Local search query failed:", error);
      }
      setLoading(false);

      // Deep Scan - Real-time AnkiWeb Search
      setIsSearchingExternal(true);
      let dedupedExternal: Deck[] = [];
      try {
        const res = await fetch(`/api/search-proxy?q=${encodeURIComponent(query)}`);
        const { results: extResults } = await res.json();
        const localKeys = new Set(
          localDecks.map((d) => (d.anki_id ? `anki:${d.anki_id}` : `title:${d.title.toLowerCase()}`))
        );

        dedupedExternal = ((extResults || []) as Deck[]).filter((d) => {
          const key = d.anki_id ? `anki:${d.anki_id}` : `title:${d.title.toLowerCase()}`;
          return !localKeys.has(key);
        });

        setExternalResults(dedupedExternal);
      } catch (err) {
        console.error("External scan failed:", err);
      }
      setIsSearchingExternal(false);

      // --- 3) Zero-Result Query Logging ---
      if (localDecks.length === 0 && dedupedExternal.length === 0) {
        try {
          const { data: existingLog } = await supabase
            .from("zero_result_queries")
            .select("id, count")
            .eq("query", cleanQuery)
            .maybeSingle();

          if (existingLog) {
            await supabase
              .from("zero_result_queries")
              .update({
                count: existingLog.count + 1,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingLog.id);
          } else {
            await supabase.from("zero_result_queries").insert({
              query: cleanQuery,
              count: 1,
            });
          }
        } catch (logErr) {
          console.error("Zero-result query logging failed:", logErr);
        }
      } else {
        // --- 4) Save to Cache ---
        try {
          const cacheKey = `${cleanQuery}:${filterCategory || "all"}:${sortBy}`;
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour TTL
          const cacheData = {
            local: behaviorRanked,
            external: dedupedExternal,
          };

          await supabase.from("search_cache").upsert(
            {
              query: cacheKey,
              results: cacheData,
              expires_at: expiresAt,
            },
            { onConflict: "query" }
          );
        } catch (cacheErr) {
          console.error("Caching results failed:", cacheErr);
        }
      }
    }
    fetchResults();
  }, [query, sortBy, filterCategory]);

  return (
    <div className="min-h-screen bg-[#141414] pt-40 px-4 md:px-12 pb-32">
      
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary" />
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Search Intelligence</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
              {query ? (
                <>RESULTS FOR <span className="text-primary italic">&quot;{query}&quot;</span></>
              ) : (
                <>QUERY <span className="text-primary italic">PENDING</span></>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {query && (
              <button
                onClick={() => {
                  void trackDeckEvent({
                    deckId: `search:${query}`,
                    eventType: "search_open_ankiweb",
                    query,
                  });
                  window.open(
                    `https://ankiweb.net/shared/decks?search=${encodeURIComponent(query)}`,
                    "_blank",
                    "noopener,noreferrer"
                  );
                }}
                className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all"
              >
                Open On AnkiWeb
              </button>
            )}
            <div className="flex items-center space-x-2 mr-2">
              <SlidersHorizontal className="h-4 w-4 text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Filter Engine</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-4 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all min-w-[180px] justify-between group">
                  <span className="group-hover:text-primary transition-colors">
                    {filterCategory ? categories.find((c) => c.id === filterCategory)?.name : 'All Fields'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#181818]/95 backdrop-blur-2xl border-white/10 text-white min-w-[200px] rounded-xl p-2 shadow-2xl">
                <DropdownMenuItem className="rounded-lg focus:bg-primary/20 focus:text-primary cursor-pointer text-[10px] font-black uppercase tracking-widest p-3" onClick={() => setFilterCategory(null)}>All Fields</DropdownMenuItem>
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} className="rounded-lg focus:bg-primary/20 focus:text-primary cursor-pointer text-[10px] font-black uppercase tracking-widest p-3" onClick={() => setFilterCategory(cat.id)}>
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-4 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all min-w-[180px] justify-between group">
                  <span className="group-hover:text-primary transition-colors">
                    {sortBy === 'ranking' ? 'Best Match' : sortBy === 'newest' ? 'Newest' : 'Most Cards'}
                  </span>
                  <ChevronDown className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#181818]/95 backdrop-blur-2xl border-white/10 text-white min-w-[200px] rounded-xl p-2 shadow-2xl">
                <DropdownMenuItem className="rounded-lg focus:bg-primary/20 focus:text-primary cursor-pointer text-[10px] font-black uppercase tracking-widest p-3" onClick={() => setSortBy('ranking')}>Best Match</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg focus:bg-primary/20 focus:text-primary cursor-pointer text-[10px] font-black uppercase tracking-widest p-3" onClick={() => setSortBy('newest')}>Newest</DropdownMenuItem>
                <DropdownMenuItem className="rounded-lg focus:bg-primary/20 focus:text-primary cursor-pointer text-[10px] font-black uppercase tracking-widest p-3" onClick={() => setSortBy('cards')}>Most Cards</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_30px_rgba(229,9,20,0.2)]" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-in fade-in duration-700">
            {results.map((deck: DeckWithProgress) => {
              const progress = deck.user_deck_progress?.[0];
              const mastery = progress ? Math.min(100, Math.max(0, ((progress.ease - 1.3) / (5.0 - 1.3)) * 100)) : undefined;
              
              return (
                <DeckCard 
                  key={deck.id} 
                  deck={{ ...deck, mastery }} 
                  onClick={(d) => {
                    setSelectedDeck(d);
                    setIsModalOpen(true);
                  }} 
                />
              );
            })}
          </div>
        ) : !isSearchingExternal && query && results.length === 0 && externalResults.length === 0 ? (
          <div className="py-40 text-center space-y-8">
            <div className="inline-block p-12 rounded-3xl bg-[#181818] border border-white/5 shadow-2xl">
              <p className="text-white/20 font-black uppercase tracking-[0.3em] text-sm">No Intel Found</p>
              <h3 className="font-heading text-4xl mt-4 text-white/40">ZERO MATCHES</h3>
              <button 
                onClick={() => {setFilterCategory(null); setSortBy('ranking');}}
                className="mt-8 text-primary hover:text-white font-black uppercase tracking-[0.2em] text-[10px] transition-colors"
              >
                Reset Search Filters
              </button>
            </div>
          </div>
        ) : null}

        {/* Global Vault Scan Results - Gen Z / Efficiency Upgrade */}
        {(isSearchingExternal || externalResults.length > 0) && (
          <div className="space-y-12 pt-20 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                  <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Neural Proxy Scan</span>
                </div>
                <h2 className="font-heading text-3xl font-black uppercase text-white italic">Global <span className="text-primary not-italic">Vault</span> Assets</h2>
              </div>
              {isSearchingExternal && (
                <div className="flex items-center space-x-3 text-white/40">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Scanning AnkiWeb...</span>
                </div>
              )}
            </div>

            {externalResults.length > 0 ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-in slide-in-from-bottom-8 duration-1000">
                {externalResults.map((deck: Deck) => (
                  <DeckCard 
                    key={deck.id} 
                    deck={deck} 
                    onClick={(d) => {
                      setSelectedDeck(d);
                      setIsModalOpen(true);
                    }} 
                  />
                ))}
              </div>
            ) : !isSearchingExternal && (
              <div className="py-20 text-center rounded-3xl bg-white/[0.02] border border-dashed border-white/10">
                <p className="text-white/20 font-black uppercase tracking-widest text-[10px]">Global Scan yielded no additional intelligence</p>
              </div>
            )}
          </div>
        )}
      </div>

      <DeckModal 
        deck={selectedDeck} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 px-4 md:px-12">
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
