import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProfileFeed from "@/components/ProfileFeed";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  // Fetch favorite decks
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      deck_id,
      decks (*)
    `)
    .eq("user_id", user.id);

  const favoriteDecks = favorites?.map(f => f.decks).filter(Boolean) || [];

  return (
    <div className="min-h-screen pt-32 px-4 md:px-12 pb-20">
      
      <div className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-8 gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
              MY <span className="text-primary">LIST</span>
            </h1>
            <p className="text-white/40 mt-2 text-sm uppercase tracking-widest font-bold">
              {favoriteDecks.length} {favoriteDecks.length === 1 ? 'Deck' : 'Decks'} Saved
            </p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl ring-2 ring-primary/50">
               {user.email?.[0].toUpperCase()}
             </div>
             <div>
               <p className="text-sm font-bold text-white max-w-[200px] truncate">{user.email}</p>
               <form action="/auth/signout" method="post">
                 <button className="text-xs text-white/40 hover:text-white transition uppercase font-black tracking-tighter border-b border-transparent hover:border-white/40">
                   Sign Out
                 </button>
               </form>
             </div>
          </div>
        </div>

        <ProfileFeed favoriteDecks={favoriteDecks} />
      </div>
    </div>
  );
}
