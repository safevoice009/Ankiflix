"use client";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Play, Plus, ThumbsUp, X, Check, Loader2, Sparkles, BrainCircuit, Zap } from "lucide-react";
import Image from "next/image";
import FavoriteButton from "./FavoriteButton";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { calculateNextReview, DeckProgress } from "@/lib/srs-logic";
import { getIntelligenceInsight } from "@/lib/gemini";
import RelatedDecks from "./RelatedDecks";

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
  const router = useRouter();
  const [isReviewing, setIsReviewing] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [progress, setProgress] = useState<DeckProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSync = async () => {
    setIsAiLoading(true);
    const insight = await getIntelligenceInsight(deck?.title || "", deck?.description || "");
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  useEffect(() => {
    if (isOpen && deck) {
      fetchProgress();
      setIsReviewing(false);
      setShowRatings(false);
    }
  }, [isOpen, deck]);

  const fetchProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !deck) return;

    const { data } = await supabase
      .from('user_deck_progress')
      .select('interval, repetition, ease, next_review')
      .eq('user_id', user.id)
      .eq('deck_id', deck.id)
      .single();

    if (data) setProgress(data);
    else setProgress(null);
  };

  if (!deck) return null;

  const startSession = () => {
    setIsReviewing(true);
    setTimeout(() => {
      setShowRatings(true);
    }, 3000); // 3 second study simulation
  };

  const handleRate = async (quality: number) => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast((t) => (
        <span className="flex items-center space-x-3">
          <span className="text-[10px] font-black uppercase tracking-widest">Sign in to track progress</span>
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              router.push('/auth/login');
            }}
            className="bg-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg"
          >
            Log In
          </button>
        </span>
      ), { duration: 5000 });
      setIsLoading(false);
      return;
    }

    const nextProgress = calculateNextReview(progress, quality);

    const { error } = await supabase
      .from('user_deck_progress')
      .upsert({
        user_id: user.id,
        deck_id: deck.id,
        ...nextProgress,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,deck_id' });

    if (error) {
      toast.error("Failed to update progress");
    } else {
      setProgress(nextProgress);
      toast.success("Intelligence Synchronized");
      setShowRatings(false);
      setIsReviewing(false);
    }
    setIsLoading(false);
  };

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

  const ratingButtons = [
    { label: "Again", color: "bg-red-600", value: 0 },
    { label: "Hard", color: "bg-orange-600", value: 2 },
    { label: "Good", color: "bg-blue-600", value: 3 },
    { label: "Easy", color: "bg-green-600", value: 4 },
    { label: "Perfect", color: "bg-emerald-600", value: 5 },
  ];

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
               <BrainCircuit className="h-24 w-24 text-primary/20 animate-pulse" />
            </div>
          )}
          
          {isReviewing && !showRatings && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-xl overflow-hidden">
              {/* Scanning Line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary shadow-[0_0_20px_rgba(229,9,20,1)] animate-scan" />
              
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                <Loader2 className="h-24 w-24 text-primary animate-spin opacity-20" />
                <BrainCircuit className="absolute inset-0 h-24 w-24 text-primary animate-pulse m-auto" />
              </div>
              
              <div className="mt-8 space-y-4 text-center max-w-md px-6">
                <h3 className="text-4xl font-black uppercase tracking-tighter animate-pulse text-white">
                  NEURAL <span className="text-primary italic">SYNC</span>
                </h3>
                
                {aiInsight ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <p className="text-white/80 font-medium leading-relaxed italic border-l-2 border-primary pl-4 text-left">
                      "{aiInsight}"
                    </p>
                    <div className="flex items-center justify-center space-x-2 text-primary">
                      <Zap className="h-4 w-4 fill-primary" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Synaptic Path Optimized</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center space-x-2">
                       <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-progress-horizontal" />
                       </div>
                    </div>
                    <button 
                      onClick={handleAiSync}
                      disabled={isAiLoading}
                      className="group flex items-center space-x-3 rounded-full bg-white/10 px-8 py-3 font-black text-white border border-white/10 hover:bg-white/20 transition-all active:scale-95"
                    >
                      {isAiLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-primary group-hover:animate-pulse" />
                      )}
                      <span className="uppercase tracking-widest text-[10px]">Generate Intelligence Insight</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {showRatings && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-10 text-center">
              <h3 className="text-4xl font-black uppercase tracking-tighter mb-2">Performance Assessment</h3>
              <p className="text-white/60 mb-10 max-w-md">How effectively did you retain the information in this deck?</p>
              
              <div className="flex flex-wrap justify-center gap-4">
                {ratingButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => handleRate(btn.value)}
                    disabled={isLoading}
                    className={cn(
                      "group relative px-8 py-4 rounded-lg font-black uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 disabled:opacity-50",
                      btn.color
                    )}
                  >
                    <span className="relative z-10">{btn.label}</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity rounded-lg" />
                  </button>
                ))}
              </div>
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
                <span className="bg-primary px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-white rounded-sm flex items-center gap-1">
                   <Sparkles className="h-3 w-3" /> High Authority
                </span>
                <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{deck.total_cards ? `${deck.total_cards} Cards` : 'New Release'}</span>
                {progress && (
                  <span className="text-green-500 text-[10px] font-bold uppercase tracking-widest border border-green-500/30 px-1.5 rounded-sm">
                    In Progress (Ease: {progress.ease.toFixed(1)})
                  </span>
                )}
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
                onClick={startSession}
                className="flex items-center space-x-2 rounded-md bg-white px-10 py-3 font-black text-black transition hover:bg-white/90 transform active:scale-95 shadow-xl"
              >
                <Play className="h-6 w-6 fill-black" />
                <span className="uppercase tracking-tighter text-lg">Start Session</span>
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center justify-center rounded-full bg-black/50 border-2 border-white/20 h-12 w-12 hover:bg-white/10 transition"
                title="Download Source"
              >
                 <Plus className="h-6 w-6" />
              </button>
              <FavoriteButton 
                deckId={deck.id} 
                className="h-12 w-12 rounded-full border-2 border-white/20 flex items-center justify-center hover:bg-white/10 transition hover:border-white"
                iconClassName="h-6 w-6"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 p-10 md:grid-cols-12 bg-gradient-to-b from-[#141414] to-[#0a0a0a]">
          <div className="col-span-8 space-y-6">
            <div className="flex items-center space-x-4 text-sm font-bold">
              <span className="text-green-500">{progress ? Math.round(progress.ease * 40) : 98}% Mastery</span>
              <span className="text-white/60">
                {progress ? `Next Review: ${new Date(progress.next_review).toLocaleDateString()}` : "Ready to Start"}
              </span>
              <span className="border border-white/30 px-1.5 text-[10px] rounded-sm bg-white/5 font-black">PRO</span>
              <span className="text-white/60">Interval: {progress?.interval || 0}d</span>
            </div>
            
            <div className="space-y-4">
              <p className="text-xl leading-relaxed text-white/90 font-sans">
                {deck.description || "This premium Anki deck has been scientifically designed to optimize your long-term retention and exam performance. It includes high-yield facts, clear diagrams, and comprehensive coverage of the subject matter."}
              </p>
            </div>

            {/* Related Content */}
            <div className="pt-12 space-y-8">
              <div className="flex items-center space-x-4">
                <div className="h-px flex-1 bg-white/5" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 whitespace-nowrap">More Like This Intelligence</h3>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              
              <RelatedDecks deckId={deck.id} categoryId={(deck as any).category_id} onDeckClick={(d) => {
                // Since we're in a modal, we might want to switch the deck
                // For simplicity, we just trigger the click
                window.location.href = `/search?q=${encodeURIComponent(d.title)}`;
              }} />
            </div>
          </div>

          <div className="col-span-4 space-y-6 text-sm font-sans">
            <div className="space-y-1">
              <span className="text-white/40 block uppercase tracking-widest text-[10px] font-black">SRS Status:</span>
              <span className="text-white/90 font-bold">{progress ? "Actively Tracking" : "Discovery Stage"}</span>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block uppercase tracking-widest text-[10px] font-black">Repetitions:</span>
              <span className="text-white/90 font-bold">{progress?.repetition || 0} Successful Sessions</span>
            </div>
            <div className="space-y-1">
              <span className="text-white/40 block uppercase tracking-widest text-[10px] font-black">Difficulty:</span>
              <span className="text-white/90 font-bold italic">
                {progress && progress.ease < 2.0 ? "Challenging" : progress && progress.ease > 3.0 ? "Mastered" : "Balanced"}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
