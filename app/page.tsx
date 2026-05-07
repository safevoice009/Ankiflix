import { Play, Info } from "lucide-react";
import Image from "next/image";
import DiscoveryFeed from "@/components/DiscoveryFeed";
import { supabase } from "@/lib/supabase";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ankiflix — Discover Premium Anki Decks",
  description: "The Netflix of Anki decks. Search, discover, and download high-quality flashcard sets for Medical, Law, Languages, and more.",
  keywords: ["Anki", "Flashcards", "Medical Study", "NEET PG", "Language Learning", "Education"],
};

export default async function Home() {
  // Fetch categories with their decks
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, decks(*)');

  const { data: trendingDecks } = await supabase
    .from('decks')
    .select('*')
    .order('ranking', { ascending: false })
    .limit(10);

  return (
    <div className="relative min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[95vh] w-full overflow-hidden bg-cinematic-gradient">
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

        <div className="relative z-10 flex h-full flex-col justify-center px-4 md:px-12">
          <div className="max-w-[1400px] mx-auto w-full">
            <div className="max-w-4xl space-y-10 animate-fade-in pt-20">
              <div className="flex items-center space-x-3">
                <div className="h-[2px] w-12 bg-primary shadow-[0_0_15px_rgba(229,9,20,1)]" />
                <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px]">Intelligence Unlocked</span>
                <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest border-l border-white/10 pl-3">Phase 2: Discovery Engine</span>
              </div>
              
              <div className="space-y-4">
                <h1 className="font-heading text-[12vw] font-black tracking-tighter md:text-8xl lg:text-9xl leading-[0.8] text-white uppercase italic">
                  THE <span className="text-primary not-italic">ULTIMATE</span> <br />
                  <span className="text-white">PREMIERE</span> <br />
                  OF ACADEMIA
                </h1>
              </div>
              
              <p className="text-lg text-white/60 md:text-2xl max-w-2xl font-medium font-sans leading-relaxed">
                Streamline your mastery. Access the world's most high-authority Anki libraries curated for the 
                top 1% of Medical, Law, and Engineering scholars. 
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-10">
                <a 
                  href="#discovery" 
                  className="group flex items-center space-x-3 rounded-full bg-primary px-12 py-5 font-black text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95 shadow-[0_20px_50px_rgba(229,9,20,0.3)]"
                >
                  <Play className="h-6 w-6 fill-white" />
                  <span className="uppercase tracking-widest text-lg italic">Access Vault</span>
                </a>
                <button className="flex items-center space-x-3 rounded-full bg-white/5 px-12 py-5 font-black text-white backdrop-blur-3xl border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 transform active:scale-95 group">
                  <Info className="h-6 w-6 text-white/50 group-hover:text-white" />
                  <span className="uppercase tracking-widest text-lg">Platform Intel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent z-20" />
      </section>

      {/* Discovery Feed */}
      <section id="discovery">
        <DiscoveryFeed 
          categories={(categories as any) || []} 
          trendingDecks={(trendingDecks as any) || []} 
        />
      </section>
    </div>
  );
}
