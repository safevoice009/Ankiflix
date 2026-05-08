"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/DeckCard";
import DeckModal from "@/components/DeckModal";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Deck {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  ranking?: number;
  total_cards?: number;
  category_id?: string;
  created_at?: string;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState("ranking");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

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

      let baseQuery = supabase.from("decks").select("*, user_deck_progress(*)");
      baseQuery = baseQuery.ilike("title", `%${query}%`);
      if (filterCategory) {
        baseQuery = baseQuery.eq("category_id", filterCategory);
      }
      if (sortBy === "ranking") {
        baseQuery = baseQuery.order("ranking", { ascending: false });
      } else if (sortBy === "newest") {
        baseQuery = baseQuery.order("created_at", { ascending: false });
      } else if (sortBy === "cards") {
        baseQuery = baseQuery.order("total_cards", { ascending: false });
      }

      const { data, error } = await baseQuery;
      if (!error) setResults(data || []);
      setLoading(false);
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
                <>RESULTS FOR <span className="text-primary italic">"{query}"</span></>
              ) : (
                <>QUERY <span className="text-primary italic">PENDING</span></>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 mr-2">
              <SlidersHorizontal className="h-4 w-4 text-white/20" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20">Filter Engine</span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-4 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all min-w-[180px] justify-between group">
                  <span className="group-hover:text-primary transition-colors">
                    {filterCategory ? categories.find(c => c.id === filterCategory)?.name : 'All Fields'}
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
            {results.map((deck: any) => {
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
        ) : query ? (
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
