"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Plus, ThumbsUp, X } from "lucide-react";
import Image from "next/image";

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

export default function DeckModal({ deck, isOpen, onClose }: DeckModalProps) {
  if (!deck) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl overflow-hidden rounded-md bg-[#181818] p-0 text-foreground border-none">
        <div className="relative h-64 w-full">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent" />
          
          <div className="absolute bottom-6 left-6 space-y-4">
            <h2 className="text-3xl font-bold md:text-4xl">{deck.title}</h2>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 rounded-md bg-white px-8 py-2 font-bold text-black transition hover:bg-white/90">
                <Play className="h-5 w-5 fill-black" />
                <span>Download</span>
              </button>
              <button className="rounded-full border-2 border-muted-foreground/50 p-2 transition hover:border-white">
                <Plus className="h-5 w-5" />
              </button>
              <button className="rounded-full border-2 border-muted-foreground/50 p-2 transition hover:border-white">
                <ThumbsUp className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 p-6 md:grid-cols-3">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center space-x-2 text-sm font-semibold">
              <span className="text-green-500">{deck.ranking ? Math.round(deck.ranking * 20) : 95}% Match</span>
              <span className="text-muted-foreground">2024</span>
              <span className="border border-muted-foreground/50 px-1 text-[10px]">HD</span>
            </div>
            <p className="text-lg leading-relaxed">{deck.description || "No description available."}</p>
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground">Stats: </span>
              <span>{deck.total_cards?.toLocaleString() || "N/A"} Cards</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tags: </span>
              <span className="hover:underline cursor-pointer">Education, Memory, Active Recall</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
