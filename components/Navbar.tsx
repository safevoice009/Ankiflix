"use client";

import Link from "next/link";
import { Search, Bell, User, Menu, ChevronDown } from "lucide-react";
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

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Decks", href: "/decks" },
    { name: "Categories", href: "/categories" },
    { name: "New & Popular", href: "/new" },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full px-4 py-4 transition-all duration-500 md:px-12",
        isScrolled ? "bg-[#141414] py-3 shadow-lg" : "bg-transparent bg-gradient-to-b from-black/90 via-black/40 to-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-10">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tighter md:text-3xl lg:text-4xl">
            ANKIFLIX
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden items-center space-x-6 text-sm font-medium text-[#e5e5e5] md:flex">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className="transition hover:text-white">
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Browse Dropdown */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center space-x-1 text-xs font-bold text-white">
                  <span>Browse</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-[#141414] border-white/10 text-white p-0 w-64">
                <SheetHeader className="p-6 border-b border-white/10">
                  <SheetTitle className="text-primary font-bold text-2xl tracking-tighter">ANKIFLIX</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col py-4">
                  {navLinks.map((link) => (
                    <Link 
                      key={link.name} 
                      href={link.href} 
                      className="px-6 py-4 text-lg font-medium hover:bg-white/5 transition border-l-4 border-transparent hover:border-primary"
                    >
                      {link.name}
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex items-center space-x-4 md:space-x-6 text-foreground/90">
          <div className={cn(
            "flex items-center border transition-all duration-300 px-2 py-1 rounded-sm",
            isSearchOpen ? "w-40 border-white bg-black/50 md:w-64" : "w-10 border-transparent bg-transparent"
          )}>
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="transition hover:text-white p-1"
            >
              <Search className="h-5 w-5" />
            </button>
            <input
              type="text"
              placeholder="Titles, decks, categories"
              className={cn(
                "bg-transparent text-sm focus:outline-none transition-all duration-300 text-white",
                isSearchOpen ? "ml-2 w-full opacity-100" : "w-0 opacity-0"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              onBlur={() => searchQuery === "" && setIsSearchOpen(false)}
              autoFocus={isSearchOpen}
            />
          </div>
          
          <button className="hidden transition hover:text-white md:block">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2 cursor-pointer group">
            <div className="h-8 w-8 overflow-hidden rounded-md bg-white/10 transition group-hover:ring-2 ring-primary/50">
              <User className="h-full w-full p-1 text-white/70" />
            </div>
            <div className="hidden border-l border-white/10 pl-2 text-[10px] font-black md:block tracking-widest text-white/50 uppercase">
              STUDENT
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
