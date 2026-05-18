"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, ChevronRight, UserPlus, LogIn } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        setError("Success! Check your email to confirm your account.");
        return; // Don't redirect yet
      }
      
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : "Authentication failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: unknown) {
      const message = err instanceof AuthError ? err.message : "Failed to sign in with Google.";
      setError(message);
    }
  };

  return (
    <div className="space-y-10">
      {error && (
        <div className={`flex items-center space-x-3 rounded-2xl p-5 text-sm border animate-in fade-in slide-in-from-top-2 duration-500 ${
          error.includes("Success") 
            ? "bg-green-500/10 text-green-500 border-green-500/20" 
            : "bg-red-500/10 text-red-500 border-red-500/20"
        }`}>
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleAuth} className="space-y-6">
        <div className="space-y-4">
          <div className="group relative">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="email"
              placeholder="Email Address"
              required
              className="w-full rounded-2xl bg-white/5 py-5 pl-14 pr-6 text-white border border-white/5 focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/20 font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="group relative">
            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
            <input
              type="password"
              placeholder="Secret Password"
              required
              className="w-full rounded-2xl bg-white/5 py-5 pl-14 pr-6 text-white border border-white/5 focus:border-primary/50 focus:bg-white/10 focus:outline-none transition-all placeholder:text-white/20 font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group w-full rounded-2xl bg-primary py-5 font-heading text-xl font-black text-white transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-xl shadow-primary/20 uppercase tracking-tighter"
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <span>{mode === "signin" ? "Initialize Session" : "Create Identity"}</span>
              {mode === "signin" ? <LogIn className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </>
          )}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/5"></span>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.4em] font-black">
          <span className="bg-[#000]/0 px-4 text-white/20">Third Party Access</span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        className="group w-full flex items-center justify-center space-x-4 rounded-2xl bg-white/5 py-5 font-heading text-lg font-black text-white transition-all hover:bg-white hover:text-black border border-white/10 uppercase tracking-tight"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="currentColor"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="currentColor"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            fill="currentColor"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="currentColor"
          />
        </svg>
        <span>Secure with Google</span>
      </button>

      <div className="text-center pt-4">
        <button 
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-white/40 text-[10px] uppercase tracking-widest font-black hover:text-white transition-colors group flex items-center justify-center gap-2 mx-auto"
        >
          {mode === "signin" ? "New Operative? Register Identity" : "Already Registered? Sign In"}
          <ChevronRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
