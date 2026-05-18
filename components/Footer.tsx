import Link from "next/link";
import { Globe, Mail, Smartphone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#141414] py-20 px-4 md:px-12 border-t border-white/5">
      <div className="max-w-[1400px] mx-auto space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="font-heading text-2xl font-black text-primary tracking-tighter">ANKIFLIX</h3>
            <p className="text-white/40 text-xs leading-relaxed max-w-xs font-medium uppercase tracking-wider">
              The world&apos;s first cinematic SRS intelligence catalog. Curated high-yield mastery for medical, law, and elite academic disciplines.
            </p>
            <div className="flex space-x-4 pt-4">
              <Globe className="h-5 w-5 text-white/20 hover:text-primary transition-colors cursor-pointer" />
              <Mail className="h-5 w-5 text-white/20 hover:text-primary transition-colors cursor-pointer" />
              <Smartphone className="h-5 w-5 text-white/20 hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Intelligence</h4>
            <div className="flex flex-col space-y-4 text-xs font-bold text-white/40">
              <Link href="/decks" className="hover:text-primary transition-colors">Catalog Overview</Link>
              <Link href="/categories" className="hover:text-primary transition-colors">Browse Fields</Link>
              <Link href="/submit" className="hover:text-primary transition-colors">Submit Intelligence</Link>
              <Link href="/new" className="hover:text-primary transition-colors">Latest Drops</Link>
              <Link href="/leaderboard" className="hover:text-primary transition-colors">Global Rankings</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Support Hub</h4>
            <div className="flex flex-col space-y-4 text-xs font-bold text-white/40">
              <Link href="#" className="hover:text-primary transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-primary transition-colors">Community Decks</Link>
              <Link href="#" className="hover:text-primary transition-colors">Neural Sync Guide</Link>
              <Link href="#" className="hover:text-primary transition-colors">Contact Intelligence</Link>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-white text-[10px] font-black uppercase tracking-[0.3em]">Legal & Privacy</h4>
            <div className="flex flex-col space-y-4 text-xs font-bold text-white/40">
              <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookie Intelligence</Link>
              <Link href="#" className="hover:text-primary transition-colors">Privacy Encryption</Link>
              <Link href="#" className="hover:text-primary transition-colors">Corporate Protocol</Link>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
            © 2026-2027 ANKIFLIX PROTOCOL. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-8">
            <button className="px-6 py-2 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-all rounded-md">
              SERVICE STATUS: ONLINE
            </button>
            <div className="text-primary font-heading text-xl italic tracking-tighter opacity-20">
              STAY SHARP.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
