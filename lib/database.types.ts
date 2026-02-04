export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type NicotineType = "snus" | "vape" | "cigarettes";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          quit_date: string | null;
          nicotine_types: NicotineType[];
          daily_cost: number;
          daily_units: number;
          motivation: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          quit_date?: string | null;
          nicotine_types?: NicotineType[];
          daily_cost?: number;
          daily_units?: number;
          motivation?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          quit_date?: string | null;
          nicotine_types?: NicotineType[];
          daily_cost?: number;
          daily_units?: number;
          motivation?: string | null;
          updated_at?: string;
        };
      };
      achievements: {
        Row: {
          id: string;
          name: string;
          name_da: string;
          description: string;
          description_da: string;
          icon: string;
          requirement_type: "streak" | "savings" | "checkins" | "pet";
          requirement_value: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          name_da: string;
          description: string;
          description_da: string;
          icon: string;
          requirement_type: "streak" | "savings" | "checkins" | "pet";
          requirement_value: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          name_da?: string;
          description?: string;
          description_da?: string;
          icon?: string;
          requirement_type?: "streak" | "savings" | "checkins" | "pet";
          requirement_value?: number;
        };
      };
      user_achievements: {
        Row: {
          id: string;
          user_id: string;
          achievement_id: string;
          unlocked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          achievement_id: string;
          unlocked_at?: string;
        };
        Update: {
          user_id?: string;
          achievement_id?: string;
          unlocked_at?: string;
        };
      };
      checkins: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mood: number;
          cravings: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mood: number;
          cravings: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          mood?: number;
          cravings?: number;
          notes?: string | null;
        };
      };
      crisis_logs: {
        Row: {
          id: string;
          user_id: string;
          timestamp: string;
          type: "craving" | "slip";
          duration: number | null;
          coping_method: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          timestamp?: string;
          type: "craving" | "slip";
          duration?: number | null;
          coping_method?: string | null;
        };
        Update: {
          type?: "craving" | "slip";
          duration?: number | null;
          coping_method?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          anonymous_name: string;
          content: string;
          type: "struggle" | "victory" | "milestone";
          created_at: string;
          is_hidden: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          anonymous_name: string;
          content: string;
          type: "struggle" | "victory" | "milestone";
          created_at?: string;
          is_hidden?: boolean;
        };
        Update: {
          content?: string;
          type?: "struggle" | "victory" | "milestone";
          is_hidden?: boolean;
        };
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: {
          emoji?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          post_id: string;
          reporter_id: string;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          reporter_id: string;
          reason: string;
          created_at?: string;
        };
        Update: {
          reason?: string;
        };
      };
      pet: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          health: number;
          happiness: number;
          hunger: number;
          outfit: string | null;
          accessories: string[];
          is_alive: boolean;
          last_fed: string;
          last_interaction: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name?: string;
          health?: number;
          happiness?: number;
          hunger?: number;
          outfit?: string | null;
          accessories?: string[];
          is_alive?: boolean;
          last_fed?: string;
          last_interaction?: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          health?: number;
          happiness?: number;
          hunger?: number;
          outfit?: string | null;
          accessories?: string[];
          is_alive?: boolean;
          last_fed?: string;
          last_interaction?: string;
        };
      };
      pet_inventory: {
        Row: {
          id: string;
          user_id: string;
          item_type: "food" | "outfit" | "accessory";
          item_id: string;
          quantity: number;
          acquired_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          item_type: "food" | "outfit" | "accessory";
          item_id: string;
          quantity?: number;
          acquired_at?: string;
        };
        Update: {
          quantity?: number;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
