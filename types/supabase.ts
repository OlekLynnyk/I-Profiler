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
          stripe_event_id: string | null;
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
          stripe_event_id?: string | null;
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
          stripe_event_id?: string | null;
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
      consent_logs: {
        Row: {
          id: number;
          consent_id: string;
          pref: string; // 'accepted' | 'rejected' | 'necessary' | 'custom'
          f: number | null; // 0/1
          a: number | null; // 0/1
          m: number | null; // 0/1
          banner_version: string;
          locale: string | null;
          region: string | null;
          ts: number; // client millis since epoch
          inserted_at: string; // timestamptz -> ISO string
        };
        Insert: {
          id?: number;
          consent_id: string;
          pref: string;
          f?: number | null;
          a?: number | null;
          m?: number | null;
          banner_version: string;
          locale?: string | null;
          region?: string | null;
          ts: number;
          inserted_at?: string;
        };
        Update: {
          id?: number;
          consent_id?: string;
          pref?: string;
          f?: number | null;
          a?: number | null;
          m?: number | null;
          banner_version?: string;
          locale?: string | null;
          region?: string | null;
          ts?: number;
          inserted_at?: string;
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
          onboarding_home_desktop_seen: boolean;
          onboarding_home_mobile_seen: boolean;
          onboarding_ws_cdrs_desktop_seen: boolean;
          onboarding_ws_cdrs_mobile_seen: boolean;
          onboarding_ws_first_image_drag_desktop_seen: boolean;
          onboarding_ws_first_image_drag_mobile_seen: boolean;
          onboarding_ws_step1_desktop_seen: boolean;
          onboarding_ws_step1_mobile_seen: boolean;
          onboarding_ws_step2_desktop_seen: boolean;
          onboarding_ws_step2_mobile_seen: boolean;
          onboarding_ws_step3_desktop_seen: boolean;
          onboarding_ws_step3_mobile_seen: boolean;
          onboarding_ws_step4_desktop_seen: boolean;
          onboarding_ws_step4_mobile_seen: boolean;
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
          onboarding_home_desktop_seen?: boolean;
          onboarding_home_mobile_seen?: boolean;
          onboarding_ws_cdrs_desktop_seen?: boolean;
          onboarding_ws_cdrs_mobile_seen?: boolean;
          onboarding_ws_first_image_drag_desktop_seen?: boolean;
          onboarding_ws_first_image_drag_mobile_seen?: boolean;
          onboarding_ws_step1_desktop_seen?: boolean;
          onboarding_ws_step1_mobile_seen?: boolean;
          onboarding_ws_step2_desktop_seen?: boolean;
          onboarding_ws_step2_mobile_seen?: boolean;
          onboarding_ws_step3_desktop_seen?: boolean;
          onboarding_ws_step3_mobile_seen?: boolean;
          onboarding_ws_step4_desktop_seen?: boolean;
          onboarding_ws_step4_mobile_seen?: boolean;
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
          onboarding_home_desktop_seen?: boolean;
          onboarding_home_mobile_seen?: boolean;
          onboarding_ws_cdrs_desktop_seen?: boolean;
          onboarding_ws_cdrs_mobile_seen?: boolean;
          onboarding_ws_first_image_drag_desktop_seen?: boolean;
          onboarding_ws_first_image_drag_mobile_seen?: boolean;
          onboarding_ws_step1_desktop_seen?: boolean;
          onboarding_ws_step1_mobile_seen?: boolean;
          onboarding_ws_step2_desktop_seen?: boolean;
          onboarding_ws_step2_mobile_seen?: boolean;
          onboarding_ws_step3_desktop_seen?: boolean;
          onboarding_ws_step3_mobile_seen?: boolean;
          onboarding_ws_step4_desktop_seen?: boolean;
          onboarding_ws_step4_mobile_seen?: boolean;
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
          folder: string | null;
          id: string;
          profile_name: string | null;
          saved_at: number;
          user_id: string;
        };
        Insert: {
          chat_json: Json;
          folder?: string | null;
          id?: string;
          profile_name?: string | null;
          saved_at: number;
          user_id: string;
        };
        Update: {
          chat_json?: Json;
          folder?: string | null;
          id?: string;
          profile_name?: string | null;
          saved_at?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      template_folders: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          order: number | null;
          system: boolean;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          order?: number | null;
          system?: boolean;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          order?: number | null;
          system?: boolean;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      template_items: {
        Row: {
          content: string;
          created_at: string;
          folder: string | null;
          id: string;
          system: boolean;
          title: string;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          content: string;
          created_at?: string;
          folder?: string | null;
          id?: string;
          system?: boolean;
          title: string;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string;
          folder?: string | null;
          id?: string;
          system?: boolean;
          title?: string;
          updated_at?: string;
          user_id?: string | null;
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
      user_log: {
        Row: {
          action: string;
          created_at: string | null;
          id: string;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          action: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          action?: string;
          created_at?: string | null;
          id?: string;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_log_actions_ref: {
        Row: {
          action: string;
        };
        Insert: {
          action: string;
        };
        Update: {
          action?: string;
        };
        Relationships: [];
      };
      user_log_retention: {
        Row: {
          id: boolean;
          keep_days: number;
        };
        Insert: {
          id?: boolean;
          keep_days?: number;
        };
        Update: {
          id?: boolean;
          keep_days?: number;
        };
        Relationships: [];
      };
      user_log_settings: {
        Row: {
          drop_rate: number;
          id: boolean;
        };
        Insert: {
          drop_rate?: number;
          id?: boolean;
        };
        Update: {
          drop_rate?: number;
          id?: boolean;
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
      user_log_recent: {
        Row: {
          action: string | null;
          created_at: string | null;
          id: string | null;
          metadata: Json | null;
          user_id: string | null;
        };
        Insert: {
          action?: string | null;
          created_at?: string | null;
          id?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Update: {
          action?: string | null;
          created_at?: string | null;
          id?: string | null;
          metadata?: Json | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      _upsert_system_template: {
        Args: { p_content: string; p_folder: string; p_title: string };
        Returns: undefined;
      };
      user_log_retention_delete: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      user_log_should_drop: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          owner_id: string | null;
          public: boolean | null;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          owner_id?: string | null;
          public?: boolean | null;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string | null;
        };
        Relationships: [];
      };
      buckets_analytics: {
        Row: {
          created_at: string;
          format: string;
          id: string;
          type: Database['storage']['Enums']['buckettype'];
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          format?: string;
          id: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          format?: string;
          id?: string;
          type?: Database['storage']['Enums']['buckettype'];
          updated_at?: string;
        };
        Relationships: [];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          level: number | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          owner_id: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          user_metadata: Json | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          level?: number | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          owner_id?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          user_metadata?: Json | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'objects_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      prefixes: {
        Row: {
          bucket_id: string;
          created_at: string | null;
          level: number;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          bucket_id: string;
          created_at?: string | null;
          level?: number;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          bucket_id?: string;
          created_at?: string | null;
          level?: number;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'prefixes_bucketId_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads: {
        Row: {
          bucket_id: string;
          created_at: string;
          id: string;
          in_progress_size: number;
          key: string;
          owner_id: string | null;
          upload_signature: string;
          user_metadata: Json | null;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          id: string;
          in_progress_size?: number;
          key: string;
          owner_id?: string | null;
          upload_signature: string;
          user_metadata?: Json | null;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          id?: string;
          in_progress_size?: number;
          key?: string;
          owner_id?: string | null;
          upload_signature?: string;
          user_metadata?: Json | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
        ];
      };
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string;
          created_at: string;
          etag: string;
          id: string;
          key: string;
          owner_id: string | null;
          part_number: number;
          size: number;
          upload_id: string;
          version: string;
        };
        Insert: {
          bucket_id: string;
          created_at?: string;
          etag: string;
          id?: string;
          key: string;
          owner_id?: string | null;
          part_number: number;
          size?: number;
          upload_id: string;
          version: string;
        };
        Update: {
          bucket_id?: string;
          created_at?: string;
          etag?: string;
          id?: string;
          key?: string;
          owner_id?: string | null;
          part_number?: number;
          size?: number;
          upload_id?: string;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
            columns: ['bucket_id'];
            isOneToOne: false;
            referencedRelation: 'buckets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
            columns: ['upload_id'];
            isOneToOne: false;
            referencedRelation: 's3_multipart_uploads';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      add_prefixes: {
        Args: { _bucket_id: string; _name: string };
        Returns: undefined;
      };
      can_insert_object: {
        Args: { bucketid: string; metadata: Json; name: string; owner: string };
        Returns: undefined;
      };
      delete_leaf_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      delete_prefix: {
        Args: { _bucket_id: string; _name: string };
        Returns: boolean;
      };
      extension: {
        Args: { name: string };
        Returns: string;
      };
      filename: {
        Args: { name: string };
        Returns: string;
      };
      foldername: {
        Args: { name: string };
        Returns: string[];
      };
      get_level: {
        Args: { name: string };
        Returns: number;
      };
      get_prefix: {
        Args: { name: string };
        Returns: string;
      };
      get_prefixes: {
        Args: { name: string };
        Returns: string[];
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          bucket_id: string;
          size: number;
        }[];
      };
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_key_token?: string;
          next_upload_token?: string;
          prefix_param: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
        }[];
      };
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string;
          delimiter_param: string;
          max_keys?: number;
          next_token?: string;
          prefix_param: string;
          start_after?: string;
        };
        Returns: {
          id: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      lock_top_prefixes: {
        Args: { bucket_ids: string[]; names: string[] };
        Returns: undefined;
      };
      operation: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      search: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_legacy_v1: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v1_optimised: {
        Args: {
          bucketname: string;
          levels?: number;
          limits?: number;
          offsets?: number;
          prefix: string;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
      search_v2: {
        Args: {
          bucket_name: string;
          levels?: number;
          limits?: number;
          prefix: string;
          sort_column?: string;
          sort_column_after?: string;
          sort_order?: string;
          start_after?: string;
        };
        Returns: {
          created_at: string;
          id: string;
          key: string;
          last_accessed_at: string;
          metadata: Json;
          name: string;
          updated_at: string;
        }[];
      };
    };
    Enums: {
      buckettype: 'STANDARD' | 'ANALYTICS';
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
  storage: {
    Enums: {
      buckettype: ['STANDARD', 'ANALYTICS'],
    },
  },
} as const;
