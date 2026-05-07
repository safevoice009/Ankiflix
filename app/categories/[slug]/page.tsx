import { supabase } from "@/lib/supabase";
import DeckCard from "@/components/DeckCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const { data: category } = await supabase
    .from("categories")
    .select("name")
    .eq("slug", slug)
    .single();

  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} Decks — Ankiflix`,
    description: `Browse the best ${category.name} Anki decks for your study preparation.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = params;

  // Fetch category details
  const { data: category } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!category) notFound();

  // Fetch decks for this category
  const { data: decks } = await supabase
    .from("decks")
    .select("*")
    .eq("category_id", category.id)
    .order("ranking", { ascending: false });

  return (
    <div className="min-h-screen bg-background pt-24 px-4 md:px-12 pb-20">
      <div className="space-y-8 max-w-7xl mx-auto">
        <header className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            {category.name} <span className="text-primary">Decks</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {category.description || `Browse our collection of high-quality Anki decks for ${category.name}.`}
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {decks?.map((deck) => (
            // Note: DeckCard expects an onClick, but here we might want it to link to the deck page
            // For now, I'll keep the DeckCard as is and maybe it can open the modal or navigate
            <DeckCard key={deck.id} deck={deck} onClick={() => {}} />
          ))}
        </div>

        {decks?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-xl">No decks found in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
