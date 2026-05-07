"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import DeckCard from "./DeckCard";

interface Deck {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  ranking?: number;
  total_cards?: number;
}

interface DeckRowProps {
  title: string;
  decks: Deck[];
  onDeckClick: (deck: Deck) => void;
}

export default function DeckRow({ title, decks, onDeckClick }: DeckRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: "left" | "right") => {
    setIsMoved(true);

    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 group/row relative z-10 -mt-24 md:-mt-32 pb-12">
      <h2 className="px-4 text-xl font-black text-[#e5e5e5] transition duration-200 hover:text-white md:px-12 md:text-3xl font-heading tracking-tight">
        {title}
      </h2>
      <div className="relative group">
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 z-40 w-12 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm",
            !isMoved && "hidden"
          )}
          onClick={() => handleClick("left")}
        >
          <ChevronLeft className="h-10 w-10 text-white transition hover:scale-125" />
        </div>

        <div
          ref={rowRef}
          className="flex items-center space-x-2 overflow-x-scroll scrollbar-hide md:space-x-4 md:px-12 pb-8 pt-4 snap-x snap-proximity"
        >
          {decks.map((deck) => (
            <div key={deck.id} className="snap-start">
              <DeckCard 
                deck={deck} 
                onClick={onDeckClick} 
              />
            </div>
          ))}
        </div>

        <div 
          className="absolute right-0 top-0 bottom-0 z-40 w-12 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
          onClick={() => handleClick("right")}
        >
          <ChevronRight className="h-10 w-10 text-white transition hover:scale-125" />
        </div>
      </div>
    </div>
  );
}
