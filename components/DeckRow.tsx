"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Deck {
  id: string;
  title: string;
  thumbnail_url?: string;
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
    <div className="h-40 space-y-0.5 md:space-y-2">
      <h2 className="w-56 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
        {title}
      </h2>
      <div className="group relative md:-ml-2">
        <ChevronLeft
          className={cn(
            "absolute top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100",
            !isMoved && "hidden"
          )}
          onClick={() => handleClick("left")}
        />

        <div
          ref={rowRef}
          className="flex items-center space-x-0.5 overflow-x-scroll no-scrollbar md:space-x-2.5 md:p-2"
        >
          {decks.map((deck) => (
            <motion.div
              key={deck.id}
              className="relative h-28 min-w-[180px] cursor-pointer transition duration-200 ease-out md:h-36 md:min-w-[260px] md:hover:scale-105"
              whileHover={{ scale: 1.05 }}
              onClick={() => onDeckClick(deck)}
            >
              <div 
                className="absolute inset-0 rounded-sm bg-card bg-cover bg-center" 
                style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
              />
              <div className="absolute inset-0 flex items-end p-2 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-xs font-bold md:text-sm">{deck.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <ChevronRight
          className="absolute top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100"
          onClick={() => handleClick("right")}
        />
      </div>
    </div>
  );
}
