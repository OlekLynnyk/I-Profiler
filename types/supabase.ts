export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      billing_logs: {
        Row: {
          created_at: string;
          error_message: string | null;
          event_type: string;
          id: string;
          payload: Json;
          status: string;
          stripe_customer_id: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          error_message?: string | null;
          event_type: string;
          id?: string;
          payload: Json;
          status: string;
          stripe_customer_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          error_message?: string | null;
          event_type?: string;
          id?: string;
          payload?: Json;
          status?: string;
          stripe_customer_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      chat_messages: {
        Row: {
          content: string;
          id: string;
          profile_id: string | null;
          profile_name: string | null;
          role: string;
          timestamp: number;
          type: string | null;
          user_id: string | null;
        };
        Insert: {
          content: string;
          id?: string;
          profile_id?: string | null;
          profile_name?: string | null;
          role: string;
          timestamp: number;
          type?: string | null;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          id?: string;
          profile_id?: string | null;
          profile_name?: string | null;
          role?: string;
          timestamp?: number;
          type?: string | null;
          user_id?: string | null;
        };
        Relationships: [];
      };
      message_ratings: {
        Row: {
          id: string;
          inserted_at: string | null;
          message_id: string;
          rating: string | null;
          timestamp: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          inserted_at?: string | null;
          message_id: string;
          rating?: string | null;
          timestamp: number;
          user_id: string;
        };
        Update: {
          id?: string;
          inserted_at?: string | null;
          message_id?: string;
          rating?: string | null;
          timestamp?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          agreed_to_terms: boolean | null;
          avatar_url: string | null;
          created_at: string;
          deleted_at: string | null;
          email: string | null;
          email_verified: boolean | null;
          full_name: string | null;
          id: string;
          is_deleted: boolean | null;
          role: string | null;
          updated_at: string | null;
        };
        Insert: {
          agreed_to_terms?: boolean | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          email_verified?: boolean | null;
          full_name?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Update: {
          agreed_to_terms?: boolean | null;
          avatar_url?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          email?: string | null;
          email_verified?: boolean | null;
          full_name?: string | null;
          id?: string;
          is_deleted?: boolean | null;
          role?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          created_at: string | null;
          description: string | null;
          id: string;
          name: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          id?: string;
          name?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      saved_chats: {
        Row: {
          chat_json: Json;
          id: string;
          profile_name: string | null;
          saved_at: number;
          user_id: string;
        };
        Insert: {
          chat_json: Json;
          id?: string;
          profile_name?: string | null;
          saved_at: number;
          user_id: string;
        };
        Update: {
          chat_json?: Json;
          id?: string;
          profile_name?: string | null;
          saved_at?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      user_limits: {
        Row: {
          active: boolean;
          created_at: string | null;
          daily_limit: number;
          limit_reset_at: string | null;
          monthly_limit: number | null;
          monthly_reset_at: string | null;
          plan: string;
          timezone: string | null;
          updated_at: string | null;
          used_monthly: number | null;
          used_today: number;
          user_id: string;
        };
        Insert: {
          active?: boolean;
          created_at?: string | null;
          daily_limit?: number;
          limit_reset_at?: string | null;
          monthly_limit?: number | null;
          monthly_reset_at?: string | null;
          plan?: string;
          timezone?: string | null;
          updated_at?: string | null;
          used_monthly?: number | null;
          used_today?: number;
          user_id: string;
        };
        Update: {
          active?: boolean;
          created_at?: string | null;
          daily_limit?: number;
          limit_reset_at?: string | null;
          monthly_limit?: number | null;
          monthly_reset_at?: string | null;
          plan?: string;
          timezone?: string | null;
          updated_at?: string | null;
          used_monthly?: number | null;
          used_today?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      user_subscription: {
        Row: {
          active: boolean | null;
          cancel_at_period_end: boolean | null;
          created_at: string;
          current_period_start: string | null;
          id: number;
          package_type: string | null;
          plan: string | null;
          status: string | null;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          subscription_ends_at: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          active?: boolean | null;
          cancel_at_period_end?: boolean | null;
          created_at: string;
          current_period_start?: string | null;
          id?: number;
          package_type?: string | null;
          plan?: string | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_ends_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Update: {
          active?: boolean | null;
          cancel_at_period_end?: boolean | null;
          created_at?: string;
          current_period_start?: string | null;
          id?: number;
          package_type?: string | null;
          plan?: string | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          subscription_ends_at?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
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
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
