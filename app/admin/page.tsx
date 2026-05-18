"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Activity, 
  RefreshCw, 
  Trash2, 
  AlertCircle, 
  TrendingUp, 
  Search, 
  Database,
  ArrowRight,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";

interface FailedQuery {
  id: string;
  query: string;
  count: number;
  updated_at: string;
}

interface ConvertingDeck {
  deckId: string;
  title: string;
  downloads: number;
  opens: number;
  total: number;
}

export default function AdminPage() {
  const [totalDecks, setTotalDecks] = useState<number>(0);
  const [synced24h, setSynced24h] = useState<number>(0);
  const [totalCategories, setTotalCategories] = useState<number>(0);
  const [failedQueries, setFailedQueries] = useState<FailedQuery[]>([]);
  const [convertingDecks, setConvertingDecks] = useState<ConvertingDeck[]>([]);
  const [cacheCount, setCacheCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchStats() {
    try {
      // 1. Fetch total decks
      const { count: deckCount } = await supabase
        .from("decks")
        .select("*", { count: "exact", head: true });
      setTotalDecks(deckCount || 0);

      // 2. Fetch synced in last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count: syncCount } = await supabase
        .from("decks")
        .select("*", { count: "exact", head: true })
        .gt("last_sync_at", oneDayAgo);
      setSynced24h(syncCount || 0);

      // 3. Fetch total categories
      const { count: catCount } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true });
      setTotalCategories(catCount || 0);

      // 4. Fetch failed queries
      const { data: failedData } = await supabase
        .from("zero_result_queries")
        .select("*")
        .order("count", { ascending: false })
        .limit(10);
      setFailedQueries((failedData as FailedQuery[]) || []);

      // 5. Fetch cache counts
      const { count: cCount } = await supabase
        .from("search_cache")
        .select("*", { count: "exact", head: true });
      setCacheCount(cCount || 0);

      // 6. Fetch conversion telemetry
      const { data: eventData } = await supabase
        .from("deck_events")
        .select("deck_id, event_type")
        .in("event_type", ["open_ankiweb", "download_ankiweb"]);

      if (eventData && eventData.length > 0) {
        // Group events
        const groups = new Map<string, { downloads: number; opens: number; total: number }>();
        for (const evt of eventData) {
          const current = groups.get(evt.deck_id) || { downloads: 0, opens: 0, total: 0 };
          if (evt.event_type === "download_ankiweb") {
            current.downloads += 1;
          } else {
            current.opens += 1;
          }
          current.total += 1;
          groups.set(evt.deck_id, current);
        }

        // Get details of top decks
        const sortedGroups = Array.from(groups.entries())
          .sort((a, b) => b[1].total - a[1].total)
          .slice(0, 5);

        const topDeckIds = sortedGroups.map((g) => g[0]);
        if (topDeckIds.length > 0) {
          const { data: deckDetails } = await supabase
            .from("decks")
            .select("id, title")
            .in("id", topDeckIds);

          const deckMap = new Map<string, string>();
          deckDetails?.forEach((d) => deckMap.set(d.id, d.title));

          const mappedConverting: ConvertingDeck[] = sortedGroups.map(([deckId, stats]) => ({
            deckId,
            title: deckMap.get(deckId) || "Unknown Deck Discovery",
            downloads: stats.downloads,
            opens: stats.opens,
            total: stats.total,
          }));
          setConvertingDecks(mappedConverting);
        }
      } else {
        setConvertingDecks([]);
      }
    } catch (err) {
      console.error("Dashboard data load failed:", err);
      toast.error("Failed to load dashboard diagnostics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchStats();
    toast.success("Metrics refreshed successfully!");
  }

  async function handleClearCache() {
    const confirmClear = window.confirm("Are you sure you want to flush the hot search cache?");
    if (!confirmClear) return;

    try {
      const { error } = await supabase
        .from("search_cache")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // deletes all

      if (!error) {
        setCacheCount(0);
        toast.success("Hot query search cache successfully flushed!");
      } else {
        throw error;
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to flush cache.");
    }
  }

  async function handleAutomateScrape(queryStr: string) {
    const toastId = toast.loading(`Spawning crawler for query "${queryStr}"...`);
    try {
      const res = await fetch("/api/search-proxy?q=" + encodeURIComponent(queryStr));
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        toast.success(`Success! Crawler ingested ${data.results.length} new decks for "${queryStr}".`, { id: toastId });
        // Clear this zero result query log
        await supabase
          .from("zero_result_queries")
          .delete()
          .eq("query", queryStr);
        await fetchStats();
      } else {
        toast.error(`Crawler scanned AnkiWeb but found zero hits for "${queryStr}".`, { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to trigger automated scraping.", { id: toastId });
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] pt-40 px-4 md:px-12 pb-32">
      <div className="max-w-[1400px] mx-auto space-y-12">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-primary animate-pulse" />
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Command Center</span>
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-black uppercase tracking-tight text-white leading-none">
              ADMIN <span className="text-primary italic">OBSERVABILITY</span>
            </h1>
            <p className="text-white/40 text-xs font-black uppercase tracking-widest">
              Ankiflix Systems & Automation Intelligence Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-white disabled:opacity-50 group"
            >
              <RefreshCw className={`h-3 w-3 group-hover:rotate-180 transition-transform duration-500 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Telemetry</span>
            </button>
            
            <button
              onClick={handleClearCache}
              className="flex items-center space-x-2 rounded-xl bg-red-950/20 border border-red-500/20 px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 hover:border-red-500/40 transition-all text-red-400"
            >
              <Trash2 className="h-3 w-3" />
              <span>Flush Cache</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_30px_rgba(229,9,20,0.2)]" />
          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            
            {/* Real-time Diagnostics Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6 hover:border-primary/20 transition-all duration-300 group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="flex items-center justify-between">
                  <Database className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Catalog</span>
                </div>
                <div className="mt-8 space-y-1">
                  <h3 className="text-4xl font-black text-white">{totalDecks}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Indexed Shared Decks</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6 hover:border-green-500/20 transition-all duration-300 group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-green-500/5 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="flex items-center justify-between">
                  <RefreshCw className="h-5 w-5 text-green-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Scraper Freshness</span>
                </div>
                <div className="mt-8 space-y-1">
                  <h3 className="text-4xl font-black text-green-400">+{synced24h}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Synced in last 24h</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6 hover:border-purple-500/20 transition-all duration-300 group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-purple-500/5 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="flex items-center justify-between">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Categories</span>
                </div>
                <div className="mt-8 space-y-1">
                  <h3 className="text-4xl font-black text-purple-400">{totalCategories}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Active Subject Slugs</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/5 p-6 hover:border-orange-500/20 transition-all duration-300 group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-orange-500/5 rounded-full blur-3xl -mr-8 -mt-8" />
                <div className="flex items-center justify-between">
                  <Sparkles className="h-5 w-5 text-orange-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Hot Cache Vault</span>
                </div>
                <div className="mt-8 space-y-1">
                  <h3 className="text-4xl font-black text-orange-400">{cacheCount}</h3>
                  <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Stored Query Matrices</p>
                </div>
              </div>

            </div>

            {/* Core Observability Logs Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Top Failed/Zero-Result Queries Card */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-400" />
                      <h3 className="font-heading text-lg font-black uppercase text-white">FAILED QUERIES (0 RESULTS)</h3>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Queries entered by users returning zero local or external hits</p>
                  </div>
                </div>

                {failedQueries.length > 0 ? (
                  <div className="space-y-4">
                    {failedQueries.map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors group"
                      >
                        <div className="space-y-1">
                          <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                            &quot;{item.query}&quot;
                          </span>
                          <div className="text-[9px] text-white/30 font-black uppercase tracking-wider">
                            Logged: {new Date(item.updated_at).toLocaleDateString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-xs font-black text-orange-400">{item.count} Failed Attempts</div>
                            <div className="text-[8px] font-black uppercase tracking-widest text-white/20">Failure Count</div>
                          </div>
                          
                          <button
                            onClick={() => handleAutomateScrape(item.query)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary hover:text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-primary transition-all"
                          >
                            <span>Trigger Sync</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/5 text-white/30">
                    <Search className="h-8 w-8 mx-auto opacity-20 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No zero-result searches logged in telemetry.</p>
                  </div>
                )}
              </div>

              {/* Conversion Telemetry & CTR */}
              <div className="rounded-2xl border border-white/5 bg-white/[0.01] p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <h3 className="font-heading text-lg font-black uppercase text-white">TOP CONVERTING DECK ASSETS</h3>
                    </div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Highest user conversions and click redirections to external hosts</p>
                  </div>
                </div>

                {convertingDecks.length > 0 ? (
                  <div className="space-y-6">
                    {convertingDecks.map((deck) => {
                      const maxClicks = Math.max(...convertingDecks.map(d => d.total));
                      const percentOfMax = (deck.total / maxClicks) * 100;
                      
                      return (
                        <div key={deck.deckId} className="space-y-2">
                          <div className="flex items-start justify-between text-sm">
                            <span className="font-bold text-white max-w-[70%] truncate">{deck.title}</span>
                            <span className="font-mono text-xs text-primary font-black uppercase">{deck.total} clicks</span>
                          </div>
                          
                          <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-primary to-orange-500 shadow-[0_0_10px_rgba(229,9,20,0.5)] transition-all duration-1000"
                              style={{ width: `${percentOfMax}%` }}
                            />
                          </div>

                          <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-white/30">
                            <span>⬇️ Downloads: {deck.downloads}</span>
                            <span>📖 Page Views: {deck.opens}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center rounded-2xl bg-white/[0.01] border border-dashed border-white/5 text-white/30">
                    <TrendingUp className="h-8 w-8 mx-auto opacity-20 mb-3" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No deck events registered in current period.</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
