import { Play, Info } from "lucide-react";
import Image from "next/image";
import DiscoveryFeed from "@/components/DiscoveryFeed";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ankiflix — Discover Premium Anki Decks",
  description: "The Netflix of Anki decks. Search, discover, and download high-quality flashcard sets for Medical, Law, Languages, and more.",
  keywords: ["Anki", "Flashcards", "Medical Study", "NEET PG", "Language Learning", "Education"],
};

export default async function Home() {
  const serverSupabase = await createClient();
  const { data: { user } } = await serverSupabase.auth.getUser();

  // Fetch categories with their decks
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('id, name, slug, decks(*)');

  const categories = categoriesData?.filter(cat => cat.decks && cat.decks.length > 0) || [];

  const { data: trendingDecks } = await supabase
    .from('decks')
    .select('*')
    .order('ranking', { ascending: false })
    .limit(10);

  // Global Vault Stats
  const { count: totalDecks } = await supabase
    .from('decks')
    .select('*', { count: 'exact', head: true });

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // Fetch user SRS progress if logged in
  let userProgress = null;
  let highestPriorityDeck = null;
  if (user) {
    const { data } = await serverSupabase
      .from('user_deck_progress')
      .select('*, decks(*)');
    userProgress = data;

    if (data && data.length > 0) {
      // Find most overdue deck
      const overdue = [...data].sort((a, b) => 
        new Date(a.next_review).getTime() - new Date(b.next_review).getTime()
      );
      highestPriorityDeck = overdue[0].decks;
    }
  }

  return (
    <div className="relative min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[110vh] w-full overflow-hidden bg-cinematic-gradient">
        {/* Particle System */}
        <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
                animationDuration: `${10 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}
        </div>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(229,9,20,0.1),transparent_50%)]" />
        </div>

        <div className="relative z-40 flex h-full flex-col justify-center px-4 md:px-12 pb-96">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="max-w-5xl space-y-10 animate-fade-in pt-20">
              <div className="flex items-center space-x-3">
                <div className="h-[2px] w-12 bg-primary shadow-[0_0_15px_rgba(229,9,20,1)]" />
                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Global Vault Online</span>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest border-l border-white/10 pl-3">Neural Link Phase 3</span>
              </div>
              
              <div className="space-y-4">
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
              </div>
              
              <p className="text-xl text-white/60 md:text-2xl max-w-3xl font-medium font-sans leading-relaxed">
                {highestPriorityDeck ? (
                  <>
                    Your memory is fading on this high-authority asset. 
                    Re-establish mastery now to maintain your 1% performance edge.
                  </>
                ) : (
                  <>
                    Streamline your mastery. Access <span className="text-white font-bold">{totalDecks || '1,000+'}</span> high-authority Anki libraries 
                    synchronized live from the global vault. Curated for the top 1% of scholars.
                  </>
                )}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-10">
                <a 
                  href="#discovery" 
                  className="group flex items-center space-x-3 rounded-full bg-primary px-12 py-5 font-black text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95 shadow-[0_20px_50px_rgba(229,9,20,0.3)]"
                >
                  <Play className="h-6 w-6 fill-white" />
                  <span className="uppercase tracking-widest text-lg italic">Browse Vault</span>
                </a>
                <button className="flex items-center space-x-3 rounded-full bg-white/5 px-12 py-5 font-black text-white backdrop-blur-3xl border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 transform active:scale-95 group">
                  <Info className="h-6 w-6 text-white/50 group-hover:text-white" />
                  <span className="uppercase tracking-widest text-lg">System Specs</span>
                </button>
              </div>

              {/* Live Ticker */}
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
                <div className="hidden md:block space-y-1">
                  <span className="text-white/30 text-[9px] font-black uppercase tracking-[0.3em]">Global Vault Uptime</span>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-black font-heading text-white tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">99.9%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-[#141414] via-[#141414] to-transparent z-20" />
      </section>

      {/* Discovery Feed */}
      <section id="discovery" className="relative z-30">
        <DiscoveryFeed 
          categories={(categories as any) || []} 
          trendingDecks={(trendingDecks as any) || []} 
          userProgress={(userProgress as any) || []}
        />
      </section>
    </div>
  );
}
