export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      admin_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      api_connections: {
        Row: {
          api_key_encrypted: string
          api_provider: string
          created_at: string | null
          id: string
          is_active: boolean | null
          last_test_at: string | null
          permissions: Json | null
          secret_key_encrypted: string
          test_connection_status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          api_key_encrypted: string
          api_provider: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          permissions?: Json | null
          secret_key_encrypted: string
          test_connection_status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          api_key_encrypted?: string
          api_provider?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_test_at?: string | null
          permissions?: Json | null
          secret_key_encrypted?: string
          test_connection_status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          likes_count: number | null
          mentions: string[] | null
          replies_count: number | null
          reply_to_post_id: string | null
          reply_to_username: string | null
          retweets_count: number | null
          shares_count: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          likes_count?: number | null
          mentions?: string[] | null
          replies_count?: number | null
          reply_to_post_id?: string | null
          reply_to_username?: string | null
          retweets_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          likes_count?: number | null
          mentions?: string[] | null
          replies_count?: number | null
          reply_to_post_id?: string | null
          reply_to_username?: string | null
          retweets_count?: number | null
          shares_count?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_reply_to_post_id_fkey"
            columns: ["reply_to_post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      current_operations: {
        Row: {
          buy_price: number
          created_at: string | null
          id: string
          pair: string
          profit: number
          progress: number | null
          sell_price: number
          status: string | null
          time_remaining: number | null
          updated_at: string | null
          user_investment_id: string
        }
        Insert: {
          buy_price: number
          created_at?: string | null
          id?: string
          pair: string
          profit: number
          progress?: number | null
          sell_price: number
          status?: string | null
          time_remaining?: number | null
          updated_at?: string | null
          user_investment_id: string
        }
        Update: {
          buy_price?: number
          created_at?: string | null
          id?: string
          pair?: string
          profit?: number
          progress?: number | null
          sell_price?: number
          status?: string | null
          time_remaining?: number | null
          updated_at?: string | null
          user_investment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "current_operations_user_investment_id_fkey"
            columns: ["user_investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      deposits: {
        Row: {
          amount_brl: number | null
          amount_usd: number
          cpf: string | null
          created_at: string | null
          exchange_rate: number | null
          holder_name: string | null
          id: string
          pix_code: string | null
          sender_name: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount_brl?: number | null
          amount_usd: number
          cpf?: string | null
          created_at?: string | null
          exchange_rate?: number | null
          holder_name?: string | null
          id?: string
          pix_code?: string | null
          sender_name?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount_brl?: number | null
          amount_usd?: number
          cpf?: string | null
          created_at?: string | null
          exchange_rate?: number | null
          holder_name?: string | null
          id?: string
          pix_code?: string | null
          sender_name?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: []
      }
      investment_plans: {
        Row: {
          created_at: string | null
          daily_rate: number
          description: string | null
          duration_days: number
          id: string
          maximum_amount: number
          minimum_amount: number
          name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_rate: number
          description?: string | null
          duration_days: number
          id?: string
          maximum_amount: number
          minimum_amount: number
          name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          duration_days?: number
          id?: string
          maximum_amount?: number
          minimum_amount?: number
          name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_24h: number | null
          created_at: string | null
          data_source: string | null
          high_24h: number | null
          id: string
          low_24h: number | null
          market_cap: number | null
          price: number
          rank: number | null
          symbol: string
          volume_24h: number | null
        }
        Insert: {
          change_24h?: number | null
          created_at?: string | null
          data_source?: string | null
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          market_cap?: number | null
          price: number
          rank?: number | null
          symbol: string
          volume_24h?: number | null
        }
        Update: {
          change_24h?: number | null
          created_at?: string | null
          data_source?: string | null
          high_24h?: number | null
          id?: string
          low_24h?: number | null
          market_cap?: number | null
          price?: number
          rank?: number | null
          symbol?: string
          volume_24h?: number | null
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_interactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "community_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          api_connected: boolean | null
          avatar: string | null
          badge: string | null
          balance: number | null
          bio: string | null
          city: string | null
          created_at: string | null
          display_name: string | null
          earnings: number | null
          email: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          join_date: string | null
          last_login: string | null
          level: number | null
          location: string | null
          monthly_earnings: number | null
          posts_count: number | null
          referral_balance: number | null
          residual_balance: number | null
          role: string | null
          state: string | null
          status: string | null
          total_profit: number | null
          updated_at: string | null
          user_id: string
          username: string | null
          verified: boolean | null
          whatsapp: string | null
        }
        Insert: {
          api_connected?: boolean | null
          avatar?: string | null
          badge?: string | null
          balance?: number | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          earnings?: number | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          join_date?: string | null
          last_login?: string | null
          level?: number | null
          location?: string | null
          monthly_earnings?: number | null
          posts_count?: number | null
          referral_balance?: number | null
          residual_balance?: number | null
          role?: string | null
          state?: string | null
          status?: string | null
          total_profit?: number | null
          updated_at?: string | null
          user_id: string
          username?: string | null
          verified?: boolean | null
          whatsapp?: string | null
        }
        Update: {
          api_connected?: boolean | null
          avatar?: string | null
          badge?: string | null
          balance?: number | null
          bio?: string | null
          city?: string | null
          created_at?: string | null
          display_name?: string | null
          earnings?: number | null
          email?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          join_date?: string | null
          last_login?: string | null
          level?: number | null
          location?: string | null
          monthly_earnings?: number | null
          posts_count?: number | null
          referral_balance?: number | null
          residual_balance?: number | null
          role?: string | null
          state?: string | null
          status?: string | null
          total_profit?: number | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
          verified?: boolean | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_rate: number | null
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string | null
          total_commission: number | null
          updated_at: string | null
        }
        Insert: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string | null
          total_commission?: number | null
          updated_at?: string | null
        }
        Update: {
          commission_rate?: number | null
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string | null
          total_commission?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      residual_earnings: {
        Row: {
          amount: number
          created_at: string | null
          from_user_id: string
          id: string
          investment_id: string | null
          level: number
          percentage: number
          status: string | null
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          from_user_id: string
          id?: string
          investment_id?: string | null
          level: number
          percentage: number
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          from_user_id?: string
          id?: string
          investment_id?: string | null
          level?: number
          percentage?: number
          status?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "residual_earnings_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_history: {
        Row: {
          amount: number
          buy_price: number
          created_at: string | null
          exchange_1: string | null
          exchange_2: string | null
          execution_time: number | null
          id: string
          operation_id: string
          pair: string
          profit: number
          profit_percent: number
          sell_price: number
          status: string | null
          strategy: string | null
          type: string | null
          user_id: string
        }
        Insert: {
          amount: number
          buy_price: number
          created_at?: string | null
          exchange_1?: string | null
          exchange_2?: string | null
          execution_time?: number | null
          id?: string
          operation_id: string
          pair: string
          profit: number
          profit_percent: number
          sell_price: number
          status?: string | null
          strategy?: string | null
          type?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          buy_price?: number
          created_at?: string | null
          exchange_1?: string | null
          exchange_2?: string | null
          execution_time?: number | null
          id?: string
          operation_id?: string
          pair?: string
          profit?: number
          profit_percent?: number
          sell_price?: number
          status?: string | null
          strategy?: string | null
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      treasure_chests: {
        Row: {
          chest_number: number
          created_at: string | null
          deposit_id: string | null
          id: string
          opened: boolean | null
          opened_at: string | null
          prize_amount: number
          user_id: string
        }
        Insert: {
          chest_number: number
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          opened?: boolean | null
          opened_at?: string | null
          prize_amount: number
          user_id: string
        }
        Update: {
          chest_number?: number
          created_at?: string | null
          deposit_id?: string | null
          id?: string
          opened?: boolean | null
          opened_at?: string | null
          prize_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treasure_chests_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string | null
          current_day_progress: number | null
          daily_rate: number
          daily_target: number
          days_remaining: number | null
          end_date: string
          id: string
          investment_plan_id: string
          operations_completed: number | null
          start_date: string | null
          status: string | null
          today_earnings: number | null
          total_earned: number | null
          total_operations: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          current_day_progress?: number | null
          daily_rate: number
          daily_target: number
          days_remaining?: number | null
          end_date: string
          id?: string
          investment_plan_id: string
          operations_completed?: number | null
          start_date?: string | null
          status?: string | null
          today_earnings?: number | null
          total_earned?: number | null
          total_operations?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_day_progress?: number | null
          daily_rate?: number
          daily_target?: number
          days_remaining?: number | null
          end_date?: string
          id?: string
          investment_plan_id?: string
          operations_completed?: number | null
          start_date?: string | null
          status?: string | null
          today_earnings?: number | null
          total_earned?: number | null
          total_operations?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_investments_investment_plan_id_fkey"
            columns: ["investment_plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          amount_brl: number | null
          amount_usd: number
          completed_date: string | null
          cpf: string | null
          created_at: string | null
          exchange_rate: number | null
          fee: number
          holder_name: string | null
          id: string
          net_amount: number
          pix_key: string | null
          pix_key_type: string | null
          processing_date: string | null
          rejection_reason: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          amount_brl?: number | null
          amount_usd: number
          completed_date?: string | null
          cpf?: string | null
          created_at?: string | null
          exchange_rate?: number | null
          fee?: number
          holder_name?: string | null
          id?: string
          net_amount: number
          pix_key?: string | null
          pix_key_type?: string | null
          processing_date?: string | null
          rejection_reason?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          amount_brl?: number | null
          amount_usd?: number
          completed_date?: string | null
          cpf?: string | null
          created_at?: string | null
          exchange_rate?: number | null
          fee?: number
          holder_name?: string | null
          id?: string
          net_amount?: number
          pix_key?: string | null
          pix_key_type?: string | null
          processing_date?: string | null
          rejection_reason?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string
          wallet_address?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
