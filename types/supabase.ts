// types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
