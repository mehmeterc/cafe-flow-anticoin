export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      anticoin_transactions: {
        Row: {
          amount: number
          blockchain_tx_id: string | null
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          blockchain_tx_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          blockchain_tx_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
      bookings: {
        Row: {
          cafe_id: string
          created_at: string | null
          date: string
          duration: number
          id: string
          start_time: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          date: string
          duration: number
          id?: string
          start_time: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
          date?: string
          duration?: number
          id?: string
          start_time?: string
          status?: string | null
          updated_at?: string | null
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
        ]
      }
      cafes: {
        Row: {
          address: string
          created_at: string | null
          description: string | null
          hourly_cost: number
          id: string
          image_url: string | null
          location: string
          name: string
          noise_level: number | null
          open_hours: Json | null
          owner_id: string | null
          power_outlets: boolean | null
          seating_type: string | null
          tags: string[] | null
          updated_at: string | null
          wifi_strength: number | null
        }
        Insert: {
          address: string
          created_at?: string | null
          description?: string | null
          hourly_cost: number
          id?: string
          image_url?: string | null
          location: string
          name: string
          noise_level?: number | null
          open_hours?: Json | null
          owner_id?: string | null
          power_outlets?: boolean | null
          seating_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          wifi_strength?: number | null
        }
        Update: {
          address?: string
          created_at?: string | null
          description?: string | null
          hourly_cost?: number
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          noise_level?: number | null
          open_hours?: Json | null
          owner_id?: string | null
          power_outlets?: boolean | null
          seating_type?: string | null
          tags?: string[] | null
          updated_at?: string | null
          wifi_strength?: number | null
        }
        Relationships: []
      }
      checkins: {
        Row: {
          anticoin_earned: number | null
          cafe_id: string
          coins_earned: number | null
          cost: number | null
          created_at: string | null
          duration: number | null
          end_time: string | null
          id: string
          minutes_spent: number | null
          start_time: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          anticoin_earned?: number | null
          cafe_id: string
          coins_earned?: number | null
          cost?: number | null
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          minutes_spent?: number | null
          start_time?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          anticoin_earned?: number | null
          cafe_id?: string
          coins_earned?: number | null
          cost?: number | null
          created_at?: string | null
          duration?: number | null
          end_time?: string | null
          id?: string
          minutes_spent?: number | null
          start_time?: string | null
          updated_at?: string | null
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
        ]
      }
      event_attendees: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
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
        ]
      }
      events: {
        Row: {
          anticoin_cost: number | null
          cafe_id: string | null
          created_at: string | null
          date: string
          description: string | null
          duration: number
          id: string
          image_url: string | null
          organizer: string | null
          price: number | null
          seat_limit: number | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          anticoin_cost?: number | null
          cafe_id?: string | null
          created_at?: string | null
          date: string
          description?: string | null
          duration: number
          id?: string
          image_url?: string | null
          organizer?: string | null
          price?: number | null
          seat_limit?: number | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          anticoin_cost?: number | null
          cafe_id?: string | null
          created_at?: string | null
          date?: string
          description?: string | null
          duration?: number
          id?: string
          image_url?: string | null
          organizer?: string | null
          price?: number | null
          seat_limit?: number | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_cafe_id_fkey"
            columns: ["cafe_id"]
            isOneToOne: false
            referencedRelation: "cafes"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          cafe_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          cafe_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          cafe_id?: string
          created_at?: string | null
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
        ]
      }
      sponsors: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
