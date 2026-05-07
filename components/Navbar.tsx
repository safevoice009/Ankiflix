"use client";

import Link from "next/link";
import { Search, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

import { useRouter } from "next/navigation";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

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

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full px-4 py-4 transition-all duration-500 md:px-12",
        isScrolled ? "bg-[#141414] py-3" : "bg-transparent bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-10">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tighter md:text-3xl lg:text-4xl">
            ANKIFLIX
          </Link>
          <div className="hidden items-center space-x-4 text-sm font-medium text-foreground/80 md:flex">
            <Link href="/" className="transition hover:text-foreground">Home</Link>
            <Link href="/decks" className="transition hover:text-foreground">Decks</Link>
            <Link href="/categories" className="transition hover:text-foreground">Categories</Link>
            <Link href="/new" className="transition hover:text-foreground">New & Popular</Link>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-foreground/90">
          <div className={cn(
            "flex items-center border transition-all duration-300 px-2 py-1",
            isSearchOpen ? "w-40 border-white bg-black/50 md:w-64" : "w-10 border-transparent bg-transparent"
          )}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="transition hover:text-foreground p-1"
            >
              <Search className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Titles, people, genres"
              className={cn(
                "bg-transparent text-sm focus:outline-none transition-all duration-300",
                isSearchOpen ? "ml-2 w-full opacity-100" : "w-0 opacity-0"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onBlur={() => searchQuery === "" && setIsSearchOpen(false)}
              autoFocus={isSearchOpen}
            />
          </div>
          
          <button className="hidden transition hover:text-foreground md:block">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="h-8 w-8 overflow-hidden rounded-md bg-muted transition group-hover:ring-2 ring-white/20">
              <User className="h-full w-full p-1 text-white/70" />
            </div>
            <div className="hidden border-l border-white/20 pl-2 text-xs font-bold md:block">
              DEMO
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
