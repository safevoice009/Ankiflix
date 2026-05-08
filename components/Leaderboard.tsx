"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Trophy, Target, Zap, Loader2, User } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  username: string | null;
  avatar_url: string | null;
  neural_score: number;
  decks_mastered: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to changes in user_deck_progress to refresh leaderboard
    const channel = supabase
      .channel('leaderboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_deck_progress' },
        () => fetchLeaderboard()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLeaderboard = async () => {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(10);

    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#141414]/50 backdrop-blur-3xl p-8">
      <div className="mb-10 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-heading text-4xl font-black uppercase tracking-tighter text-white">
            Global <span className="text-primary italic">Intelligence</span> Rank
          </h2>
          <p className="text-sm font-bold uppercase tracking-widest text-white/40">Neural Sync Performance</p>
        </div>
        <Trophy className="h-10 w-10 text-primary animate-pulse" />
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div 
            key={entry.id}
            className={cn(
              "group relative flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10",
              index === 0 && "border-primary/20 bg-primary/5 shadow-[0_0_50px_rgba(229,9,20,0.1)]"
            )}
          >
            <div className="flex items-center space-x-6">
              <span className={cn(
                "w-8 text-2xl font-black italic tracking-tighter transition-colors",
                index === 0 ? "text-primary" : "text-white/20 group-hover:text-white/40"
              )}>
                {String(index + 1).padStart(2, '0')}
              </span>
              
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-white/10 group-hover:border-white/30 transition-all">
                {entry.avatar_url ? (
                  <Image src={entry.avatar_url} alt={entry.username || ""} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5">
                    <User className="h-6 w-6 text-white/20" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                  {entry.username || `Agent_${entry.id.slice(0, 4)}`}
                </h3>
                <div className="flex items-center space-x-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <span className="flex items-center space-x-1">
                    <Target className="h-3 w-3 text-primary" />
                    <span>{entry.decks_mastered} Decks Mastered</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center justify-end space-x-2">
                <Zap className="h-4 w-4 fill-primary text-primary" />
                <span className="text-2xl font-black italic tracking-tighter text-white">
                  {Math.round(entry.neural_score).toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Neural Load</p>
            </div>

            {/* Rank Gradient for Top 1 */}
            {index === 0 && (
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-50" />
            )}
          </div>
        ))}
        
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
             <div className="h-20 w-20 rounded-full bg-white/5 flex items-center justify-center">
                <Target className="h-10 w-10 text-white/10" />
             </div>
             <p className="text-white/40 font-bold uppercase tracking-widest text-xs">No synchronization data available</p>
          </div>
        )}
      </div>
    </div>
  );
}
