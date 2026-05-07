import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In — Ankiflix",
  description: "Sign in to your Ankiflix account to manage your saved decks and favorites.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#141414] selection:bg-primary/30">
      {/* Cinematic Background Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 grayscale transition-opacity duration-1000 group-hover:opacity-40"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=2000)' }}
      />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#141414] via-transparent to-[#141414]" />
      <div className="absolute inset-0 z-0 bg-black/40" />
      
      {/* Floating Blobs for Depth */}
      <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-primary/5 blur-[150px] rounded-full animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-[480px] px-8 py-16 bg-[#000]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] md:px-16">
        <div className="space-y-12">
          <header className="space-y-4 text-center">
            <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4">
              Access Control
            </div>
            <h1 className="font-heading text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-none">
              STUDY <br />
              <span className="text-primary italic">VAULT</span>
            </h1>
            <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Sign in to sync your mastery</p>
          </header>
          
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
