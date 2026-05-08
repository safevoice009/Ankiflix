import Link from "next/link";
import { Play } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#141414] flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(229,9,20,0.1),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]" />
      </div>

      <div className="relative z-10 text-center space-y-8 px-4">
        <div className="space-y-2">
          <h1 className="font-heading text-8xl md:text-[12rem] font-black tracking-tighter text-white/5 italic leading-none select-none">
            404
          </h1>
          <div className="h-[2px] w-24 bg-primary mx-auto shadow-[0_0_15px_rgba(229,9,20,1)]" />
        </div>
        
        <div className="space-y-4">
          <h2 className="font-heading text-4xl md:text-6xl font-black text-white uppercase tracking-tight">
            LOST IN THE <span className="text-primary italic">VAULT</span>
          </h2>
          <p className="text-white/40 text-lg max-w-md mx-auto font-medium">
            The study material you're looking for has been archived or relocated. 
            Return to the premiere for more high-authority intelligence.
          </p>
        </div>

        <div className="pt-8">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-3 rounded-full bg-white px-12 py-5 font-black text-black transition-all hover:scale-105 hover:bg-white/90 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)]"
          >
            <Play className="h-6 w-6 fill-black" />
            <span className="uppercase tracking-widest text-lg italic">Home Premiere</span>
          </Link>
        </div>
      </div>

      {/* Decorative Particles */}
      {[...Array(10)].map((_, i) => (
        <div 
          key={i}
          className="absolute rounded-full bg-primary/20 pointer-events-none animate-pulse"
          style={{
            width: `${Math.random() * 300}px`,
            height: `${Math.random() * 300}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            filter: 'blur(100px)',
            animationDuration: `${5 + Math.random() * 5}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}
    </div>
  );
}
