import { supabase } from "@/lib/supabase";
import { Play, Plus, ThumbsUp, ChevronLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="relative h-[60vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: deck.thumbnail_url ? `url(${deck.thumbnail_url})` : 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        
        <div className="absolute top-24 left-4 md:left-12">
          <Link href="/" className="flex items-center space-x-2 text-white/70 hover:text-white transition">
            <ChevronLeft className="h-6 w-6" />
            <span className="font-bold uppercase tracking-widest text-sm">Back to Home</span>
          </Link>
        </div>

        <div className="absolute bottom-12 left-4 md:left-12 max-w-4xl space-y-6">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-primary text-white border-none uppercase text-xs font-bold px-2">Trending</Badge>
            {deck.categories?.name && (
              <Badge variant="outline" className="text-white border-white/20 uppercase text-xs font-bold px-2">
                {deck.categories.name}
              </Badge>
            )}
          </div>
          
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter">
            {deck.title}
          </h1>

          <div className="flex items-center space-x-4">
            <a 
              href={deck.anki_link || "#"} 
              target="_blank"
              className="flex items-center space-x-3 rounded-md bg-white px-10 py-4 font-bold text-black transition hover:bg-white/90 transform active:scale-95"
            >
              <Play className="h-6 w-6 fill-black" />
              <span className="text-lg">Download Now</span>
            </a>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl border border-white/20 transition hover:bg-white/20">
              <Plus className="h-6 w-6" />
            </button>
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-xl border border-white/20 transition hover:bg-white/20">
              <ThumbsUp className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-8">
          <div className="flex items-center space-x-4 text-lg font-semibold">
            <span className="text-green-500">{deck.ranking ? Math.round(deck.ranking * 20) : 95}% Match</span>
            <span className="text-white/60">2024</span>
            <span className="border border-white/30 px-2 rounded-sm text-xs">HD</span>
          </div>

          <div className="prose prose-invert max-w-none">
            <p className="text-xl leading-relaxed text-white/80">
              {deck.description || "No detailed description provided for this deck."}
            </p>
          </div>
        </div>

        <div className="space-y-6 bg-white/5 p-8 rounded-2xl border border-white/10 h-fit">
          <div>
            <span className="text-white/40 block text-xs uppercase tracking-widest font-bold mb-1">Total Cards</span>
            <span className="text-2xl font-bold">{deck.total_cards?.toLocaleString() || "N/A"}</span>
          </div>
          
          <div>
            <span className="text-white/40 block text-xs uppercase tracking-widest font-bold mb-1">Downloads</span>
            <span className="text-2xl font-bold">{deck.downloads?.toLocaleString() || "0"}</span>
          </div>

          <div>
            <span className="text-white/40 block text-xs uppercase tracking-widest font-bold mb-1">Tags</span>
            <div className="flex flex-wrap gap-2 mt-2">
              {deck.tags?.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="bg-white/10 text-white border-none">
                  {tag}
                </Badge>
              )) || (
                <>
                  <Badge variant="secondary" className="bg-white/10 text-white border-none">Education</Badge>
                  <Badge variant="secondary" className="bg-white/10 text-white border-none">Memory</Badge>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
