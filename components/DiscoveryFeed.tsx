"use client";

import { useState } from "react";
import DeckRow from "./DeckRow";
import DeckModal from "./DeckModal";

interface Deck {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  ranking?: number;
  total_cards?: number;
}

interface Category {
  id: string;
  name: string;
  decks?: Deck[];
}

interface DiscoveryFeedProps {
  categories: Category[];
  trendingDecks: Deck[];
}

export default function DiscoveryFeed({ categories, trendingDecks }: DiscoveryFeedProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsModalOpen(true);
  };

  return (
    <div className="relative -mt-32 space-y-24 pb-20 md:px-12">
      <DeckRow 
        title="Trending Now" 
        decks={trendingDecks} 
        onDeckClick={handleDeckClick}
      />
      
      {categories.map((category) => (
        <DeckRow 
          key={category.id} 
          title={category.name} 
          decks={category.decks || []} 
          onDeckClick={handleDeckClick}
        />
      ))}

      <DeckModal 
        deck={selectedDeck} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
