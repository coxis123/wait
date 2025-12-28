export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          display_name: string | null;
          total_saved: number;
          items_skipped: number;
          current_streak: number;
          longest_streak: number;
          last_decision_date: string | null;
          push_token: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          display_name?: string | null;
          total_saved?: number;
          items_skipped?: number;
          current_streak?: number;
          longest_streak?: number;
          last_decision_date?: string | null;
          push_token?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          display_name?: string | null;
          total_saved?: number;
          items_skipped?: number;
          current_streak?: number;
          longest_streak?: number;
          last_decision_date?: string | null;
          push_token?: string | null;
        };
        Relationships: [];
      };
      wait_items: {
        Row: {
          id: string;
          user_id: string;
          created_at: string;
          name: string;
          price: number;
          url: string | null;
          note: string | null;
          wait_days: number;
          decision_due_at: string;
          status: 'waiting' | 'skipped' | 'bought';
          decided_at: string | null;
          reminder_sent: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          created_at?: string;
          name: string;
          price: number;
          url?: string | null;
          note?: string | null;
          wait_days?: number;
          decision_due_at: string;
          status?: 'waiting' | 'skipped' | 'bought';
          decided_at?: string | null;
          reminder_sent?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          created_at?: string;
          name?: string;
          price?: number;
          url?: string | null;
          note?: string | null;
          wait_days?: number;
          decision_due_at?: string;
          status?: 'waiting' | 'skipped' | 'bought';
          decided_at?: string | null;
          reminder_sent?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: 'wait_items_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type WaitItem = Database['public']['Tables']['wait_items']['Row'];
export type InsertWaitItem = Database['public']['Tables']['wait_items']['Insert'];
export type UpdateWaitItem = Database['public']['Tables']['wait_items']['Update'];
