import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const CATEGORY_IMAGES: Record<string, string> = {
  medical: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600",
  law: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600",
  languages: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600",
  coding: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
  history: "https://images.unsplash.com/photo-1461344577544-4e5dc9487184?w=600",
  science: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=600",
  mathematics: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600",
  competitive: "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=600",
  default: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600",
};

export default async function CategoriesPage() {
  const { data: categories } = await supabase
    .from("categories")
    .select("*, decks(count)");

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 pb-20 bg-[#141414]">
      <Navbar />
      
      <div className="max-w-[1400px] mx-auto space-y-16">
        <div className="relative">
          <div className="absolute -left-4 top-0 bottom-0 w-1 bg-primary" />
          <h1 className="font-heading text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl uppercase leading-none text-white">
            EXPLORE <br />
            <span className="text-primary italic">CATEGORIES</span>
          </h1>
          <p className="text-white/40 mt-4 text-xs md:text-sm uppercase tracking-[0.3em] font-black">
            Curated Discovery by Field of Study
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories?.map((category) => (
            <Link 
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group relative overflow-hidden rounded-2xl bg-[#181818] transition-all duration-500 hover:scale-[1.03] hover:shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/5"
            >
              <AspectRatio ratio={16 / 9}>
                <div 
                  className="h-full w-full bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1"
                  style={{ backgroundImage: `url(${CATEGORY_IMAGES[category.slug] || CATEGORY_IMAGES.default})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <h2 className="font-heading text-3xl md:text-4xl font-black text-white group-hover:text-primary transition-colors tracking-tight leading-none uppercase">
                      {category.name}
                    </h2>
                    <p className="text-white/50 text-[10px] md:text-xs line-clamp-1 mt-2 font-bold uppercase tracking-widest">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                      {category.decks?.[0]?.count || 0} PREMIUM DECKS
                    </span>
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                       <span className="text-lg font-bold">→</span>
                    </div>
                  </div>
                </div>
              </AspectRatio>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
