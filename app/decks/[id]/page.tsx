import { supabase } from "@/lib/supabase";
import { Play, Plus, ThumbsUp, ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import FavoriteButton from "@/components/FavoriteButton";
import Navbar from "@/components/Navbar";

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

  return (
    <div className="min-h-screen bg-[#141414] text-white selection:bg-primary/30">
      <Navbar />
      
      {/* Cinematic Hero */}
      <div className="relative h-[70vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent opacity-80" />
        
        <div className="absolute top-28 left-4 md:left-12 z-20">
          <Link href="/" className="group flex items-center space-x-3 text-white/50 hover:text-white transition-all">
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </div>
            <span className="font-black uppercase tracking-[0.3em] text-[10px]">Back to Home</span>
          </Link>
        </div>

        <div className="absolute bottom-20 left-4 md:left-12 max-w-5xl z-20 space-y-8">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-primary/20 border border-primary/30 px-3 py-1 rounded-full">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-primary font-black uppercase text-[10px] tracking-widest">Trending Now</span>
            </div>
            {deck.categories?.name && (
              <Link href={`/categories/${deck.categories.slug}`} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full hover:bg-white/10 transition uppercase text-[10px] font-black tracking-widest">
                {deck.categories.name}
              </Link>
            )}
            <div className="flex items-center gap-1 text-green-500 font-black text-xs tracking-widest uppercase">
              {deck.ranking ? Math.round(deck.ranking * 20) : 98}% Match
            </div>
          </div>
          
          <h1 className="font-heading text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter leading-none uppercase max-w-4xl">
            {deck.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4">
            <a 
              href={deck.anki_link || "#"} 
              target="_blank"
              className="group flex items-center space-x-4 rounded-xl bg-white px-10 py-5 font-black text-black transition-all hover:bg-primary hover:text-white transform active:scale-95 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
            >
              <Play className="h-6 w-6 fill-current" />
              <span className="text-xl uppercase tracking-tighter">Download Deck</span>
            </a>
            
            <div className="flex items-center gap-3">
              <FavoriteButton 
                deckId={deck.id} 
                className="h-16 w-16 bg-white/5 text-white backdrop-blur-2xl border border-white/10 hover:bg-white/10 hover:scale-110 transition-all rounded-2xl"
                iconClassName="h-7 w-7"
              />
              <button className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white backdrop-blur-2xl border border-white/10 transition-all hover:bg-white/10 hover:scale-110">
                <ThumbsUp className="h-7 w-7" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-8 space-y-16">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <h2 className="font-heading text-4xl font-black uppercase tracking-tight">Intelligence Brief</h2>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="prose prose-invert max-w-none">
                <p className="text-xl md:text-2xl leading-relaxed text-white/60 font-medium italic border-l-4 border-primary pl-8 py-4">
                  {deck.description || "No detailed description provided for this premium deck. Highly recommended for advanced learners."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
              <div className="space-y-2">
                <span className="text-white/30 block text-[10px] uppercase tracking-[0.3em] font-black">Release Date</span>
                <span className="text-xl font-bold font-heading uppercase">March 2024</span>
              </div>
              <div className="space-y-2">
                <span className="text-white/30 block text-[10px] uppercase tracking-[0.3em] font-black">Quality Profile</span>
                <div className="flex items-center gap-2">
                  <Badge className="bg-primary/20 text-primary border-none text-[10px] font-black uppercase tracking-widest">4K Ultra HD</Badge>
                  <Badge variant="outline" className="text-white/40 border-white/10 text-[10px] font-black uppercase tracking-widest">HDR</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-white/30 block text-[10px] uppercase tracking-[0.3em] font-black">Audio/Visuals</span>
                <span className="text-xl font-bold font-heading uppercase">Premium Media Bundled</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8 bg-gradient-to-br from-white/5 to-transparent p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-3xl shadow-2xl">
              <h3 className="font-heading text-3xl font-black uppercase tracking-tight mb-8">Metadata</h3>
              
              <div className="space-y-10">
                <div className="group transition-all">
                  <span className="text-white/30 block text-[10px] uppercase tracking-[0.3em] font-black mb-3 group-hover:text-primary transition-colors">Card Count</span>
                  <span className="text-4xl font-black font-heading tracking-tighter">{deck.total_cards?.toLocaleString() || "UNSPECIFIED"}</span>
                </div>
                
                <div className="group transition-all">
                  <span className="text-white/30 block text-[10px] uppercase tracking-[0.3em] font-black mb-3 group-hover:text-primary transition-colors">Total Downloads</span>
                  <span className="text-4xl font-black font-heading tracking-tighter">{deck.downloads?.toLocaleString() || "0"}</span>
                </div>

                <div>
                  <span className="text-white/30 block text-[10px] uppercase tracking-[0.3em] font-black mb-4">Classified Tags</span>
                  <div className="flex flex-wrap gap-2">
                    {deck.tags?.map((tag: string) => (
                      <Badge key={tag} className="bg-white/5 text-white/60 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 hover:text-primary hover:border-primary/30 transition-all cursor-default">
                        {tag}
                      </Badge>
                    )) || (
                      <>
                        <Badge className="bg-white/5 text-white/60 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">MASTERY</Badge>
                        <Badge className="bg-white/5 text-white/60 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">ELITE</Badge>
                      </>
                    )}
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
