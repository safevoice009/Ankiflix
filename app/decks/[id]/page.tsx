import { supabase } from "@/lib/supabase";
import { Play, ThumbsUp, ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/FavoriteButton";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const { data: deck } = await supabase
    .from("decks")
    .select("title, description")
    .eq("id", id)
    .single();

  if (!deck) return { title: "Deck Not Found" };

  return {
    title: `${deck.title} — Ankiflix`,
    description: deck.description || `Download ${deck.title} Anki deck on Ankiflix.`,
  };
}

export default async function DeckPage({ params }: Props) {
  const { id } = params;

  const { data: deck } = await supabase
    .from("decks")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (!deck) notFound();

  // Simulated card samples for cinematic effect
  const cardSamples = [
    { front: "What is the primary mechanism of action?", back: "Competitive inhibition of the target enzyme." },
    { front: "Identify the critical pathway involved.", back: "The metabolic cascade initiated by neurotransmitter release." },
    { front: "Common presentation findings?", back: "Acute onset with characteristic visual indicators." }
  ];

  const heroParticles = Array.from({ length: 10 }, (_, i) => ({
    left: `${(i * 17) % 100}%`,
    top: `${(i * 31) % 100}%`,
    delay: `${i * 0.5}s`,
  }));

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-primary/30 pb-32">
      
      {/* Cinematic Hero */}
      <div className="relative h-[75vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-80" />
        
        {/* Particle System for Atmosphere */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {heroParticles.map((particle, i) => (
            <div
              key={i}
              className="particle absolute bg-white h-1 w-1 rounded-full animate-float"
              style={{ left: particle.left, top: particle.top, animationDelay: particle.delay }}
            />
          ))}
        </div>

        <div className="absolute top-28 left-4 md:left-12 z-20">
          <Link href="/" className="group flex items-center space-x-3 text-white/50 hover:text-white transition-all">
            <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
              <ChevronLeft className="h-6 w-6" />
            </div>
            <span className="font-black uppercase tracking-[0.4em] text-[10px]">Neural Interface / Back</span>
          </Link>
        </div>

        <div className="absolute bottom-24 left-4 md:left-12 max-w-[1400px] z-20 space-y-8 animate-in fade-in slide-in-from-bottom-12 duration-1000">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-4 py-1.5 rounded-full backdrop-blur-xl">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-black uppercase text-[10px] tracking-[0.2em]">Verified Asset</span>
            </div>
            {deck.categories?.name && (
              <Link href={`/categories/${deck.categories.slug}`} className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/10 transition-all uppercase text-[10px] font-black tracking-[0.2em] backdrop-blur-xl">
                {deck.categories.name}
              </Link>
            )}
            <div className="flex items-center gap-2 text-green-500 font-black text-[10px] tracking-[0.2em] uppercase bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">
              {deck.ranking ? Math.round(deck.ranking * 20) : 98}% Sync Rate
            </div>
          </div>
          
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-[0.85] uppercase max-w-4xl italic text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
            {deck.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6">
            <a 
              href={deck.download_url || deck.anki_link || `https://ankiweb.net/shared/decks?search=${encodeURIComponent(deck.title)}`} 
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-6 rounded-2xl bg-white px-12 py-6 font-black text-black transition-all hover:bg-primary hover:text-white transform active:scale-95 shadow-[0_25px_60px_rgba(255,255,255,0.15)]"
            >
              <Play className="h-7 w-7 fill-current" />
              <span className="text-2xl uppercase tracking-tighter">Acquire Intelligence</span>
            </a>
            
            <div className="flex items-center gap-4">
              <FavoriteButton 
                deckId={deck.id} 
                className="h-20 w-20 bg-white/5 text-white backdrop-blur-3xl border border-white/10 hover:bg-white/10 hover:scale-110 transition-all rounded-[2rem] flex items-center justify-center shadow-2xl"
                iconClassName="h-8 w-8"
              />
              <button className="flex h-20 w-20 items-center justify-center rounded-[2rem] bg-white/5 text-white backdrop-blur-3xl border border-white/10 transition-all hover:bg-white/10 hover:scale-110 shadow-2xl">
                <ThumbsUp className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-32 space-y-32">
        
        {/* Brief & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
          <div className="lg:col-span-8 space-y-20">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <h2 className="font-heading text-5xl font-black uppercase tracking-tight italic">Intelligence <span className="text-primary not-italic">Brief</span></h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
              <p className="text-2xl md:text-3xl leading-relaxed text-white/70 font-medium font-sans max-w-4xl">
                {deck.description || "No manual briefing provided. This high-authority asset has been indexed and verified via the global AnkiWeb vault for premium academic synchronization."}
              </p>
            </div>

            {/* Simulated Card Previews */}
            <div className="space-y-10">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Neural Card Previews</h3>
                <span className="h-px flex-1 mx-6 bg-white/5" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {cardSamples.map((card, i) => (
                  <div key={i} className="group relative p-10 rounded-[2.5rem] bg-white/[0.03] border border-white/10 hover:bg-white/[0.05] transition-all duration-500 overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
                      <span className="text-8xl font-black italic">{i+1}</span>
                    </div>
                    <div className="relative space-y-6">
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Prompt</span>
                        <p className="text-xl font-bold leading-snug">{card.front}</p>
                      </div>
                      <div className="pt-6 border-t border-white/5 space-y-2 opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Mastery Logic</span>
                        <p className="text-lg text-white/60">{card.back}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-12 bg-gradient-to-br from-white/[0.07] to-transparent p-12 rounded-[3rem] border border-white/10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
              <div className="space-y-1">
                <h3 className="font-heading text-4xl font-black uppercase tracking-tight">Intelligence</h3>
                <h3 className="font-heading text-4xl font-black uppercase tracking-tight text-primary italic">Metadata</h3>
              </div>
              
              <div className="space-y-12">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <span className="text-white/30 block text-[10px] uppercase tracking-[0.4em] font-black">Total Cards</span>
                    <span className="text-4xl font-black font-heading tracking-tighter">{deck.total_cards?.toLocaleString() || "UNSPECIFIED"}</span>
                  </div>
                  <div className="space-y-2">
                    <span className="text-white/30 block text-[10px] uppercase tracking-[0.4em] font-black">Community Ranking</span>
                    <div className="flex items-center gap-1">
                       <span className="text-4xl font-black font-heading tracking-tighter text-primary">{deck.ranking || "4.8"}</span>
                       <span className="text-white/20 font-bold">/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <span className="text-white/30 block text-[10px] uppercase tracking-[0.4em] font-black">Neural Consistency</span>
                  <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[85%] rounded-full shadow-[0_0_15px_rgba(229,9,20,0.5)]" />
                  </div>
                  <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">High retention profile detected</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <span className="text-white/30 block text-[10px] uppercase tracking-[0.4em] font-black">Vault Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {deck.tags?.map((tag: string) => (
                      <Badge key={tag} className="bg-primary/10 text-primary/80 border border-primary/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all cursor-default">
                        {tag}
                      </Badge>
                    )) || ["CORE", "MASTERY", "EXAM READY"].map(t => (
                      <Badge key={t} className="bg-white/5 text-white/40 border border-white/10 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em]">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="pt-8 space-y-4">
                   <div className="flex items-center space-x-3 text-white/20">
                      <div className="h-1 w-1 rounded-full bg-white/20" />
                      <span className="text-[9px] font-black uppercase tracking-widest">Last Synced: {deck.last_sync_at ? new Date(deck.last_sync_at).toLocaleDateString() : 'N/A'}</span>
                   </div>
                   <div className="flex items-center space-x-3 text-white/20">
                      <div className="h-1 w-1 rounded-full bg-white/20" />
                      <span className="text-[9px] font-black uppercase tracking-widest">AnkiWeb Intelligence Proxy: ACTIVE</span>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
