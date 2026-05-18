"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { AspectRatio } from "./ui/aspect-ratio";
import { Badge } from "./ui/badge";
import { Deck } from "@/lib/types";

interface RelatedDecksProps {
  deckId: string;
  categoryId: string;
  onDeckClick: (deck: Deck) => void;
}

export default function RelatedDecks({ deckId, categoryId, onDeckClick }: RelatedDecksProps) {
  const [related, setRelated] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      if (!categoryId) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("decks")
        .select("id, anki_id, title, description, thumbnail_url, ranking, total_cards, anki_link, category_id")
        .eq("category_id", categoryId)
        .neq("id", deckId)
        .limit(6);

      if (data) setRelated(data);
      setLoading(false);
    }
    fetchRelated();
  }, [deckId, categoryId]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-white/5" />
        ))}
      </div>
    );
  }

  if (related.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3">
      {related.map((d) => (
        <div 
          key={d.id} 
          onClick={() => onDeckClick(d)}
          className="group cursor-pointer space-y-2 transition-all duration-300 hover:scale-[1.02]"
        >
          <AspectRatio ratio={16 / 9} className="overflow-hidden rounded-lg border border-white/5">
            <div 
              className="h-full w-full bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
              style={{ backgroundImage: `url(${d.thumbnail_url || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400'})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-2 left-2">
               <Badge className="bg-green-500/20 text-green-500 border-none text-[8px] px-1 py-0 h-4">
                 {d.ranking ? Math.round(d.ranking * 20) : 95}% Match
               </Badge>
            </div>
          </AspectRatio>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-white/70 line-clamp-1 group-hover:text-primary transition-colors">
            {d.title}
          </h4>
        </div>
      ))}
    </div>
  );
}
