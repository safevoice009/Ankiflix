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
  mastery?: number; // 0 to 100
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

        {/* Netflix-style Progress Bar */}
        {deck.mastery !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-primary transition-all duration-1000" 
              style={{ width: `${deck.mastery}%` }} 
            />
          </div>
        )}
      </AspectRatio>

      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 0 }}
            animate={{ opacity: 1, scale: 1.2, y: -40 }}
            exit={{ opacity: 0, scale: 0.9, y: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="absolute inset-x-[-15%] top-[-10%] z-50 h-auto min-w-[320px] rounded-xl bg-[#181818] shadow-[0_30px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(229,9,20,0.15)] overflow-hidden border border-white/20"
          >
            <AspectRatio ratio={16 / 9}>
              <div 
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${thumbnailUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                <Badge className="bg-primary text-[8px] font-black uppercase tracking-tighter h-4 px-1 rounded-sm border-none">Most Popular</Badge>
              </div>
            </AspectRatio>

            <div className="p-5 space-y-4">
              <div className="flex items-center space-x-2">
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black transition hover:bg-white/90 shadow-lg">
                  <Play className="h-5 w-5 fill-black" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 transition hover:border-white text-white hover:bg-white/5">
                  <Plus className="h-5 w-5" />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 transition hover:border-white text-white hover:bg-white/5">
                  <ThumbsUp className="h-5 w-5" />
                </button>
                <button className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 transition hover:border-white text-white hover:bg-white/5">
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 text-xs font-black">
                  <span className="text-green-500">{deck.ranking ? Math.round(deck.ranking * 20) : 98}% Match</span>
                  <span className="text-white border border-white/30 px-1.5 text-[9px] rounded-sm bg-white/5">4K Ultra HD</span>
                  <span className="text-white/60">{deck.total_cards ? `${deck.total_cards} Cards` : 'Premium Content'}</span>
                </div>
                
                <h3 className="text-lg font-black text-white leading-tight font-heading tracking-tight">{deck.title}</h3>
                
                <p className="text-[10px] text-white/50 leading-relaxed line-clamp-3 font-medium">
                  {deck.description || "This premium Anki deck has been scientifically designed to optimize your long-term retention and exam performance. Features high-quality images and clear explanations."}
                </p>
                
                <div className="flex flex-wrap gap-2 pt-1">
                   <span className="text-[9px] font-bold text-white/80">Intense</span>
                   <span className="text-white/20">•</span>
                   <span className="text-[9px] font-bold text-white/80">Highly Recommended</span>
                   <span className="text-white/20">•</span>
                   <span className="text-[9px] font-bold text-white/80">Top 1%</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
