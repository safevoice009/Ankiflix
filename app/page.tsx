import { Play, Info } from "lucide-react";
import Image from "next/image";
import DiscoveryFeed from "@/components/DiscoveryFeed";
import { supabase } from "@/lib/supabase";

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
      <section className="relative h-[95vh] w-full">
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

        <div className="relative flex h-full flex-col justify-center px-4 md:px-12">
          <div className="max-w-2xl space-y-6 animate-fade-in">
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              Master Your Exams <br />
              <span className="text-primary">One Card at a Time</span>
            </h1>
            <p className="text-lg text-foreground/80 md:text-xl">
              Discover the world's best educational Anki decks. Curated by experts, 
              ranked by students, and built for high-performance learning.
            </p>
            
            <div className="flex items-center space-x-3 pt-4">
              <button className="flex items-center space-x-2 rounded-md bg-white px-8 py-3 font-bold text-black transition hover:bg-white/90">
                <Play className="h-6 w-6 fill-black" />
                <span>Browse Decks</span>
              </button>
              <button className="flex items-center space-x-2 rounded-md bg-[#505050]/50 px-8 py-3 font-bold text-white backdrop-blur-md transition hover:bg-[#505050]/80">
                <Info className="h-6 w-6" />
                <span>More Info</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Discovery Feed */}
      <DiscoveryFeed 
        categories={(categories as any) || []} 
        trendingDecks={(trendingDecks as any) || []} 
      />
    </div>
  );
}
