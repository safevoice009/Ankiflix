"use client";

import { useState, useEffect } from "react";
import { Plus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  deckId: string;
  className?: string;
  iconClassName?: string;
}

export default function FavoriteButton({ deckId, className, iconClassName }: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function checkFavorite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('deck_id', deckId)
        .single();
      
      if (data) setIsFavorite(true);
    }
    checkFavorite();
  }, [deckId]);

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Please log in to add to your list");
      return;
    }

    setIsUpdating(true);
    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('deck_id', deckId);
        setIsFavorite(false);
        toast.success("Removed from My List");
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, deck_id: deckId });
        setIsFavorite(true);
        toast.success("Added to My List");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <button 
      onClick={toggleFavorite}
      disabled={isUpdating}
      className={cn(
        "flex items-center justify-center rounded-full transition disabled:opacity-50",
        className
      )}
    >
      {isFavorite ? (
        <Check className={cn("h-6 w-6", iconClassName)} />
      ) : (
        <Plus className={cn("h-6 w-6", iconClassName)} />
      )}
    </button>
  );
}
