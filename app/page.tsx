import { Play, Info, Zap, BrainCircuit } from "lucide-react";
import DiscoveryFeed from "@/components/DiscoveryFeed";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";
import { Deck } from "@/lib/types";

export const metadata: Metadata = {
  title: "Ankiflix - Discover Premium Anki Decks",
  description: "The Netflix of Anki decks. Search, discover, and download high-quality flashcard sets for Medical, Law, Languages, and more.",
  keywords: ["Anki", "Flashcards", "Medical Study", "NEET PG", "Language Learning", "Education"],
};

function rankTrendingWithTelemetry(input: Deck[], engagementByDeck: Map<string, number>): Deck[] {
  return [...input]
    .map((deck) => {
      const engagement = engagementByDeck.get(deck.id) ?? 0;
      const quality = (deck.ranking ?? 0) * 20;
      const cardsSignal = Math.min(10, Math.log10(Math.max(1, deck.total_cards ?? 0) + 1) * 4);
      const telemetrySignal = Math.log1p(engagement) * 8;
      return { deck, score: quality + cardsSignal + telemetrySignal };
    })
    .sort((a, b) => b.score - a.score)
    .map((item) => item.deck);
}

export default async function Home() {
  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  const heroParticles = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 37) % 100}%`,
    top: `${100 + ((i * 19) % 20)}%`,
    size: `${2 + (i % 4)}px`,
    duration: `${10 + (i % 7) * 3}s`,
    delay: `${(i % 10) * 0.8}s`,
  }));

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name, slug, decks(*)");

  const categories = categoriesData?.filter((cat) => cat.decks && cat.decks.length > 0) || [];

  const { data: rawTrendingDecks } = await supabase
    .from("decks")
    .select("*")
    .order("ranking", { ascending: false })
    .limit(20);

  let trendingDecks = (rawTrendingDecks as Deck[]) || [];
  let trendingThisWeek: Deck[] = [];
  let topQueries: string[] = [];
  try {
    const deckIds = trendingDecks.map((d) => d.id);
    if (deckIds.length > 0) {
      const { data: events } = await supabase
        .from("deck_events")
        .select("deck_id,event_type")
        .in("deck_id", deckIds)
        .in("event_type", ["open_ankiweb", "download_ankiweb"]);

      const engagementByDeck = new Map<string, number>();
      for (const id of deckIds) engagementByDeck.set(id, 0);
      for (const event of events || []) {
        const current = engagementByDeck.get(event.deck_id) || 0;
        engagementByDeck.set(event.deck_id, current + 1);
      }

      trendingDecks = rankTrendingWithTelemetry(trendingDecks, engagementByDeck).slice(0, 10);

      const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: weeklyEvents } = await supabase
        .from("deck_events")
        .select("deck_id,event_type,created_at")
        .in("deck_id", deckIds)
        .in("event_type", ["open_ankiweb", "download_ankiweb"])
        .gte("created_at", weekAgoIso);

      const recentEvents = (weeklyEvents || []).filter((event) => !!event.deck_id);
      const weeklyEngagement = new Map<string, number>();
      for (const event of recentEvents) {
        const current = weeklyEngagement.get(event.deck_id) || 0;
        weeklyEngagement.set(event.deck_id, current + 1);
      }
      trendingThisWeek = rankTrendingWithTelemetry(trendingDecks, weeklyEngagement).slice(0, 10);
    }
  } catch {
    trendingDecks = trendingDecks.slice(0, 10);
  }

  try {
    const weekAgoIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: queryEvents } = await supabase
      .from("deck_events")
      .select("query,event_type,created_at")
      .eq("event_type", "search_open_ankiweb")
      .gte("created_at", weekAgoIso)
      .not("query", "is", null);

    const queryCounts = new Map<string, number>();
    for (const row of queryEvents || []) {
      const query = String(row.query || "").trim().toLowerCase();
      if (!query) continue;
      queryCounts.set(query, (queryCounts.get(query) || 0) + 1);
    }
    topQueries = [...queryCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([query]) => query)
      .slice(0, 10);
  } catch {
    topQueries = [];
  }

  const { count: totalDecks } = await supabase
    .from("decks")
    .select("*", { count: "exact", head: true });

  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  let userProgress = null;
  let userProfile = null;
  let highestPriorityDeck = null;

  if (user) {
    const { data: progressData } = await serverSupabase
      .from("user_deck_progress")
      .select("*, decks(*)");
    userProgress = progressData;

    const { data: profile } = await serverSupabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    userProfile = profile;

    if (progressData && progressData.length > 0) {
      const overdue = [...progressData].sort((a, b) =>
        new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      );
      highestPriorityDeck = overdue[0].decks;
    }
  }

  return (
    <div className="relative min-h-screen pb-24">
      <section className="relative h-[110vh] w-full overflow-hidden bg-cinematic-gradient">
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          {heroParticles.map((particle, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                animationDuration: particle.duration,
                animationDelay: particle.delay,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(229,9,20,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-40 flex h-full flex-col justify-center px-4 md:px-12 pb-96">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="max-w-5xl space-y-10 animate-fade-in pt-32 md:pt-40">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center space-x-3">
                  <div className="h-[2px] w-12 bg-primary shadow-[0_0_15px_rgba(229,9,20,1)]" />
                  <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Global Vault Online</span>
                </div>
                {userProfile && (
                  <div className="flex items-center space-x-6 animate-in fade-in slide-in-from-left-4 duration-1000">
                    <div className="h-8 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Neural Streak</span>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-3 w-3 text-primary fill-primary" />
                        <span className="text-sm font-black italic tracking-tighter">{userProfile.streak || 0} Days</span>
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase tracking-widest text-white/30">Synaptic Load</span>
                      <div className="flex items-center space-x-2">
                        <BrainCircuit className="h-3 w-3 text-primary" />
                        <span className="text-sm font-black italic tracking-tighter">{(userProfile.neural_score || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <h1 className="font-heading text-[12vw] font-black tracking-tighter md:text-8xl lg:text-9xl leading-[0.8] text-white uppercase italic">
                {highestPriorityDeck ? (
                  <>
                    DUE FOR <span className="text-primary not-italic">REVIEW</span> <br />
                    <span className="text-white">{highestPriorityDeck.title}</span>
                  </>
                ) : (
                  <>
                    THE <span className="text-primary not-italic">GLOBAL</span> <br />
                    <span className="text-white">VAULT</span> OF <br />
                    INTELLIGENCE
                  </>
                )}
              </h1>

              <p className="text-xl text-white/60 md:text-2xl max-w-3xl font-medium font-sans leading-relaxed">
                {highestPriorityDeck ? (
                  <>Your memory is fading on this high-authority asset. Re-establish mastery now.</>
                ) : (
                  <>Streamline your mastery. Access <span className="text-white font-bold">{totalDecks || "1,000+"}</span> high-authority Anki libraries.</>
                )}
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-10">
                <a href="#discovery" className="group flex items-center space-x-3 rounded-full bg-primary px-12 py-5 font-black text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95 shadow-[0_20px_50px_rgba(229,9,20,0.3)]">
                  <Play className="h-6 w-6 fill-white" />
                  <span className="uppercase tracking-widest text-lg italic">Browse Vault</span>
                </a>
                <button className="flex items-center space-x-3 rounded-full bg-white/5 px-12 py-5 font-black text-white backdrop-blur-3xl border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 transform active:scale-95 group">
                  <Info className="h-6 w-6 text-white/50 group-hover:text-white" />
                  <span className="uppercase tracking-widest text-lg">System Specs</span>
                </button>
              </div>

              <div className="flex items-center gap-12 pt-12 border-t border-white/5">
                <div className="space-y-1">
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Total Intelligence Indexed</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black font-heading text-white tracking-tighter">{(totalDecks || 1240).toLocaleString()}</span>
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Active Mastery Syncs</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black font-heading text-white tracking-tighter">{(totalUsers || 420).toLocaleString()}</span>
                    <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#141414] via-[#141414] to-transparent z-20" />
      </section>

      <section id="discovery" className="relative z-30">
        <DiscoveryFeed
          categories={categories || []}
          trendingDecks={trendingDecks || []}
          trendingThisWeek={trendingThisWeek || []}
          topQueries={topQueries || []}
          userProgress={userProgress || []}
        />
      </section>
    </div>
  );
}
