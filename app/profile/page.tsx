import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import ProfileFeed from "@/components/ProfileFeed";
import ProfileSettings from "@/components/ProfileSettings";
import IdentityCard from "@/components/IdentityCard";
import Navbar from "@/components/Navbar";
import { BrainCircuit, Star, Zap, History } from "lucide-react";
import { Deck } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/profile");
  }

  // 1. Fetch favorite decks
  const { data: favorites } = await supabase
    .from("favorites")
    .select(`
      deck_id,
      decks (*)
    `)
    .eq("user_id", user.id);

  const favoriteDecks = (favorites?.map(f => f.decks).filter(Boolean) as unknown as Deck[]) || [];

  // 2. Fetch profile and stats
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, avatar_url')
    .eq('id', user.id)
    .single();

  const { data: progressData } = await supabase
    .from('user_deck_progress')
    .select('repetition, ease')
    .eq('user_id', user.id);

  const stats = {
    neural_score: progressData?.reduce((acc, curr) => acc + (curr.repetition * curr.ease), 0) || 0,
    decks_mastered: progressData?.filter(p => p.repetition > 0).length || 0,
    username: profile?.username || null,
    avatar_url: profile?.avatar_url || null
  };

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      
      <div className="relative pt-32 px-4 md:px-12 pb-20 max-w-7xl mx-auto">
        {/* Background Decor */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 blur-[150px] -z-10" />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Identity & Settings Column */}
          <div className="lg:col-span-4 space-y-12">
            <div className="space-y-4">
               <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
                 <BrainCircuit className="h-8 w-8 text-primary" />
                 Intelligence Hub
               </h1>
               <p className="text-white/40 text-xs font-bold uppercase tracking-widest leading-relaxed">
                 Manage your neural identity and synchronization protocols.
               </p>
            </div>

            <IdentityCard profile={stats} isOwner />

            <div className="bg-white/5 rounded-2xl p-8 border border-white/5 space-y-8">
               <ProfileSettings initialProfile={profile || { username: null, avatar_url: null }} userId={user.id} />
               
               <div className="pt-8 border-t border-white/5">
                 <form action="/auth/signout" method="post">
                   <button className="w-full py-4 rounded-xl border border-white/10 text-white/40 font-black uppercase tracking-tighter hover:bg-white/5 hover:text-white transition">
                     Deactivate Session
                   </button>
                 </form>
               </div>
            </div>
          </div>

          {/* Activity & Content Column */}
          <div className="lg:col-span-8 space-y-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="bg-gradient-to-br from-primary/20 to-black p-6 rounded-2xl border border-primary/20 shadow-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Zap className="h-4 w-4 text-primary fill-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Total Score</span>
                  </div>
                  <p className="text-3xl font-black italic tracking-tighter">{Math.round(stats.neural_score).toLocaleString()}</p>
               </div>
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <History className="h-4 w-4 text-white/40" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Integrations</span>
                  </div>
                  <p className="text-3xl font-black italic tracking-tighter">{stats.decks_mastered}</p>
               </div>
               <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Favorites</span>
                  </div>
                  <p className="text-3xl font-black italic tracking-tighter">{favoriteDecks.length}</p>
               </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter">My Neural List</h2>
                <span className="text-xs font-bold text-white/40">{favoriteDecks.length} Decks Cached</span>
              </div>
              <ProfileFeed favoriteDecks={favoriteDecks} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
