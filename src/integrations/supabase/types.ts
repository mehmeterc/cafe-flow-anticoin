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
      anticoin_transactions: {
        Row: {
          amount: number
          blockchain_tx_id: string | null
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Insert: {
          amount: number
          blockchain_tx_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: Database["public"]["Enums"]["transaction_type"]
          user_id: string
        }
        Update: {
          amount?: number
          blockchain_tx_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "anticoin_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          cafe_id: string
          created_at: string
          date: string | null
          duration: number
          end_time: string
          id: string
          start_time: string
          status: Database["public"]["Enums"]["booking_status"]
          total_cost: number
          updated_at: string
          user_id: string
        }
        Insert: {
          booking_date: string
          cafe_id: string
          created_at?: string
          date?: string | null
          duration: number
          end_time: string
          id?: string
          start_time: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cost: number
          updated_at?: string
          user_id: string
        }
        Update: {
          booking_date?: string
          cafe_id?: string
          created_at?: string
          date?: string | null
          duration?: number
          end_time?: string
          id?: string
          start_time?: string
          status?: Database["public"]["Enums"]["booking_status"]
          total_cost?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cafes: {
        Row: {
          address: string | null
          amenities: string[] | null
          coin_rate: number
          created_at: string
          description: string | null
          hourly_cost: number | null
          hourly_rate: number
          id: string
          image_url: string | null
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          noise_level: number | null
          open_hours: Json | null
          opening_hours: Json | null
          owner_id: string | null
          power_outlets: boolean | null
          rating: number | null
          seating_capacity: number | null
          seating_type: string | null
          tags: string[] | null
          updated_at: string
          wifi_strength: number | null
        }
        Insert: {
          address?: string | null
          amenities?: string[] | null
          coin_rate?: number
          created_at?: string
          description?: string | null
          hourly_cost?: number | null
          hourly_rate: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          noise_level?: number | null
          open_hours?: Json | null
          opening_hours?: Json | null
          owner_id?: string | null
          power_outlets?: boolean | null
          rating?: number | null
          seating_capacity?: number | null
          seating_type?: string | null
          tags?: string[] | null
          updated_at?: string
          wifi_strength?: number | null
        }
        Update: {
          address?: string | null
          amenities?: string[] | null
          coin_rate?: number
          created_at?: string
          description?: string | null
          hourly_cost?: number | null
          hourly_rate?: number
          id?: string
          image_url?: string | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          noise_level?: number | null
          open_hours?: Json | null
          opening_hours?: Json | null
          owner_id?: string | null
          power_outlets?: boolean | null
          rating?: number | null
          seating_capacity?: number | null
          seating_type?: string | null
          tags?: string[] | null
          updated_at?: string
          wifi_strength?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cafes_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          cafe_id: string
          coins_earned: number | null
          cost: number | null
          created_at: string
          duration: number | null
          end_time: string | null
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          cafe_id: string
          coins_earned?: number | null
          cost?: number | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          user_id: string
        }
        Update: {
          cafe_id?: string
          coins_earned?: number | null
          cost?: number | null
          created_at?: string
          duration?: number | null
          end_time?: string | null
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkins_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          attended: boolean | null
          created_at: string
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          created_at?: string
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          created_at?: string
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          anticoin_cost: number | null
          cafe_id: string | null
          coin_reward: number | null
          created_at: string
          date: string | null
          description: string | null
          duration: number | null
          end_time: string
          event_date: string
          id: string
          image_url: string | null
          is_featured: boolean | null
          location: string | null
          max_attendees: number | null
          organizer: string | null
          organizer_id: string | null
          organizer_wallet: string | null
          price: number | null
          seat_limit: number | null
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          anticoin_cost?: number | null
          cafe_id?: string | null
          coin_reward?: number | null
          created_at?: string
          date?: string | null
          description?: string | null
          duration?: number | null
          end_time: string
          event_date: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer?: string | null
          organizer_id?: string | null
          organizer_wallet?: string | null
          price?: number | null
          seat_limit?: number | null
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          anticoin_cost?: number | null
          cafe_id?: string | null
          coin_reward?: number | null
          created_at?: string
          date?: string | null
          description?: string | null
          duration?: number | null
          end_time?: string
          event_date?: string
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          location?: string | null
          max_attendees?: number | null
          organizer?: string | null
          organizer_id?: string | null
          organizer_wallet?: string | null
          price?: number | null
          seat_limit?: number | null
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          cafe_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          cafe_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          cafe_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sponsors: {
        Row: {
          created_at: string
          description: string | null
          id: string
          logo_url: string
          name: string
          tier: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url: string
          name: string
          tier?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string
          name?: string
          tier?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          anticoin_balance: number
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          skills: string[] | null
          updated_at: string
          wallet_address: string | null
          work_style: string | null
        }
        Insert: {
          anticoin_balance?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          skills?: string[] | null
          updated_at?: string
          wallet_address?: string | null
          work_style?: string | null
        }
        Update: {
          anticoin_balance?: number
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          skills?: string[] | null
          updated_at?: string
          wallet_address?: string | null
          work_style?: string | null
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
      booking_status: "pending" | "confirmed" | "cancelled" | "completed"
      transaction_type: "earn" | "spend" | "transfer"
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
      booking_status: ["pending", "confirmed", "cancelled", "completed"],
      transaction_type: ["earn", "spend", "transfer"],
    },
  },
} as const
