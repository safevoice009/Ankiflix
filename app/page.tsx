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
      <section className="relative h-[85vh] md:h-[95vh] w-full">
        <div className="absolute inset-0">
          <Image
            src="/hero-bg.png"
            alt="Ankiflix Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 hero-gradient" />
          <div className="absolute inset-0 netflix-gradient" />
        </div>

        <div className="relative flex h-full flex-col justify-end pb-20 px-4 md:justify-center md:pb-0 md:px-12">
          <div className="max-w-2xl space-y-4 md:space-y-6 animate-fade-in">
            <h1 className="text-3xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Master Your Exams <br className="hidden md:block" />
              <span className="text-primary">One Card at a Time</span>
            </h1>
            <p className="text-base text-foreground/80 md:text-xl line-clamp-3 md:line-clamp-none">
              Discover the world's best educational Anki decks. Curated by experts, 
              ranked by students, and built for high-performance learning.
            </p>
            
            <div className="flex items-center space-x-2 md:space-x-3 pt-2 md:pt-4">
              <a 
                href="#discovery" 
                className="flex items-center space-x-2 rounded-md bg-white px-6 py-2 md:px-8 md:py-3 font-bold text-black transition hover:bg-white/90"
              >
                <Play className="h-5 w-5 md:h-6 md:w-6 fill-black" />
                <span className="text-sm md:text-base">Browse Decks</span>
              </a>
              <button className="flex items-center space-x-2 rounded-md bg-[#505050]/50 px-6 py-2 md:px-8 md:py-3 font-bold text-white backdrop-blur-md transition hover:bg-[#505050]/80">
                <Info className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-sm md:text-base">More Info</span>
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
