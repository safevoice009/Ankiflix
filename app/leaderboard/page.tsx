"use client";

import Navbar from "@/components/Navbar";
import Leaderboard from "@/components/Leaderboard";
import { Sparkles, Activity } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <main className="min-h-screen bg-[#141414] text-white selection:bg-primary/30">
      <Navbar />
      
      <div className="relative pt-32 pb-20 px-4 md:px-10 max-w-7xl mx-auto">
        {/* Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center space-x-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-xs font-black uppercase tracking-[0.3em]">Synapse Protocol Active</span>
            </div>
            <h1 className="font-heading text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">
              Intelligence <br />
              <span className="text-primary italic">Command Center</span>
            </h1>
            <p className="text-xl text-white/60 font-medium leading-relaxed">
              Real-time synchronization of global neural patterns. 
              The most elite intelligence agents, ranked by synaptic load and mastery retention.
            </p>
          </div>
          
          <div className="flex items-center space-x-6 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Activity className="h-6 w-6 text-primary animate-pulse" />
             </div>
             <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Status</p>
                <p className="text-lg font-black uppercase tracking-tighter">Live Neural Sync</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8">
            <Leaderboard />
          </div>
          
          <div className="lg:col-span-4 space-y-10">
            <div className="rounded-2xl border border-white/5 bg-white/5 p-8 space-y-6">
              <h3 className="text-2xl font-black uppercase tracking-tighter">Scoring Protocol</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <p className="font-bold text-white">Synaptic Load</p>
                    <p className="text-xs text-white/40">Base score calculated from successful repetitions.</p>
                  </div>
                  <span className="text-primary font-black">REPS</span>
                </div>
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <p className="font-bold text-white">Efficiency Multiplier</p>
                    <p className="text-xs text-white/40">Ease factor provides an intelligence bonus.</p>
                  </div>
                  <span className="text-primary font-black">EASE</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">Mastery Tier</p>
                    <p className="text-xs text-white/40">Total decks integrated into the permanent memory.</p>
                  </div>
                  <span className="text-primary font-black">DECKS</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-2xl bg-gradient-to-br from-primary to-black p-[1px]">
               <div className="bg-[#141414] rounded-[15px] p-8 space-y-4">
                  <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Join the Elite</h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    Higher synaptic load unlocks exclusive "Intel Drops" and high-authority community features.
                  </p>
                  <button className="w-full py-4 rounded-xl bg-primary font-black uppercase tracking-tighter hover:bg-primary/90 transition shadow-[0_0_30px_rgba(229,9,20,0.3)]">
                    Sync My Progress
                  </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
