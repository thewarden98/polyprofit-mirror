export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      copies: {
        Row: {
          created_at: string
          current_value: number
          duration_days: number
          end_date: string
          id: string
          locked_amount: number
          platform_fee_percent: number
          profit_loss: number | null
          start_date: string
          status: Database["public"]["Enums"]["copy_status"] | null
          transaction_hash: string | null
          updated_at: string
          user_id: string
          whale_id: string
          whale_share_percent: number
        }
        Insert: {
          created_at?: string
          current_value: number
          duration_days: number
          end_date: string
          id?: string
          locked_amount: number
          platform_fee_percent?: number
          profit_loss?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["copy_status"] | null
          transaction_hash?: string | null
          updated_at?: string
          user_id: string
          whale_id: string
          whale_share_percent?: number
        }
        Update: {
          created_at?: string
          current_value?: number
          duration_days?: number
          end_date?: string
          id?: string
          locked_amount?: number
          platform_fee_percent?: number
          profit_loss?: number | null
          start_date?: string
          status?: Database["public"]["Enums"]["copy_status"] | null
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string
          whale_id?: string
          whale_share_percent?: number
        }
        Relationships: [
          {
            foreignKeyName: "copies_whale_id_fkey"
            columns: ["whale_id"]
            isOneToOne: false
            referencedRelation: "whales"
            referencedColumns: ["id"]
          },
        ]
      }
      mirrored_positions: {
        Row: {
          copy_id: string
          created_at: string
          current_price: number | null
          entry_price: number
          id: string
          market_category: Database["public"]["Enums"]["whale_category"] | null
          market_id: string
          market_title: string
          outcome: Database["public"]["Enums"]["position_outcome"] | null
          polymarket_event_id: string | null
          position_side: string
          position_size: number
          profit_loss: number | null
          updated_at: string
          user_id: string
          whale_id: string
        }
        Insert: {
          copy_id: string
          created_at?: string
          current_price?: number | null
          entry_price: number
          id?: string
          market_category?: Database["public"]["Enums"]["whale_category"] | null
          market_id: string
          market_title: string
          outcome?: Database["public"]["Enums"]["position_outcome"] | null
          polymarket_event_id?: string | null
          position_side: string
          position_size: number
          profit_loss?: number | null
          updated_at?: string
          user_id: string
          whale_id: string
        }
        Update: {
          copy_id?: string
          created_at?: string
          current_price?: number | null
          entry_price?: number
          id?: string
          market_category?: Database["public"]["Enums"]["whale_category"] | null
          market_id?: string
          market_title?: string
          outcome?: Database["public"]["Enums"]["position_outcome"] | null
          polymarket_event_id?: string | null
          position_side?: string
          position_size?: number
          profit_loss?: number | null
          updated_at?: string
          user_id?: string
          whale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mirrored_positions_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mirrored_positions_whale_id_fkey"
            columns: ["whale_id"]
            isOneToOne: false
            referencedRelation: "whales"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_whale: boolean | null
          total_locked: number | null
          total_profit: number | null
          updated_at: string
          user_id: string
          username: string | null
          wallet_address: string | null
          whale_id: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_whale?: boolean | null
          total_locked?: number | null
          total_profit?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          wallet_address?: string | null
          whale_id?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_whale?: boolean | null
          total_locked?: number | null
          total_profit?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          wallet_address?: string | null
          whale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_whale_id_fkey"
            columns: ["whale_id"]
            isOneToOne: false
            referencedRelation: "whales"
            referencedColumns: ["id"]
          },
        ]
      }
      whale_earnings: {
        Row: {
          copy_id: string
          earned_amount: number
          earned_at: string
          follower_user_id: string
          id: string
          whale_id: string
        }
        Insert: {
          copy_id: string
          earned_amount: number
          earned_at?: string
          follower_user_id: string
          id?: string
          whale_id: string
        }
        Update: {
          copy_id?: string
          earned_amount?: number
          earned_at?: string
          follower_user_id?: string
          id?: string
          whale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whale_earnings_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "copies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whale_earnings_whale_id_fkey"
            columns: ["whale_id"]
            isOneToOne: false
            referencedRelation: "whales"
            referencedColumns: ["id"]
          },
        ]
      }
      whales: {
        Row: {
          avatar_url: string | null
          badges: string[] | null
          bio: string | null
          category: Database["public"]["Enums"]["whale_category"] | null
          created_at: string
          follower_count: number | null
          id: string
          is_verified: boolean | null
          total_profit: number | null
          total_trades: number | null
          total_volume: number | null
          updated_at: string
          username: string | null
          wallet_address: string
          win_rate: number | null
          winning_trades: number | null
        }
        Insert: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          category?: Database["public"]["Enums"]["whale_category"] | null
          created_at?: string
          follower_count?: number | null
          id?: string
          is_verified?: boolean | null
          total_profit?: number | null
          total_trades?: number | null
          total_volume?: number | null
          updated_at?: string
          username?: string | null
          wallet_address: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Update: {
          avatar_url?: string | null
          badges?: string[] | null
          bio?: string | null
          category?: Database["public"]["Enums"]["whale_category"] | null
          created_at?: string
          follower_count?: number | null
          id?: string
          is_verified?: boolean | null
          total_profit?: number | null
          total_trades?: number | null
          total_volume?: number | null
          updated_at?: string
          username?: string | null
          wallet_address?: string
          win_rate?: number | null
          winning_trades?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      copy_status: "active" | "completed" | "cancelled"
      position_outcome: "pending" | "won" | "lost"
      whale_category:
        | "politics"
        | "crypto"
        | "sports"
        | "entertainment"
        | "general"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      copy_status: ["active", "completed", "cancelled"],
      position_outcome: ["pending", "won", "lost"],
      whale_category: [
        "politics",
        "crypto",
        "sports",
        "entertainment",
        "general",
      ],
    },
  },
} as const
