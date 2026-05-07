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
    <div className="space-y-2 md:space-y-4">
      <h2 className="px-4 text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:px-0 md:text-2xl">
        {title}
      </h2>
      <div className="group relative">
        <ChevronLeft
          className={cn(
            "absolute bottom-0 left-2 top-0 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 md:left-[-40px]",
            !isMoved && "hidden"
          )}
          onClick={() => handleClick("left")}
        />

        <div
          ref={rowRef}
          className="flex items-center space-x-1 overflow-x-scroll scrollbar-hide md:space-x-2 md:p-2"
        >
          {decks.map((deck) => (
            <DeckCard 
              key={deck.id} 
              deck={deck} 
              onClick={onDeckClick} 
            />
          ))}
        </div>

        <ChevronRight
          className="absolute bottom-0 right-2 top-0 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 md:right-[-40px]"
          onClick={() => handleClick("right")}
        />
      </div>
    </div>
  );
}
