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
      <section className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-cinematic-gradient">
        {/* Background Particles */}
        <div className="absolute inset-0 z-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="particle"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                bottom: `-${Math.random() * 20}%`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                animationDelay: `${Math.random() * 20}s`,
              }}
            />
          ))}
        </div>

        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 netflix-gradient" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-end pb-20 px-4 md:justify-center md:pb-0 md:px-12">
          <div className="max-w-3xl space-y-4 md:space-y-6 animate-fade-in">
            <h1 className="text-4xl font-extrabold tracking-tighter md:text-7xl lg:text-8xl leading-none">
              MASTER YOUR <span className="text-white">EXAMS</span> <br className="hidden md:block" />
              <span className="text-primary italic">ANKIFLIX</span> STYLE
            </h1>
            <p className="text-base text-foreground/80 md:text-xl max-w-xl font-medium">
              Discover the world's most effective flashcard sets. Curated for Medical, Law, and Beyond.
              Start learning with the platform that treats your preparation like a premiere.
            </p>
            
            <div className="flex items-center space-x-3 pt-4">
              <a 
                href="#discovery" 
                className="flex items-center space-x-2 rounded-md bg-white px-8 py-3 font-bold text-black transition hover:bg-white/90 transform active:scale-95"
              >
                <Play className="h-6 w-6 fill-black" />
                <span>Browse Now</span>
              </a>
              <button className="flex items-center space-x-2 rounded-md bg-white/10 px-8 py-3 font-bold text-white backdrop-blur-xl border border-white/20 transition hover:bg-white/20 transform active:scale-95">
                <Info className="h-6 w-6" />
                <span>Learn More</span>
              </button>
            </div>
          </div>
        </div>
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
