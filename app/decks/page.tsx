"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/DeckCard";
import DeckModal from "@/components/DeckModal";
import { Deck } from "@/lib/types";

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchDecks() {
      const { data } = await supabase
        .from("decks")
        .select("*")
        .order("ranking", { ascending: false });
      
      if (data) setDecks(data);
      setLoading(false);
    }
    fetchDecks();
  }, []);

  return (
    <div className="min-h-screen bg-[#141414] pt-40 px-4 md:px-12 pb-32">
      
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="space-y-4 border-b border-white/5 pb-12">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-primary shadow-[0_0_10px_rgba(229,9,20,1)]" />
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Strategic Assets</span>
          </div>
          <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tight text-white leading-none">
            FULL <span className="text-primary italic">LIBRARY</span> INTEL
          </h1>
          <p className="text-white/40 text-lg max-w-2xl font-medium">
            Browse our complete intelligence database. Every deck is verified for academic rigor and long-term retention potential.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-40">
            <div className="h-16 w-16 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-16 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-in fade-in duration-700">
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
