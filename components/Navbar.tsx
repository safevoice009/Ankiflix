"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, Bell, User, ChevronDown, BrainCircuit, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { supabase } from "@/lib/supabase";
import { Profile, SearchResultDeck } from "@/lib/types";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface LocalDeckRow {
  id: string;
  anki_id?: string | null;
  title: string;
  thumbnail_url: string | null;
}

interface GlobalDeckRow {
  id: string;
  anki_id?: string | null;
  title: string;
  thumbnail_url?: string | null;
}

export default function Navbar() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultDeck[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        // 1. Local Scan
        const { data: localData } = await supabase
          .from("decks")
          .select("id, anki_id, title, thumbnail_url, categories(name)")
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{"${searchQuery.trim()}"}`)
          .limit(3);
        
        // 2. Global Vault Scan (Organic Ingestion)
        let globalData: GlobalDeckRow[] = [];
        try {
          const res = await fetch(`/api/search-proxy?q=${encodeURIComponent(searchQuery)}`);
          const { results } = await res.json();
          globalData = results?.slice(0, 3) || [];
        } catch (err) {
          console.error("Global scan failed", err);
        }

        const combined: SearchResultDeck[] = [
          ...((localData || []) as LocalDeckRow[]).map((d) => ({ ...d, source: 'local' as const })),
          ...globalData.map((d) => ({ ...d, source: 'global' as const }))
        ].filter((v, i, a) => {
          const dedupeKey = (v as { anki_id?: string | null }).anki_id || v.title.toLowerCase();
          return a.findIndex((t) => (((t as { anki_id?: string | null }).anki_id || t.title.toLowerCase()) === dedupeKey)) === i;
        });

        setSearchResults(combined);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Decks", href: "/decks" },
    { name: "Categories", href: "/categories" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Submit Intelligence", href: "/submit" },
    { name: "New & Popular", href: "/new" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 z-[100] w-full px-4 py-4 transition-all duration-700 md:px-12",
        isScrolled 
          ? "bg-[#141414]/95 backdrop-blur-xl py-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border-b border-white/5" 
          : "bg-gradient-to-b from-black/90 via-black/40 to-transparent"
      )}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-12">
          <Link href="/" className="group relative">
            <span className="font-heading text-3xl font-black text-primary tracking-tight md:text-4xl transition-all duration-300 group-hover:drop-shadow-[0_0_15px_rgba(229,9,20,0.8)]">
              ANKIFLIX
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden items-center space-x-8 text-[13px] font-bold tracking-tight text-white/70 md:flex font-sans">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition-colors duration-300 hover:text-white relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>

          {/* Mobile Browse Dropdown */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                  <span>Browse</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#141414] border-white/10 text-white p-0 w-72">
                <SheetHeader className="p-8 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                  <SheetTitle className="text-primary font-heading text-4xl tracking-tighter italic">ANKIFLIX</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-6">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      className="px-8 py-4 text-xl font-black font-heading tracking-tight hover:bg-white/5 transition-all border-l-4 border-transparent hover:border-primary hover:pl-10"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>

                <div className="mt-auto p-8 border-t border-white/5 bg-black/50">
                  {user ? (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 px-4 py-3 rounded-xl bg-primary/10 border border-primary/20">
                        <BrainCircuit className="h-5 w-5 text-primary animate-pulse" />
                        <span className="text-xs font-black tracking-[0.2em] text-white uppercase">
                          {profile?.streak || 0} Day Streak
                        </span>
                      </div>
                      <Link 
                        href="/profile" 
                        className="flex items-center space-x-4 p-2 rounded-xl hover:bg-white/5 transition-all"
                      >
                        <div className="h-12 w-12 rounded-lg bg-[#333] overflow-hidden ring-1 ring-white/10">
                          {user.user_metadata?.avatar_url ? (
                            <Image src={user.user_metadata.avatar_url} alt="" width={48} height={48} className="h-full w-full object-cover" />
                          ) : (
                            <User className="h-full w-full p-2 text-white/50" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">My Intelligence</span>
                          <span className="text-[10px] font-medium text-white/40 truncate w-32">{user.email}</span>
                        </div>
                      </Link>
                      <button 
                        onClick={() => supabase.auth.signOut()}
                        className="w-full py-3 rounded-lg border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-primary transition-all"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <Link 
                      href="/auth/login"
                      className="flex items-center justify-center w-full py-4 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(229,9,20,0.4)]"
                    >
                      Initialize Auth
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-8 text-white/80">
          <div className={cn(
            "flex items-center border transition-all duration-500 rounded-full px-3 py-1.5",
            isSearchOpen 
              ? "w-48 border-white/30 bg-black/40 backdrop-blur-md md:w-80" 
              : "w-10 border-transparent bg-transparent"
          )}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="transition-colors hover:text-white p-1"
            >
              <Search className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Titles, decks, categories"
              className={cn(
                "bg-transparent text-xs font-medium focus:outline-none transition-all duration-500 text-white placeholder:text-white/30",
                isSearchOpen ? "ml-2 w-full opacity-100" : "w-0 opacity-0"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onBlur={() => {
                setTimeout(() => {
                  if (searchQuery === "") setIsSearchOpen(false);
                  setSearchResults([]);
                }, 200);
              }}
              autoFocus={isSearchOpen}
            />

            {/* Real-time Search Results Dropdown */}
            {isSearchOpen && (searchResults.length > 0 || isSearching) && (
              <div className="absolute top-[120%] right-0 w-full min-w-[320px] bg-[#181818]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="py-3">
                  {isSearching ? (
                    <div className="px-6 py-4 flex items-center space-x-3 text-white/40">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-[10px] uppercase tracking-widest font-black">Scanning Library...</span>
                    </div>
                  ) : (
                    <>
                      <div className="px-6 py-2 border-b border-white/5 mb-2">
                        <span className="text-[10px] uppercase tracking-widest font-black text-white/30">Top Matches</span>
                      </div>
                      {searchResults.map((deck) => (
                        <Link
                          key={deck.id}
                          href={`/search?q=${encodeURIComponent(deck.title)}`}
                          className="flex items-center space-x-4 px-6 py-4 hover:bg-white/5 transition-all group"
                        >
                          <div className="h-12 w-20 bg-[#222] rounded-md overflow-hidden flex-shrink-0 border border-white/5 shadow-inner">
                            {deck.thumbnail_url ? (
                              <Image src={deck.thumbnail_url} alt="" width={80} height={48} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                            ) : (
                              <div className="h-full w-full bg-gradient-to-br from-primary/30 to-black flex items-center justify-center">
                                 <span className="text-[8px] font-black opacity-20">DECK</span>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white/70 group-hover:text-white transition truncate font-sans">
                              {deck.title}
                            </span>
                            {deck.source === 'global' && (
                              <span className="text-[8px] font-black uppercase text-primary tracking-widest flex items-center gap-1">
                                <Sparkles className="h-2 w-2" />
                                Global Vault Discovery
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-2 px-6 py-3 bg-white/5">
                        <button
                          onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}
                          className="text-[10px] uppercase tracking-widest font-black text-primary hover:text-white transition flex items-center space-x-2"
                        >
                          <span>See all results for &quot;{searchQuery}&quot;</span>
                          <ChevronDown className="h-3 w-3 -rotate-90" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <button className="hidden transition-colors hover:text-white md:block relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full border border-[#141414]" />
          </button>
          
          {user ? (
            <div className="flex items-center space-x-6">
              {/* Neural Streak - Gen Z Hook */}
              <div className="hidden items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 md:flex group hover:bg-primary/20 transition-all cursor-default">
                <span className="text-primary animate-pulse">
                   <BrainCircuit className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-black tracking-widest text-white">
                  {profile?.streak || 0} STREAK
                </span>
              </div>

              <Link 
                href="/profile" 
                className="group relative"
              >
                <div className="h-9 w-9 overflow-hidden rounded-md bg-[#333] transition-all group-hover:ring-2 ring-primary/50 shadow-lg">
                  {user.user_metadata?.avatar_url ? (
                    <Image src={user.user_metadata.avatar_url} alt="" width={36} height={36} className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-full w-full p-1.5 text-white/70" />
                  )}
                </div>
              </Link>
            </div>
          ) : (
            <Link 
              href="/auth/login"
              className="px-6 py-2 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 shadow-[0_10px_20px_rgba(229,9,20,0.3)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
