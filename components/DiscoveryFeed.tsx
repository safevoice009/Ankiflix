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

interface UserProgress {
  id: string;
  deck_id: string;
  interval: number;
  repetition: number;
  ease: number;
  next_review: string;
  decks: Deck;
}

interface DiscoveryFeedProps {
  categories: Category[];
  trendingDecks: Deck[];
  userProgress?: UserProgress[];
}

export default function DiscoveryFeed({ categories, trendingDecks, userProgress = [] }: DiscoveryFeedProps) {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsModalOpen(true);
  };

  // Map progress to mastery percentage for UI
  const calculateMastery = (ease: number) => {
    return Math.min(100, Math.max(0, ((ease - 1.3) / (5.0 - 1.3)) * 100));
  };

  // Filter Due for Review
  const now = new Date();
  const dueDecks = userProgress
    .filter(p => new Date(p.next_review) <= now)
    .map(p => ({
      ...p.decks,
      mastery: calculateMastery(p.ease)
    }));

  // Filter Mastered (High Ease)
  const masteredDecks = userProgress
    .filter(p => p.ease >= 2.8)
    .map(p => ({
      ...p.decks,
      mastery: calculateMastery(p.ease)
    }));

  // Create a general "In Progress" row for decks being studied
  const inProgressDecks = userProgress
    .filter(p => !dueDecks.find(d => d.id === p.deck_id) && !masteredDecks.find(d => d.id === p.deck_id))
    .map(p => ({
      ...p.decks,
      mastery: calculateMastery(p.ease)
    }));

  return (
    <div className="relative -mt-24 space-y-24 pb-20 z-30">
      {/* SRS Powered Rows */}
      {dueDecks.length > 0 && (
        <DeckRow 
          title="Due for Review" 
          decks={dueDecks} 
          onDeckClick={handleDeckClick}
          isSpecial
        />
      )}

      {masteredDecks.length > 0 && (
        <DeckRow 
          title="Mastered Intelligence" 
          decks={masteredDecks} 
          onDeckClick={handleDeckClick}
        />
      )}

      {inProgressDecks.length > 0 && (
        <DeckRow 
          title="In Progress Intelligence" 
          decks={inProgressDecks} 
          onDeckClick={handleDeckClick}
        />
      )}

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
