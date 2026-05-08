"use client";

import { User, Zap, Target, BrainCircuit, ShieldCheck, Share2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface IdentityCardProps {
  profile: {
    username: string | null;
    avatar_url: string | null;
    neural_score: number;
    decks_mastered: number;
    rank_title?: string;
  };
  isOwner?: boolean;
}

export default function IdentityCard({ profile, isOwner }: IdentityCardProps) {
  const rank = profile.neural_score > 1000 ? "Elite Intelligence" : profile.neural_score > 500 ? "Advanced Agent" : "Novice Agent";

  return (
    <div className="relative group max-w-sm w-full perspective-1000">
      <div className="relative transform-gpu transition-all duration-700 preserve-3d group-hover:rotate-y-12">
        {/* Card Background with Glassmorphism */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
          {/* Animated Background Pulse */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
          
          <div className="relative z-10 space-y-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Verified Agent</span>
              </div>
              <Share2 className="h-4 w-4 text-white/20 hover:text-white cursor-pointer transition" />
            </div>

            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative h-24 w-24 rounded-full p-1 bg-gradient-to-br from-primary via-primary/50 to-transparent shadow-[0_0_30px_rgba(229,9,20,0.3)]">
                <div className="relative h-full w-full rounded-full overflow-hidden border-4 border-[#141414]">
                  {profile.avatar_url ? (
                    <Image src={profile.avatar_url} alt={profile.username || ""} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/5">
                      <User className="h-10 w-10 text-white/20" />
                    </div>
                  )}
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-4 border-[#141414] animate-pulse" />
              </div>

              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                  {profile.username || "Anonymous Agent"}
                </h2>
                <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] italic">
                  {rank}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Neural Load</p>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-primary fill-primary" />
                  <span className="text-xl font-black italic tracking-tighter">
                    {Math.round(profile.neural_score).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Integration</p>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="text-xl font-black italic tracking-tighter">
                    {profile.decks_mastered} DECKS
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40">
                 <span className="flex items-center gap-1"><BrainCircuit className="h-3 w-3" /> Synaptic Activity</span>
                 <span className="text-primary">Optimized</span>
              </div>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary animate-progress-horizontal" style={{ width: '75%' }} />
              </div>
            </div>
          </div>

          {/* Background Decorative Elements */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[50px] rounded-full -z-10" />
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 blur-[50px] rounded-full -z-10" />
        </div>
      </div>
    </div>
  );
}
