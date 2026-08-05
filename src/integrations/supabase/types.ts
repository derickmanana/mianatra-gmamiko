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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          student_name: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          student_name: string
          title?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          student_name?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          name: string
          position: number
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          name: string
          position?: number
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          name?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "blocks_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folder_students: {
        Row: {
          created_at: string
          folder_id: string
          id: string
          student_name: string
        }
        Insert: {
          created_at?: string
          folder_id: string
          id?: string
          student_name: string
        }
        Update: {
          created_at?: string
          folder_id?: string
          id?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "folder_students_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          access_code: string | null
          created_at: string
          id: string
          max_users: number | null
          name: string
          position: number
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          id?: string
          max_users?: number | null
          name: string
          position?: number
        }
        Update: {
          access_code?: string | null
          created_at?: string
          id?: string
          max_users?: number | null
          name?: string
          position?: number
        }
        Relationships: []
      }
      forwarders: {
        Row: {
          address: string | null
          air_rate_ar_kg: number | null
          avg_delay: string | null
          city: string | null
          created_at: string
          delivery_express: string | null
          delivery_standard: string | null
          departure_country: string
          facebook: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          rates_updated_at: string
          sea_rate_usd_m3: number | null
          updated_at: string
          website: string | null
          wechat: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          air_rate_ar_kg?: number | null
          avg_delay?: string | null
          city?: string | null
          created_at?: string
          delivery_express?: string | null
          delivery_standard?: string | null
          departure_country?: string
          facebook?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          rates_updated_at?: string
          sea_rate_usd_m3?: number | null
          updated_at?: string
          website?: string | null
          wechat?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          air_rate_ar_kg?: number | null
          avg_delay?: string | null
          city?: string | null
          created_at?: string
          delivery_express?: string | null
          delivery_standard?: string | null
          departure_country?: string
          facebook?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          rates_updated_at?: string
          sea_rate_usd_m3?: number | null
          updated_at?: string
          website?: string | null
          wechat?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      items: {
        Row: {
          block_id: string
          content: string | null
          created_at: string
          id: string
          position: number
          title: string | null
          type: string
          url: string | null
        }
        Insert: {
          block_id: string
          content?: string | null
          created_at?: string
          id?: string
          position?: number
          title?: string | null
          type: string
          url?: string | null
        }
        Update: {
          block_id?: string
          content?: string | null
          created_at?: string
          id?: string
          position?: number
          title?: string | null
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "items_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_entries: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          position: number
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      kb_products: {
        Row: {
          category: string | null
          created_at: string
          dimensions: string | null
          has_battery: boolean
          id: string
          is_fragile: boolean
          is_liquid: boolean
          material: string | null
          name: string
          transport_advice: string | null
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          dimensions?: string | null
          has_battery?: boolean
          id?: string
          is_fragile?: boolean
          is_liquid?: boolean
          material?: string | null
          name: string
          transport_advice?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          dimensions?: string | null
          has_battery?: boolean
          id?: string
          is_fragile?: boolean
          is_liquid?: boolean
          material?: string | null
          name?: string
          transport_advice?: string | null
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      kb_suppliers: {
        Row: {
          created_at: string
          id: string
          name: string
          notes: string | null
          platform: string | null
          shop_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          platform?: string | null
          shop_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          platform?: string | null
          shop_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          author_name: string
          body: string
          created_at: string
          id: string
          is_admin: boolean
        }
        Insert: {
          author_name: string
          body: string
          created_at?: string
          id?: string
          is_admin?: boolean
        }
        Update: {
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          is_admin?: boolean
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
