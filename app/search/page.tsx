"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import DeckRow from "@/components/DeckRow";
import DeckModal from "@/components/DeckModal";
import Navbar from "@/components/Navbar";

interface Deck {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  ranking?: number;
  total_cards?: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [results, setResults] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchResults() {
      if (!query) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .ilike('title', `%${query}%`);
      
      if (!error) setResults(data || []);
      setLoading(false);
    }
    fetchResults();
  }, [query]);

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12">
      <Navbar />
      
      <div className="space-y-8">
        <h1 className="text-2xl font-medium text-muted-foreground">
          {query ? `Search results for "${query}"` : "Enter a search term"}
        </h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((deck) => (
              <div 
                key={deck.id} 
                className="group relative cursor-pointer overflow-hidden rounded-md transition duration-300 hover:scale-105"
                onClick={() => handleDeckClick(deck)}
              >
                <div 
                  className="aspect-video w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${deck.thumbnail_url})` }}
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                  <span className="text-white font-medium">View Deck</span>
                </div>
                <div className="p-2">
                   <h3 className="text-sm font-medium truncate">{deck.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : query ? (
          <div className="py-20 text-center text-muted-foreground">
            No decks found matching your search.
          </div>
        ) : null}
      </div>

      <DeckModal 
        deck={selectedDeck} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 px-4 md:px-12">
        <Navbar />
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
