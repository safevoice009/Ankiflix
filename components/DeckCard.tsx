"use client";

import { Play, Plus, ThumbsUp, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Deck {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  ranking?: number;
  total_cards?: number;
}

interface DeckCardProps {
  deck: Deck;
  onClick: (deck: Deck) => void;
}

const FALLBACK_IMAGES: Record<string, string> = {
  Medical: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400",
  Law: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400",
  Languages: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400",
  Coding: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
  History: "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=400",
  Science: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400",
  Math: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400",
  Default: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
};

export default function DeckCard({ deck, onClick }: DeckCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const thumbnailUrl = deck.thumbnail_url || FALLBACK_IMAGES.Default;

  return (
    <div
      className="relative h-28 min-w-[200px] cursor-pointer md:h-36 md:min-w-[260px]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(deck)}
    >
      <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-md group">
        <div 
          className="h-full w-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
        
        {/* Badges on main card */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-100 transition-opacity">
          {deck.total_cards && (
            <Badge variant="secondary" className="bg-black/60 text-[10px] backdrop-blur-md border-none text-white px-1 py-0 h-4">
              {deck.total_cards} Cards
            </Badge>
          )}
        </div>
      </AspectRatio>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ opacity: 1, scale: 1.15, y: -40 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="absolute inset-x-[-10%] top-[-10%] z-50 h-[140%] w-[120%] rounded-xl bg-[#181818] shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            <AspectRatio ratio={16 / 9}>
              <div 
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
            </AspectRatio>

            <div className="p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90">
                  <Play className="h-4 w-4 fill-black" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/50 transition hover:border-white text-white">
                  <Plus className="h-4 w-4" />
                </button>
                <button className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/50 transition hover:border-white text-white">
                  <ThumbsUp className="h-4 w-4" />
                </button>
                <button className="ml-auto flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/50 transition hover:border-white text-white">
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  <span className="text-green-500">{deck.ranking ? Math.round(deck.ranking * 20) : 95}% Match</span>
                  <span className="text-white border border-white/20 px-1 text-[10px] rounded-sm">HD</span>
                </div>
                <h3 className="text-sm font-bold text-white line-clamp-1">{deck.title}</h3>
                <div className="flex flex-wrap gap-1">
                   <Badge className="bg-primary/20 text-primary border-none text-[8px] px-1 h-3 uppercase font-bold">Recommended</Badge>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
