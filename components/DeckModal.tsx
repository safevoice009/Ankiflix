"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Plus, ThumbsUp, X, Check } from "lucide-react";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";

interface Deck {
  id: string;
  title: string;
  description?: string;
  thumbnail_url?: string;
  ranking?: number;
  total_cards?: number;
  anki_link?: string;
}

interface DeckModalProps {
  deck: Deck | null;
  isOpen: boolean;
  onClose: () => void;
}

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function DeckModal({ deck, isOpen, onClose }: DeckModalProps) {

  if (!deck) return null;

  const handleDownload = () => {
    if (deck.anki_link) {
      window.open(deck.anki_link, "_blank");
    } else {
      window.open(
        `https://ankiweb.net/shared/decks?search=${encodeURIComponent(deck.title)}`,
        "_blank"
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl overflow-hidden rounded-xl bg-[#141414] p-0 text-white border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]">
        <div className="relative h-[450px] w-full">
          {deck.thumbnail_url ? (
            <Image 
              src={deck.thumbnail_url} 
              alt={deck.title} 
              fill 
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 to-black flex items-center justify-center">
               <span className="font-heading text-4xl opacity-20">ANKIFLIX</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-black/50 hover:bg-black/80 transition"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="absolute bottom-10 left-10 right-10 space-y-6">
            <DialogHeader>
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded-sm">Premium Deck</span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{deck.total_cards ? `${deck.total_cards} Cards` : 'New Release'}</span>
              </div>
              <DialogTitle className="font-heading text-5xl md:text-7xl font-extrabold tracking-tighter text-white drop-shadow-2xl">
                {deck.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                {deck.description || "Details about the selected Anki deck."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center space-x-4">
              <button 
                onClick={handleDownload}
                className="flex items-center space-x-2 rounded-md bg-white px-10 py-3 font-black text-black transition hover:bg-white/90 transform active:scale-95 shadow-xl"
              >
                <Play className="h-6 w-6 fill-black" />
                <span className="uppercase tracking-tighter text-lg">Download Now</span>
              </button>
              <FavoriteButton 
                deckId={deck.id} 
                className="h-12 w-12 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition hover:border-white"
                iconClassName="h-6 w-6"
              />
              <button className="h-12 w-12 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition hover:border-white">
                <ThumbsUp className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 p-10 md:grid-cols-12 bg-gradient-to-b from-[#141414] to-[#0a0a0a]">
          <div className="col-span-8 space-y-6">
            <div className="flex items-center space-x-4 text-sm font-bold">
              <span className="text-green-500">{deck.ranking ? Math.round(deck.ranking * 20) : 98}% Match</span>
              <span className="text-white/60">2024</span>
              <span className="border border-white/30 px-1.5 text-[10px] rounded-sm bg-white/5 font-black">4K</span>
              <span className="text-white/60">English</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl leading-relaxed text-white/90 font-sans">
                {deck.description || "This premium Anki deck has been scientifically designed to optimize your long-term retention and exam performance. It includes high-yield facts, clear diagrams, and comprehensive coverage of the subject matter."}
              </p>
            </div>
          </div>

          <div className="col-span-4 space-y-6 text-sm font-sans">
            <div className="space-y-1">
              <span className="text-white/40 block uppercase tracking-widest text-[10px] font-black">Subject Matter:</span>
              <span className="text-white/90 font-bold">Medical, Anatomy, USMLE Step 1</span>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block uppercase tracking-widest text-[10px] font-black">Tags:</span>
              <span className="text-white/90 font-bold flex flex-wrap gap-1">
                {["High Yield", "Clinically Relevant", "Essential"].map(tag => (
                  <span key={tag} className="hover:underline cursor-pointer">{tag},</span>
                ))}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block uppercase tracking-widest text-[10px] font-black">This deck is:</span>
              <span className="text-white/90 font-bold italic">Intense, Professional, Verified</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
