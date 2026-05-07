"use client";

import Link from "next/link";
import { Search, Bell, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full px-4 py-4 transition-colors duration-300 md:px-12",
        isScrolled ? "bg-[#141414]" : "bg-transparent bg-gradient-to-b from-black/70 to-transparent"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 md:space-x-10">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tighter md:text-3xl">
            ANKIFLIX
          </Link>
          <div className="hidden items-center space-x-4 text-sm font-medium text-foreground/80 md:flex">
            <Link href="/" className="transition hover:text-foreground">Home</Link>
            <Link href="/decks" className="transition hover:text-foreground">Decks</Link>
            <Link href="/categories" className="transition hover:text-foreground">Categories</Link>
            <Link href="/new" className="transition hover:text-foreground">New & Popular</Link>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-foreground/90">
          <button className="transition hover:text-foreground">
            <Search className="h-5 w-5" />
          </button>
          <button className="hidden transition hover:text-foreground md:block">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 overflow-hidden rounded-md bg-muted">
              <User className="h-full w-full p-1" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
