"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import IdentityCard from "@/components/IdentityCard";
import { Loader2, BrainCircuit, ShieldAlert } from "lucide-react";
import DeckCard from "@/components/DeckCard";
import DeckModal from "@/components/DeckModal";
import { Deck } from "@/lib/types";

interface ProfileWithStats {
  id: string;
  username: string | null;
  avatar_url: string | null;
  neural_score: number;
  decks_mastered: number;
}

export default function PublicProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<ProfileWithStats | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!username || Array.isArray(username)) {
      setIsLoading(false);
      return;
    }

    // 1. Fetch profile by username
    const { data: profileData, error: profileError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('username', username)
      .single();

    if (profileError || !profileData) {
      setIsLoading(false);
      return;
    }

    setProfile(profileData);

    // 2. Fetch mastered decks for this user
    const { data: progressData } = await supabase
      .from('user_deck_progress')
      .select('deck_id, ease, repetition')
      .eq('user_id', profileData.id)
      .gt('repetition', 0);

    if (progressData && progressData.length > 0) {
      const deckIds = progressData.map(p => p.deck_id);
      const { data: deckData } = await supabase
        .from('decks')
        .select('*')
        .in('id', deckIds);
      
      setDecks(deckData || []);
    }

    setIsLoading(false);
  }, [username]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const handleDeckClick = (deck: Deck) => {
    setSelectedDeck(deck);
    setIsModalOpen(true);
  };


  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#141414] text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-screen space-y-6">
          <ShieldAlert className="h-20 w-20 text-primary animate-bounce" />
          <h1 className="text-4xl font-black uppercase tracking-tighter">Agent Not Found</h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-xs">The requested neural signature does not exist in our database.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#141414] text-white selection:bg-primary/30">
      <Navbar />
      
      <div className="relative pt-32 pb-20 px-4 md:px-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Identity Column */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-10">
            <IdentityCard profile={profile} />
            
            <div className="w-full space-y-6">
              <h3 className="text-xl font-black uppercase tracking-tighter border-l-4 border-primary pl-4">Intelligence Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/5">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Persistence</span>
                   <span className="font-black text-white italic">High-Yield</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-xl p-4 border border-white/5">
                   <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Sync Rate</span>
                   <span className="font-black text-white italic">94.2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mastery Column */}
          <div className="lg:col-span-8 space-y-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-primary">
                <BrainCircuit className="h-6 w-6" />
                <h2 className="text-4xl font-black uppercase tracking-tighter">Neural Integration</h2>
              </div>
              <p className="text-white/60 font-medium text-lg leading-relaxed">
                Decks successfully integrated into the long-term memory of this agent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {decks.map(deck => (
                <DeckCard key={deck.id} deck={deck} onClick={handleDeckClick} />
              ))}

              
              {decks.length === 0 && (
                <div className="col-span-full py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                   <p className="text-white/40 font-bold uppercase tracking-widest text-sm">No synchronized decks found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <DeckModal 
        deck={selectedDeck} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </main>
  );
}
