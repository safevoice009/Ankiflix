"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/DeckCard";
import DeckModal from "@/components/DeckModal";
import { notFound } from "next/navigation";

import { Deck } from "@/lib/types";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export default function CategoryPage({ params: paramsPromise }: { params: Promise<{ slug: string }> }) {
  const params = use(paramsPromise);
  const [category, setCategory] = useState<Category | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    async function fetchData() {
      const { data: cat } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", params.slug)
        .single();

      if (!cat) {
        setLoading(false);
        return;
      }

      setCategory(cat);

      const { data: d } = await supabase
        .from("decks")
        .select("*")
        .eq("category_id", cat.id)
        .order("ranking", { ascending: false });

      setDecks(d || []);
      setLoading(false);
    }

    fetchData();
  }, [params.slug]);

  if (loading) return (
    <div className="min-h-screen bg-[#141414] pt-40 px-4 md:px-12">
      <div className="max-w-[1400px] mx-auto space-y-20">
        <div className="space-y-6">
          <div className="h-4 w-32 bg-white/5 animate-pulse rounded-md" />
          <div className="h-24 w-3/4 bg-white/5 animate-pulse rounded-md" />
          <div className="h-6 w-1/2 bg-white/5 animate-pulse rounded-md" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[16/9] bg-white/5 animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );

  if (!category) notFound();

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      
      {/* Cinematic Header */}
      <div className="relative pt-40 pb-20 px-4 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-50" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[150px] -z-10 rounded-full" />
        
        <div className="max-w-[1400px] mx-auto relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px w-12 bg-primary" />
            <span className="text-primary font-black uppercase tracking-[0.4em] text-xs">
              CATEGORY ARCHIVE
            </span>
          </div>
          
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-none mb-6">
            {category.name} <span className="text-primary italic">VAULT</span>
          </h1>
          
          <p className="text-white/40 text-sm md:text-lg max-w-3xl font-medium leading-relaxed uppercase tracking-wide">
            {category.description || `High-authority Anki mastery decks for ${category.name}. Curated for excellence.`}
          </p>
        </div>
      </div>

      {/* Grid Section */}
      <div className="px-4 md:px-12 pb-32">
        <div className="max-w-[1400px] mx-auto">
          <div className="flex items-center justify-between mb-12 border-b border-white/5 pb-8">
            <h2 className="font-heading text-2xl font-black uppercase tracking-widest text-white/60">
              {decks.length} Premium Decks Available
            </h2>
            <div className="flex gap-2">
              {/* Add sorting options here if needed */}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
            {decks.map((deck) => (
              <DeckCard 
                key={deck.id} 
                deck={deck} 
                onClick={() => setSelectedDeck(deck)} 
              />
            ))}
          </div>

          {decks.length === 0 && (
            <div className="py-40 text-center">
              <div className="inline-block p-12 rounded-3xl bg-[#181818] border border-white/5 shadow-2xl">
                <p className="text-white/20 font-black uppercase tracking-[0.3em] text-sm">
                  Catalog Empty
                </p>
                <h3 className="font-heading text-4xl mt-4 text-white/40">COMING SOON</h3>
              </div>
            </div>
          )}
        </div>
      </div>

      <DeckModal 
        deck={selectedDeck} 
        isOpen={!!selectedDeck} 
        onClose={() => setSelectedDeck(null)} 
      />
    </div>
  );
}
