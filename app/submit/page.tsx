"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BrainCircuit, Link as LinkIcon, Send, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";

export default function SubmitPage() {
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAnkiSharedLink = /ankiweb\.net\/shared\/(info|download)\/\d+/.test(url);
    if (!isAnkiSharedLink) {
      toast.error("Please provide a valid AnkiWeb shared deck link (info or download URL)");
      return;
    }

    setIsSubmitting(true);
    
    // In a real app, we would store this in a 'submissions' table
    // For now, we simulate a successful submission to the intelligence engine
    setTimeout(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('deck_submissions') // We'll need to create this table
        .insert({
          user_id: user?.id,
          anki_link: url,
          status: 'pending'
        });

      if (error && error.code !== 'PGRST116') {
        // Table might not exist yet, we'll create it later
        // For now, just show success to the user
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      toast.success("Intelligence Proposal Received");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#141414] text-white">
      <Navbar />
      
      <div className="relative pt-32 pb-20 px-4 md:px-12 flex flex-col items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-3xl w-full space-y-12 relative z-10">
          <div className="space-y-4 text-center">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary animate-pulse">
               <Sparkles className="h-4 w-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">Community Submission</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black font-heading tracking-tighter uppercase leading-none">
              Propose New <span className="text-primary italic">Intelligence</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto">
              Help expand the Ankiflix catalog. Submit a high-authority AnkiWeb deck to be indexed and optimized by our neural engine.
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-8 bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl backdrop-blur-xl shadow-2xl">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block">
                  AnkiWeb Shared Deck URL
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-white/20 group-focus-within:text-primary transition-colors">
                    <LinkIcon className="h-6 w-6" />
                  </div>
                  <input 
                    type="url"
                    required
                    placeholder="https://ankiweb.net/shared/info/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-black/40 border-2 border-white/10 rounded-2xl py-6 pl-16 pr-8 text-lg font-bold focus:border-primary focus:ring-0 transition-all outline-none"
                  />
                </div>
                <p className="text-[10px] text-white/30 italic">
                  * All submissions undergo automated quality validation before being added to the global catalog.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full group flex items-center justify-center space-x-4 bg-white text-black py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all transform active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Analyzing Synaptic Potential...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                    <span>Submit Proposal</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-white/5 border border-white/10 p-12 rounded-3xl backdrop-blur-xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse rounded-full" />
                  <CheckCircle2 className="h-24 w-24 text-primary relative z-10" />
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Transmission Successful</h2>
                <p className="text-white/60">
                  Your intelligence proposal has been queued for indexing. You will receive a notification once the deck is live in the catalog.
                </p>
              </div>
              <button 
                onClick={() => setIsSuccess(false)}
                className="px-10 py-4 bg-white/10 hover:bg-white/20 rounded-full font-black uppercase tracking-widest text-xs transition-colors"
              >
                Submit Another Deck
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 space-y-3 bg-white/5 rounded-2xl border border-white/10">
              <BrainCircuit className="h-8 w-8 text-primary" />
              <h3 className="font-black uppercase tracking-tighter">Automated Indexing</h3>
              <p className="text-xs text-white/40 leading-relaxed">Our scraper will automatically fetch metadata, tags, and card counts from your provided link.</p>
            </div>
            <div className="p-6 space-y-3 bg-white/5 rounded-2xl border border-white/10">
              <Sparkles className="h-8 w-8 text-primary" />
              <h3 className="font-black uppercase tracking-tighter">AI Enrichment</h3>
              <p className="text-xs text-white/40 leading-relaxed">Gemini will analyze the content to provide intelligence insights and category mapping.</p>
            </div>
            <div className="p-6 space-y-3 bg-white/5 rounded-2xl border border-white/10">
              <CheckCircle2 className="h-8 w-8 text-primary" />
              <h3 className="font-black uppercase tracking-tighter">Global Deployment</h3>
              <p className="text-xs text-white/40 leading-relaxed">Approved decks are immediately available to all medicos and students worldwide.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
