'use client';

import { useEffect } from "react";
import { RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-transparent to-[#141414]" />
      </div>

      <div className="relative z-10 text-center space-y-12 max-w-2xl">
        <div className="space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span>System Interrupted</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            INTELLIGENCE <span className="text-primary italic">GLITCH</span>
          </h1>
          
          <p className="text-white/40 text-lg font-medium font-sans">
            We encountered a temporary disruption in the data stream. 
            The premiere is still active, but a quick recalibration is required.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6">
          <button
            onClick={() => reset()}
            className="flex items-center space-x-3 rounded-full bg-primary px-10 py-4 font-black text-white transition-all hover:scale-105 hover:bg-red-700 active:scale-95 shadow-[0_20px_50px_rgba(229,9,20,0.3)]"
          >
            <RefreshCcw className="h-5 w-5" />
            <span className="uppercase tracking-widest text-sm">Recalibrate</span>
          </button>
          
          <Link
            href="/"
            className="flex items-center space-x-3 rounded-full bg-white/5 px-10 py-4 font-black text-white backdrop-blur-3xl border border-white/10 transition-all hover:bg-white/10 hover:border-white/20 transform active:scale-95 group"
          >
            <Home className="h-5 w-5 text-white/50 group-hover:text-white" />
            <span className="uppercase tracking-widest text-sm">Back to Base</span>
          </Link>
        </div>
      </div>

      {/* Atmospheric Glow */}
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 rounded-[100%] blur-[120px] pointer-events-none opacity-50"
      />
    </div>
  );
}
