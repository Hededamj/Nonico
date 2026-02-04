import { create } from "zustand";
import { supabase } from "../supabase";

interface Checkin {
  id: string;
  user_id: string;
  date: string;
  mood: number;
  cravings: number;
  notes: string | null;
}

interface CrisisLog {
  id: string;
  user_id: string;
  timestamp: string;
  type: "craving" | "slip";
  duration: number | null;
  coping_method: string | null;
}

interface CheckinState {
  todayCheckin: Checkin | null;
  checkins: Checkin[];
  crisisLogs: CrisisLog[];
  isLoading: boolean;
  hasCheckedInToday: () => boolean;
  fetchTodayCheckin: (userId: string) => Promise<void>;
  fetchCheckins: (userId: string) => Promise<void>;
  createCheckin: (
    userId: string,
    mood: number,
    cravings: number,
    notes?: string
  ) => Promise<{ error: Error | null }>;
  logCrisis: (
    userId: string,
    type: "craving" | "slip",
    duration?: number,
    copingMethod?: string
  ) => Promise<{ error: Error | null }>;
  fetchCrisisLogs: (userId: string) => Promise<void>;
}

const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export const useCheckinStore = create<CheckinState>((set, get) => ({
  todayCheckin: null,
  checkins: [],
  crisisLogs: [],
  isLoading: false,

  hasCheckedInToday: () => {
    const { todayCheckin } = get();
    if (!todayCheckin) return false;
    return todayCheckin.date === getTodayDateString();
  },

  fetchTodayCheckin: async (userId) => {
    set({ isLoading: true });
    try {
      const today = getTodayDateString();
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", userId)
        .eq("date", today)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      set({ todayCheckin: data as Checkin | null });
    } catch (error) {
      console.error("Error fetching today's checkin:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchCheckins: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("checkins")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false })
        .limit(30);

      if (error) throw error;
      set({ checkins: data as Checkin[] });
    } catch (error) {
      console.error("Error fetching checkins:", error);
    }
  },

  createCheckin: async (userId, mood, cravings, notes) => {
    try {
      const today = getTodayDateString();
      const { data, error } = await supabase
        .from("checkins")
        .insert({
          user_id: userId,
          date: today,
          mood,
          cravings,
          notes: notes || null,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      set({ todayCheckin: data as Checkin });
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  logCrisis: async (userId, type, duration, copingMethod) => {
    try {
      const { error } = await supabase.from("crisis_logs").insert({
        user_id: userId,
        timestamp: new Date().toISOString(),
        type,
        duration: duration || null,
        coping_method: copingMethod || null,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  },

  fetchCrisisLogs: async (userId) => {
    try {
      const { data, error } = await supabase
        .from("crisis_logs")
        .select("*")
        .eq("user_id", userId)
        .order("timestamp", { ascending: false })
        .limit(50);

      if (error) throw error;
      set({ crisisLogs: data as CrisisLog[] });
    } catch (error) {
      console.error("Error fetching crisis logs:", error);
    }
  },
}));
