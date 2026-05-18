"use client";

import { useState } from "react";
import DeckCard from "./DeckCard";
import DeckModal from "./DeckModal";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Deck } from "@/lib/types";

interface ProfileFeedProps {
  favoriteDecks: Deck[];
}

export default function ProfileFeed({ favoriteDecks }: ProfileFeedProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsModalOpen(true);
  };

  if (favoriteDecks.length === 0) {
    return (
      <div className="py-32 text-center space-y-6">
        <div className="mx-auto h-24 w-24 rounded-full bg-white/5 flex items-center justify-center">
          <Plus className="h-12 w-12 text-white/20" />
        </div>
        <div className="space-y-2">
          <p className="text-white/60 text-xl font-medium">Your list is currently empty.</p>
          <p className="text-white/30 text-sm max-w-md mx-auto">
            Explore thousands of decks and click the &quot;+&quot; icon to save them here for quick access later.
          </p>
        </div>
        <Link 
          href="/" 
          className="inline-block bg-white text-black px-8 py-3 font-bold rounded-md hover:bg-white/90 transition"
        >
          Start Exploring
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {favoriteDecks.map((deck) => (
          <DeckCard 
            key={deck.id} 
            deck={deck} 
            onClick={handleDeckClick} 
          />
        ))}
      </div>

      <DeckModal 
        deck={selectedDeck} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
