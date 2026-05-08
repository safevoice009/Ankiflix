"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { Settings, User, Save, Loader2, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileSettingsProps {
  initialProfile: {
    username: string | null;
    avatar_url: string | null;
  };
  userId: string;
}

export default function ProfileSettings({ initialProfile, userId }: ProfileSettingsProps) {
  const [username, setUsername] = useState(initialProfile.username || "");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.avatar_url || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async () => {
    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setIsUpdating(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        username: username.trim(),
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      });

    if (error) {
      if (error.code === '23505') {
        toast.error("Username already taken");
      } else {
        toast.error("Failed to update profile");
      }
    } else {
      toast.success("Identity Synchronized");
      setIsEditing(false);
      window.location.reload(); // Refresh to update all components
    }
    setIsUpdating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
          <Settings className="h-5 w-5 text-primary" />
          Agent Settings
        </h3>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition"
          >
            <Edit3 className="h-3 w-3" />
            Modify Identity
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Neural Signature (Username)</label>
            <input 
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ring-primary/50 transition"
              placeholder="Enter unique agent name..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Avatar URL</label>
            <input 
              type="text"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ring-primary/50 transition"
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleUpdate}
              disabled={isUpdating}
              className="flex-1 bg-primary py-3 rounded-xl font-black uppercase tracking-tighter hover:bg-primary/90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Sync Changes
            </button>
            <button 
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 rounded-xl bg-white/5 font-black uppercase tracking-tighter hover:bg-white/10 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#141414] border-2 border-primary flex items-center justify-center overflow-hidden">
                 {initialProfile.avatar_url ? (
                   <img src={initialProfile.avatar_url} className="h-full w-full object-cover" />
                 ) : (
                   <User className="h-6 w-6 text-white/20" />
                 )}
              </div>
              <div>
                <p className="text-sm font-black uppercase tracking-tighter text-white">
                  {initialProfile.username || "Agent Pending"}
                </p>
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Neural Signature</p>
              </div>
           </div>
           <div className="text-right">
              <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/30">
                 PREMIUM
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
