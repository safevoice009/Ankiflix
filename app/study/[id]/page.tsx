"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateNextReview, DeckProgress } from "@/lib/srs-logic";
import { 
  ChevronLeft, 
  BrainCircuit, 
  Zap, 
  Check, 
  Sparkles, 
  Loader2,
  ThumbsUp,
  RotateCcw,
  ZapOff
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Deck } from "@/lib/types";

interface Card {
  front: string;
  back: string;
}

const FALLBACK_CARDS: Card[] = [
  { front: "What is the primary mechanism of action?", back: "Competitive inhibition of the target enzyme." },
  { front: "Identify the critical pathway involved.", back: "The metabolic cascade initiated by neurotransmitter release." },
  { front: "Common presentation findings?", back: "Acute onset with characteristic visual indicators." },
  { front: "Contraindications for this procedure?", back: "Hypersensitivity to components or unstable vital signs." },
  { front: "Standard follow-up protocol?", back: "Secondary assessment within 24-48 hours post-integration." }
];

export default function StudyPage({ params }: { params: { id: string } }) {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<DeckProgress | null>(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const fetchDeckAndCards = useCallback(async () => {
    const { data: deckData } = await supabase
      .from("decks")
      .select("*")
      .eq("id", params.id)
      .single();

    if (deckData) {
      setDeck(deckData);
      // Use sample_data if available, otherwise fallback
      const deckCards = (deckData.sample_data as { cards?: Card[] } | null)?.cards || FALLBACK_CARDS;
      setCards(deckCards);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: progressData } = await supabase
        .from('user_deck_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('deck_id', params.id)
        .single();
      
      if (progressData) setProgress(progressData);
    }

    setIsLoading(false);
  }, [params.id]);

  useEffect(() => {
    void fetchDeckAndCards();
  }, [fetchDeckAndCards]);

  const handleRate = async (quality: number) => {
    setIsSyncing(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error("Sign in to save neural progress");
      setIsSyncing(false);
      return;
    }

    // Logic for individual card mastery or overall deck mastery
    // For now, we update the deck progress based on the current card rating
    const nextProgress = calculateNextReview(progress, quality);

    const { error } = await supabase
      .from('user_deck_progress')
      .upsert({
        user_id: user.id,
        deck_id: params.id,
        ...nextProgress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,deck_id' });

    if (error) {
      toast.error("Neural sync failed");
    } else {
      setProgress(nextProgress);
      
      // Update streak and neural score in profile
      await supabase.rpc('update_user_stats', { 
        p_user_id: user.id, 
        p_score_delta: quality * 10 
      });

      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setSessionCompleted(true);
      }
    }
    setIsSyncing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
          <Loader2 className="h-16 w-16 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse rounded-full" />
          <div className="h-32 w-32 rounded-full border-4 border-green-500 flex items-center justify-center">
            <Check className="h-16 w-16 text-green-500" />
          </div>
        </div>
        
        <div className="space-y-4 max-w-md">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic">Intelligence <br /><span className="text-primary not-italic">Synchronized</span></h1>
          <p className="text-white/60 font-medium text-lg">Your synaptic pathways for <span className="text-white">&quot;{deck?.title}&quot;</span> have been reinforced. Intelligence indexed in the global neural network.</p>
        </div>

        <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">New Ease</p>
             <p className="text-3xl font-black text-primary">{progress?.ease.toFixed(2) || "2.50"}</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Next Sync</p>
             <p className="text-xl font-black text-white">{progress ? new Date(progress.next_review).toLocaleDateString() : 'Tomorrow'}</p>
          </div>
        </div>

        <div className="flex flex-col w-full max-w-sm gap-4">
          <Link 
            href={`/decks/${params.id}`}
            className="w-full py-5 rounded-2xl bg-white text-black font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all text-center shadow-xl"
          >
            Return to Briefing
          </Link>
          <button 
            onClick={() => {
              setCurrentIndex(0);
              setSessionCompleted(false);
              setIsFlipped(false);
            }}
            className="w-full py-5 rounded-2xl bg-white/5 text-white/60 font-black uppercase tracking-tighter hover:bg-white/10 hover:text-white transition-all text-center border border-white/10"
          >
            Re-initiate Neural Sync
          </button>
        </div>
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30 flex flex-col overflow-hidden">
      
      {/* Top HUD */}
      <div className="flex items-center justify-between p-6 md:p-10 z-50">
        <Link href={`/decks/${params.id}`} className="group flex items-center space-x-3 text-white/40 hover:text-white transition-all">
          <ChevronLeft className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Abort Neural Link</span>
        </Link>

        <div className="flex items-center space-x-8">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Sync Status</span>
            <span className="text-xs font-black uppercase text-primary animate-pulse flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              Intelligence Linking...
            </span>
          </div>
          <div className="h-12 w-[1px] bg-white/10 hidden md:block" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Neural Load</span>
            <span className="text-xl font-black font-heading tracking-tighter italic">{currentIndex + 1} <span className="text-white/20">/ {cards.length}</span></span>
          </div>
        </div>
      </div>

      {/* Progress HUD */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 z-40">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex) / cards.length) * 100}%` }}
          className="h-full bg-primary shadow-[0_0_15px_rgba(229,9,20,1)]"
        />
      </div>

      {/* Main Study Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        
        {/* Background Ambient Particles */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full" />
        </div>

        <div className="w-full max-w-4xl perspective-1000 h-[50vh] md:h-[60vh] relative group">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex + (isFlipped ? "-back" : "-front")}
              initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              onClick={() => setIsFlipped(!isFlipped)}
              className={cn(
                "w-full h-full rounded-[3rem] p-12 md:p-20 flex flex-col items-center justify-center text-center cursor-pointer relative overflow-hidden transition-all duration-700 shadow-2xl border border-white/10 select-none",
                isFlipped ? "bg-gradient-to-br from-white/10 to-white/5" : "bg-[#141414]"
              )}
            >
              {/* Card Hud Decor */}
              <div className="absolute top-8 left-12 flex items-center space-x-3 opacity-20">
                <BrainCircuit className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Node_{params.id.slice(0, 8)}</span>
              </div>
              <div className="absolute bottom-8 right-12 opacity-20">
                <Sparkles className="h-5 w-5" />
              </div>

              {!isFlipped ? (
                <div className="space-y-8 max-w-2xl">
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-4 block">Primary Stimulus</span>
                  <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[0.9] uppercase italic font-heading">
                    {currentCard.front}
                  </h2>
                  <div className="pt-12 flex items-center justify-center">
                    <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] group-hover:bg-white/10 transition-all">
                      Click to Reveal Intelligence
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 max-w-2xl">
                   <span className="text-[10px] font-black text-green-500 uppercase tracking-[0.4em] mb-4 block">Neural Response Verified</span>
                   <h2 className="text-3xl md:text-5xl font-medium leading-relaxed font-sans text-white/90">
                    {currentCard.back}
                  </h2>
                  <div className="pt-12 flex items-center justify-center">
                    <div className="px-6 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-green-500">
                      Rate performance to proceed
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Controls */}
        <div className="mt-12 w-full max-w-4xl min-h-[100px] flex items-center justify-center">
          <AnimatePresence>
            {isFlipped ? (
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-wrap items-center justify-center gap-4"
              >
                {[
                  { label: "Again", val: 0, color: "bg-red-600", icon: RotateCcw },
                  { label: "Hard", val: 2, color: "bg-orange-600", icon: ZapOff },
                  { label: "Good", val: 3, color: "bg-blue-600", icon: ThumbsUp },
                  { label: "Easy", val: 4, color: "bg-green-600", icon: Zap },
                  { label: "Perfect", val: 5, color: "bg-emerald-600", icon: Sparkles },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => handleRate(btn.val)}
                    disabled={isSyncing}
                    className={cn(
                      "group flex items-center space-x-3 px-8 py-5 rounded-2xl font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 disabled:opacity-50 shadow-xl border border-white/10",
                      btn.color
                    )}
                  >
                    <btn.icon className="h-5 w-5" />
                    <span>{btn.label}</span>
                  </button>
                ))}
              </motion.div>
            ) : (
               <motion.p 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 0.3 }}
                 className="text-[10px] font-black uppercase tracking-[0.5em] text-white"
               >
                 Awaiting Cognitive Input
               </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="p-10 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-6">
           <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Session Progress</span>
              <div className="flex items-center space-x-2">
                 {[...Array(cards.length)].map((_, i) => (
                   <div 
                    key={i} 
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-all duration-500",
                      i < currentIndex ? "bg-green-500" : i === currentIndex ? "bg-primary animate-pulse w-4" : "bg-white/10"
                    )} 
                   />
                 ))}
              </div>
           </div>
        </div>

        <div className="flex items-center space-x-10">
           <div className="flex flex-col items-end">
              <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Neural Mastery</span>
              <span className="text-lg font-black tracking-tighter text-green-500 italic">{progress ? Math.round(progress.ease * 40) : 98}% Sync</span>
           </div>
        </div>
      </div>
    </div>
  );
}
