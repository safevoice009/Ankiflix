"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/DeckCard";
import DeckModal from "@/components/DeckModal";
import Navbar from "@/components/Navbar";
import { Sparkles } from "lucide-react";

export default function NewAndPopularPage() {
  const [decks, setDecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchNewDecks() {
      const { data } = await supabase
        .from("decks")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      
      if (data) setDecks(data);
      setLoading(false);
    }
    fetchNewDecks();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-40 px-4 md:px-12 pb-32">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="space-y-4 border-b border-white/5 pb-12">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Recent Indexing</span>
          </div>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
            NEW & <span className="text-primary italic">POPULAR</span>
          </h1>
          <p className="text-white/40 text-lg max-w-2xl font-medium">
            The latest intelligence drops in the Ankiflix ecosystem. Optimized for the upcoming exam season.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-[0_0_20px_rgba(229,9,20,0.2)]" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-in slide-in-from-bottom-8 duration-1000">
            {decks.map((deck) => (
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
