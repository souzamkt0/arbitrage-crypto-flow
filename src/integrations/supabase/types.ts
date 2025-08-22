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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_balance_transactions: {
        Row: {
          admin_user_id: string
          amount_after: number
          amount_before: number
          amount_changed: number
          created_at: string
          id: string
          reason: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_user_id: string
          amount_after?: number
          amount_before?: number
          amount_changed?: number
          created_at?: string
          id?: string
          reason?: string | null
          transaction_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_user_id?: string
          amount_after?: number
          amount_before?: number
          amount_changed?: number
          created_at?: string
          id?: string
          reason?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_balance_transactions_admin_user_id_fkey"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "admin_balance_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_admin_balance_transactions_admin_user_id"
            columns: ["admin_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "fk_admin_balance_transactions_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
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
          image_url: string | null
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
          image_url?: string | null
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
          image_url?: string | null
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
        Relationships: []
      }
      custom_users: {
        Row: {
          bio: string | null
          cover_image_url: string | null
          created_at: string
          custom_display_name: string | null
          custom_username: string | null
          id: string
          original_username: string
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_display_name?: string | null
          custom_username?: string | null
          id?: string
          original_username: string
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string
          custom_display_name?: string | null
          custom_username?: string | null
          id?: string
          original_username?: string
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      daily_earnings: {
        Row: {
          created_at: string | null
          date: string
          earnings: number
          id: string
          investment_id: string | null
          operations_count: number | null
        }
        Insert: {
          created_at?: string | null
          date: string
          earnings: number
          id?: string
          investment_id?: string | null
          operations_count?: number | null
        }
        Update: {
          created_at?: string | null
          date?: string
          earnings?: number
          id?: string
          investment_id?: string | null
          operations_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_earnings_investment_id_fkey"
            columns: ["investment_id"]
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
      digitopay_debug: {
        Row: {
          created_at: string | null
          id: string
          payload: Json
          tipo: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          payload: Json
          tipo: string
        }
        Update: {
          created_at?: string | null
          id?: string
          payload?: Json
          tipo?: string
        }
        Relationships: []
      }
      digitopay_transactions: {
        Row: {
          amount: number
          amount_brl: number
          callback_data: Json | null
          created_at: string | null
          gateway_response: Json | null
          id: string
          person_cpf: string | null
          person_name: string | null
          pix_code: string | null
          pix_key: string | null
          pix_key_type: string | null
          qr_code_base64: string | null
          status: string | null
          trx_id: string
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          amount_brl: number
          callback_data?: Json | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          person_cpf?: string | null
          person_name?: string | null
          pix_code?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          qr_code_base64?: string | null
          status?: string | null
          trx_id: string
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          amount_brl?: number
          callback_data?: Json | null
          created_at?: string | null
          gateway_response?: Json | null
          id?: string
          person_cpf?: string | null
          person_name?: string | null
          pix_code?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          qr_code_base64?: string | null
          status?: string | null
          trx_id?: string
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      facebook_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          privacy: string | null
          target_id: string | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          privacy?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          privacy?: string | null
          target_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_albums: {
        Row: {
          cover_photo_url: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string | null
          photos_count: number | null
          privacy: string | null
          updated_at: string | null
        }
        Insert: {
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id?: string | null
          photos_count?: number | null
          privacy?: string | null
          updated_at?: string | null
        }
        Update: {
          cover_photo_url?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string | null
          photos_count?: number | null
          privacy?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_albums_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_comments: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          media_url: string | null
          parent_comment_id: string | null
          post_id: string | null
          replies_count: number | null
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_url?: string | null
          parent_comment_id?: string | null
          post_id?: string | null
          replies_count?: number | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          media_url?: string | null
          parent_comment_id?: string | null
          post_id?: string | null
          replies_count?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "facebook_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "facebook_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_friendships: {
        Row: {
          addressee_id: string | null
          created_at: string | null
          id: string
          requester_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          addressee_id?: string | null
          created_at?: string | null
          id?: string
          requester_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_friendships_addressee_id_fkey"
            columns: ["addressee_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_likes: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string | null
          target_id: string
          target_type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          target_id: string
          target_type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string | null
          target_id?: string
          target_type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          recipient_id: string | null
          sender_id: string | null
          target_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          target_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          recipient_id?: string | null
          sender_id?: string | null
          target_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "facebook_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_notifications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_photos: {
        Row: {
          album_id: string | null
          alt_text: string | null
          caption: string | null
          comments_count: number | null
          created_at: string | null
          file_size: number | null
          height: number | null
          id: string
          likes_count: number | null
          owner_id: string | null
          post_id: string | null
          tags: Json | null
          url: string
          width: number | null
        }
        Insert: {
          album_id?: string | null
          alt_text?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          likes_count?: number | null
          owner_id?: string | null
          post_id?: string | null
          tags?: Json | null
          url: string
          width?: number | null
        }
        Update: {
          album_id?: string | null
          alt_text?: string | null
          caption?: string | null
          comments_count?: number | null
          created_at?: string | null
          file_size?: number | null
          height?: number | null
          id?: string
          likes_count?: number | null
          owner_id?: string | null
          post_id?: string | null
          tags?: Json | null
          url?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_photos_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "facebook_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_photos_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_photos_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "facebook_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_posts: {
        Row: {
          author_id: string | null
          comments_count: number | null
          content: string | null
          created_at: string | null
          feeling: string | null
          hashtags: string[] | null
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          link_preview: Json | null
          location: string | null
          media_urls: string[] | null
          mentions: string[] | null
          post_type: string | null
          privacy: string | null
          shares_count: number | null
          updated_at: string | null
          views_count: number | null
        }
        Insert: {
          author_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          feeling?: string | null
          hashtags?: string[] | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          link_preview?: Json | null
          location?: string | null
          media_urls?: string[] | null
          mentions?: string[] | null
          post_type?: string | null
          privacy?: string | null
          shares_count?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Update: {
          author_id?: string | null
          comments_count?: number | null
          content?: string | null
          created_at?: string | null
          feeling?: string | null
          hashtags?: string[] | null
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          link_preview?: Json | null
          location?: string | null
          media_urls?: string[] | null
          mentions?: string[] | null
          post_type?: string | null
          privacy?: string | null
          shares_count?: number | null
          updated_at?: string | null
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      facebook_profiles: {
        Row: {
          badge: string | null
          bio: string | null
          birth_date: string | null
          cover_photo_url: string | null
          created_at: string | null
          display_name: string
          earnings: number | null
          education: string | null
          email_public: boolean | null
          followers_count: number | null
          following_count: number | null
          friends_count: number | null
          id: string
          join_date: string | null
          last_active: string | null
          level: number | null
          location: string | null
          phone: string | null
          photos_count: number | null
          posts_count: number | null
          privacy_settings: Json | null
          profile_photo_url: string | null
          relationship_status: string | null
          updated_at: string | null
          user_id: string | null
          username: string
          verified: boolean | null
          website: string | null
          work: string | null
        }
        Insert: {
          badge?: string | null
          bio?: string | null
          birth_date?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name: string
          earnings?: number | null
          education?: string | null
          email_public?: boolean | null
          followers_count?: number | null
          following_count?: number | null
          friends_count?: number | null
          id?: string
          join_date?: string | null
          last_active?: string | null
          level?: number | null
          location?: string | null
          phone?: string | null
          photos_count?: number | null
          posts_count?: number | null
          privacy_settings?: Json | null
          profile_photo_url?: string | null
          relationship_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          username: string
          verified?: boolean | null
          website?: string | null
          work?: string | null
        }
        Update: {
          badge?: string | null
          bio?: string | null
          birth_date?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          display_name?: string
          earnings?: number | null
          education?: string | null
          email_public?: boolean | null
          followers_count?: number | null
          following_count?: number | null
          friends_count?: number | null
          id?: string
          join_date?: string | null
          last_active?: string | null
          level?: number | null
          location?: string | null
          phone?: string | null
          photos_count?: number | null
          posts_count?: number | null
          privacy_settings?: Json | null
          profile_photo_url?: string | null
          relationship_status?: string | null
          updated_at?: string | null
          user_id?: string | null
          username?: string
          verified?: boolean | null
          website?: string | null
          work?: string | null
        }
        Relationships: []
      }
      facebook_shares: {
        Row: {
          created_at: string | null
          id: string
          post_id: string | null
          privacy: string | null
          share_text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          privacy?: string | null
          share_text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string | null
          privacy?: string | null
          share_text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "facebook_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "facebook_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "facebook_shares_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "facebook_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_operations: {
        Row: {
          buy_price: number
          completed_at: string | null
          id: string
          investment_id: string | null
          pair: string
          profit: number | null
          progress: number | null
          sell_price: number | null
          started_at: string | null
          status: string | null
          time_remaining: number | null
        }
        Insert: {
          buy_price: number
          completed_at?: string | null
          id?: string
          investment_id?: string | null
          pair: string
          profit?: number | null
          progress?: number | null
          sell_price?: number | null
          started_at?: string | null
          status?: string | null
          time_remaining?: number | null
        }
        Update: {
          buy_price?: number
          completed_at?: string | null
          id?: string
          investment_id?: string | null
          pair?: string
          profit?: number | null
          progress?: number | null
          sell_price?: number | null
          started_at?: string | null
          status?: string | null
          time_remaining?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_operations_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "user_investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_plans: {
        Row: {
          created_at: string | null
          daily_rate: number
          description: string | null
          duration_days: number
          features: Json | null
          id: string
          max_investment_amount: number | null
          minimum_amount: number
          minimum_indicators: number
          name: string
          robot_version: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          daily_rate: number
          description?: string | null
          duration_days: number
          features?: Json | null
          id?: string
          max_investment_amount?: number | null
          minimum_amount: number
          minimum_indicators: number
          name: string
          robot_version: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          daily_rate?: number
          description?: string | null
          duration_days?: number
          features?: Json | null
          id?: string
          max_investment_amount?: number | null
          minimum_amount?: number
          minimum_indicators?: number
          name?: string
          robot_version?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      investment_returns: {
        Row: {
          created_at: string | null
          id: string
          investment_amount: number
          period_days: number
          plan_id: string | null
          return_amount: number
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          investment_amount: number
          period_days: number
          plan_id?: string | null
          return_amount: number
          total_amount: number
        }
        Update: {
          created_at?: string | null
          id?: string
          investment_amount?: number
          period_days?: number
          plan_id?: string | null
          return_amount?: number
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "investment_returns_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
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
      partner_commissions: {
        Row: {
          commission_amount: number
          commission_rate: number
          created_at: string | null
          deposit_amount: number
          deposit_id: string | null
          id: string
          partner_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          commission_amount: number
          commission_rate: number
          created_at?: string | null
          deposit_amount: number
          deposit_id?: string | null
          id?: string
          partner_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          commission_amount?: number
          commission_rate?: number
          created_at?: string | null
          deposit_amount?: number
          deposit_id?: string | null
          id?: string
          partner_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partner_commissions_deposit_id_fkey"
            columns: ["deposit_id"]
            isOneToOne: false
            referencedRelation: "deposits"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_withdrawals: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          partner_id: string
          status: string | null
          updated_at: string | null
          withdrawal_date: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          partner_id: string
          status?: string | null
          updated_at?: string | null
          withdrawal_date?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          partner_id?: string
          status?: string | null
          updated_at?: string | null
          withdrawal_date?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          commission_percentage: number
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          status: string | null
          total_deposits: number
          total_earnings: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          commission_percentage?: number
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          status?: string | null
          total_deposits?: number
          total_earnings?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          commission_percentage?: number
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          status?: string | null
          total_deposits?: number
          total_earnings?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      photo_uploads: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          metadata: Json | null
          storage_path: string
          updated_at: string | null
          upload_date: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          storage_path: string
          updated_at?: string | null
          upload_date?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          storage_path?: string
          updated_at?: string | null
          upload_date?: string | null
          user_id?: string
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
          avatar: string | null
          avatar_url: string | null
          balance: number | null
          bio: string | null
          city: string | null
          cpf: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          email_verified: boolean | null
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          profile_completed: boolean | null
          referral_balance: number | null
          referral_code: string | null
          referred_by: string | null
          role: string | null
          state: string | null
          status: string | null
          total_profit: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          whatsapp: string | null
        }
        Insert: {
          avatar?: string | null
          avatar_url?: string | null
          balance?: number | null
          bio?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          referral_balance?: number | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          state?: string | null
          status?: string | null
          total_profit?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          whatsapp?: string | null
        }
        Update: {
          avatar?: string | null
          avatar_url?: string | null
          balance?: number | null
          bio?: string | null
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          profile_completed?: boolean | null
          referral_balance?: number | null
          referral_code?: string | null
          referred_by?: string | null
          role?: string | null
          state?: string | null
          status?: string | null
          total_profit?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
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
        Relationships: []
      }
      social_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          likes_count: number | null
          parent_comment_id: string | null
          post_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          likes_count?: number | null
          parent_comment_id?: string | null
          post_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "social_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_follows: {
        Row: {
          created_at: string | null
          follower_id: string | null
          following_id: string | null
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          follower_id?: string | null
          following_id?: string | null
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      social_likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string | null
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "social_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "social_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string | null
          hashtags: string[] | null
          id: string
          image_url: string | null
          is_public: boolean | null
          likes_count: number | null
          location: string | null
          shares_count: number | null
          tagged_users: string[] | null
          updated_at: string | null
          user_id: string | null
          video_url: string | null
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          likes_count?: number | null
          location?: string | null
          shares_count?: number | null
          tagged_users?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string | null
          hashtags?: string[] | null
          id?: string
          image_url?: string | null
          is_public?: boolean | null
          likes_count?: number | null
          location?: string | null
          shares_count?: number | null
          tagged_users?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      social_shares: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          post_id: string | null
          share_type: string | null
          user_id: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          share_type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          share_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_shares_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
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
      trading_profits: {
        Row: {
          completed_operations: number
          created_at: string | null
          daily_rate: number
          exchanges_count: number
          execution_time_seconds: number | null
          id: string
          investment_amount: number
          metadata: Json | null
          plan_name: string
          profit_per_exchange: number | null
          status: string | null
          total_profit: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_operations: number
          created_at?: string | null
          daily_rate: number
          exchanges_count: number
          execution_time_seconds?: number | null
          id?: string
          investment_amount: number
          metadata?: Json | null
          plan_name: string
          profit_per_exchange?: number | null
          status?: string | null
          total_profit: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_operations?: number
          created_at?: string | null
          daily_rate?: number
          exchanges_count?: number
          execution_time_seconds?: number | null
          id?: string
          investment_amount?: number
          metadata?: Json | null
          plan_name?: string
          profit_per_exchange?: number | null
          status?: string | null
          total_profit?: number
          updated_at?: string | null
          user_id?: string | null
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
      user_data: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_investments: {
        Row: {
          amount: number
          created_at: string | null
          current_day_progress: number | null
          daily_rate: number
          daily_target: number | null
          days_remaining: number | null
          end_date: string
          id: string
          operations_completed: number | null
          plan_id: string | null
          start_date: string | null
          status: string | null
          today_earnings: number | null
          total_earned: number | null
          total_operations: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          current_day_progress?: number | null
          daily_rate: number
          daily_target?: number | null
          days_remaining?: number | null
          end_date: string
          id?: string
          operations_completed?: number | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          today_earnings?: number | null
          total_earned?: number | null
          total_operations: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          current_day_progress?: number | null
          daily_rate?: number
          daily_target?: number | null
          days_remaining?: number | null
          end_date?: string
          id?: string
          operations_completed?: number | null
          plan_id?: string | null
          start_date?: string | null
          status?: string | null
          today_earnings?: number | null
          total_earned?: number | null
          total_operations?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_investments_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_investments_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "investment_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cover_image_url: string | null
          created_at: string | null
          display_name: string | null
          followers_count: number | null
          following_count: number | null
          id: string
          is_private: boolean | null
          is_verified: boolean | null
          location: string | null
          posts_count: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cover_image_url?: string | null
          created_at?: string | null
          display_name?: string | null
          followers_count?: number | null
          following_count?: number | null
          id?: string
          is_private?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          posts_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
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
      add_partner_by_email: {
        Args: { commission_percentage?: number; partner_email: string }
        Returns: Json
      }
      apply_role_constraint_migration: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      calculate_daily_progress: {
        Args: { p_investment_id: string }
        Returns: number
      }
      calculate_referral_commission: {
        Args: { investment_amount: number; referred_user_id: string }
        Returns: undefined
      }
      calculate_referral_commission_10pct: {
        Args: { investment_amount: number; referred_user_id: string }
        Returns: undefined
      }
      clean_auth_users: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      complete_investment_operation: {
        Args: { p_operation_id: string }
        Returns: undefined
      }
      confirm_all_emails: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      confirm_email_manual: {
        Args: { user_email: string }
        Returns: Json
      }
      confirm_user_email: {
        Args: { user_id: string }
        Returns: Json
      }
      create_investment_operation: {
        Args: { p_investment_id: string }
        Returns: string
      }
      create_treasure_chests: {
        Args: { deposit_id_param: string; user_id_param: string }
        Returns: undefined
      }
      create_user_investment: {
        Args: { p_amount: number; p_plan_id: string; p_user_id: string }
        Returns: string
      }
      get_digitopay_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          completed_deposits: number
          completed_withdrawals: number
          pending_deposits: number
          pending_withdrawals: number
          total_deposits: number
          total_withdrawals: number
        }[]
      }
      get_investment_stats: {
        Args: { p_user_id: string }
        Returns: {
          active_investments: number
          completed_investments: number
          today_total_earnings: number
          total_earned: number
          total_invested: number
        }[]
      }
      get_table_structure: {
        Args: { table_name: string }
        Returns: {
          check_clause: string
          column_default: string
          column_name: string
          data_type: string
          is_nullable: string
        }[]
      }
      get_user_digitopay_transactions: {
        Args: { target_user_id: string }
        Returns: {
          amount: number
          amount_brl: number
          created_at: string
          id: string
          person_cpf: string
          person_name: string
          status: string
          trx_id: string
          type: string
        }[]
      }
      get_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          avatar_url: string
          created_at: string
          email: string
          email_verified: boolean
          full_name: string
          id: string
          updated_at: string
        }[]
      }
      get_user_referral_stats: {
        Args: { target_user_id: string }
        Returns: {
          active_referrals: number
          residual_balance: number
          this_month_earnings: number
          total_commissions: number
          total_referrals: number
        }[]
      }
      get_user_residual_balance: {
        Args: { target_user_id: string }
        Returns: number
      }
      get_user_trading_stats: {
        Args: { user_uuid: string }
        Returns: {
          avg_daily_rate: number
          best_profit: number
          total_execution_time: number
          total_invested: number
          total_operations: number
          total_profit: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_admin_user: {
        Args: { user_email: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      remove_partner: {
        Args: { partner_email: string }
        Returns: Json
      }
      reset_daily_earnings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      set_user_as_admin: {
        Args: { user_email: string }
        Returns: undefined
      }
      sync_arbitrage_plans: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      test_referral_signup: {
        Args: { ref_code?: string; test_email: string }
        Returns: Json
      }
      update_operations_progress: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_partner_commission: {
        Args: { new_commission_percentage: number; partner_email: string }
        Returns: Json
      }
      update_user_role: {
        Args: { new_role: string; user_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user" | "partner"
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
      app_role: ["admin", "moderator", "user", "partner"],
    },
  },
} as const
