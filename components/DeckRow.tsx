"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Play, Plus, ThumbsUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

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
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

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
          {decks.map((deck, index) => (
            <motion.div
              key={deck.id}
              layoutId={deck.id}
              className="relative h-28 min-w-[200px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px]"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onDeckClick(deck)}
            >
              <div 
                className="h-full w-full rounded-sm bg-cover bg-center object-cover md:rounded" 
                style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
              />
              
              <AnimatePresence>
                {hoveredIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 0 }}
                    animate={{ opacity: 1, scale: 1.1, y: -20 }}
                    exit={{ opacity: 0, scale: 0.8, y: 0 }}
                    className="absolute inset-0 z-50 h-full w-full rounded-md bg-[#181818] shadow-2xl"
                  >
                    <div 
                      className="h-3/5 w-full rounded-t-md bg-cover bg-center"
                      style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
                    />
                    <div className="p-3 space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white transition hover:bg-white/80">
                          <Play className="h-3 w-3 fill-black text-black" />
                        </div>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/50 p-1 transition hover:border-white">
                          <Plus className="h-3 w-3" />
                        </div>
                        <div className="ml-auto flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/50 p-1 transition hover:border-white">
                          <ThumbsUp className="h-3 w-3" />
                        </div>
                      </div>
                      <div className="text-[10px] font-bold text-green-500">
                        {deck.ranking ? Math.round(deck.ranking * 20) : 95}% Match
                      </div>
                      <div className="text-[10px] font-bold text-white truncate">
                        {deck.title}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
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
