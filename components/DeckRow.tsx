"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
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
  isSpecial?: boolean;
}

export default function DeckRow({ title, decks, onDeckClick, isSpecial }: DeckRowProps) {
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
    <div className={cn(
      "space-y-4 md:space-y-6 group/row relative z-10 pb-12 transition-all duration-500",
      isSpecial && "relative before:absolute before:inset-0 before:bg-primary/5 before:pointer-events-none"
    )}>
      <div className="flex items-center space-x-3 px-4 md:px-12">
        {isSpecial && (
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
          </div>
        )}
        <h2 className={cn(
          "text-xl font-black transition duration-200 hover:text-white md:text-3xl font-heading tracking-tight",
          isSpecial ? "text-primary" : "text-[#e5e5e5]"
        )}>
          {title}
        </h2>
        {isSpecial && <Sparkles className="h-5 w-5 text-primary/50 animate-pulse" />}
      </div>

      <div className="relative group">
        {/* Left Scroll Trigger */}
        <div 
          className={cn(
            "absolute left-0 top-0 bottom-0 z-40 w-12 md:w-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-black/50 bg-gradient-to-r from-[#141414] to-transparent",
            !isMoved && "hidden"
          )}
          onClick={() => handleClick("left")}
        >
          <ChevronLeft className="h-10 w-10 text-white transition hover:scale-125" />
        </div>

        <div
          ref={rowRef}
          className="flex items-center space-x-2 overflow-x-scroll no-scrollbar md:space-x-4 md:px-12 pb-8 pt-4 snap-x snap-proximity"
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

        {/* Right Scroll Trigger */}
        <div 
          className="absolute right-0 top-0 bottom-0 z-40 w-12 md:w-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer hover:bg-black/50 bg-gradient-to-l from-[#141414] to-transparent"
          onClick={() => handleClick("right")}
        >
          <ChevronRight className="h-10 w-10 text-white transition hover:scale-125" />
        </div>
      </div>
    </div>
  );
}
