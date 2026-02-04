import { create } from "zustand";
import { supabase } from "../supabase";
import { NicotineType } from "../database.types";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  quit_date: string | null;
  nicotine_types: NicotineType[];
  daily_cost: number;
  daily_units: number;
  motivation: string | null;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  createProfile: (data: Partial<UserProfile> & { id: string; email: string }) => Promise<{ error: Error | null }>;
  getStreak: () => number;
  getMoneySaved: () => number;
  getTimeSinceQuit: () => { days: number; hours: number; minutes: number; seconds: number };
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,

  fetchProfile: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;
      set({ profile: data as UserProfile });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateProfile: async (data) => {
    const { profile } = get();
    if (!profile) return { error: new Error("No profile") };

    try {
      const { error } = await supabase
        .from("users")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", profile.id);

      if (error) throw error;
      set({ profile: { ...profile, ...data } });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  createProfile: async (data) => {
    try {
      const { error } = await supabase.from("users").insert({
        id: data.id,
        email: data.email,
        name: data.name,
        quit_date: data.quit_date,
        nicotine_types: data.nicotine_types || [],
        daily_cost: data.daily_cost || 0,
        daily_units: data.daily_units || 0,
        motivation: data.motivation,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      set({ profile: data as UserProfile });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  getStreak: () => {
    const { profile } = get();
    if (!profile?.quit_date) return 0;

    const quitDate = new Date(profile.quit_date);
    const now = new Date();
    const diffTime = now.getTime() - quitDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  getMoneySaved: () => {
    const { profile, getStreak } = get();
    if (!profile?.daily_cost) return 0;
    return getStreak() * profile.daily_cost;
  },

  getTimeSinceQuit: () => {
    const { profile } = get();
    if (!profile?.quit_date) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const quitDate = new Date(profile.quit_date);
    const now = new Date();
    let diff = now.getTime() - quitDate.getTime();

    if (diff < 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    const minutes = Math.floor(diff / (1000 * 60));
    diff -= minutes * (1000 * 60);

    const seconds = Math.floor(diff / 1000);

    return { days, hours, minutes, seconds };
  },
}));
