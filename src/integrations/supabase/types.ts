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
      agricultural_news: {
        Row: {
          category: string
          content: string
          created_at: string | null
          id: string
          location: Json | null
          published_date: string | null
          source: string | null
          title: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          id?: string
          location?: Json | null
          published_date?: string | null
          source?: string | null
          title: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          id?: string
          location?: Json | null
          published_date?: string | null
          source?: string | null
          title?: string
        }
        Relationships: []
      }
      agricultural_resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_url: string
          id: string
          language: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          file_url: string
          id?: string
          language?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_url?: string
          id?: string
          language?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      comprehensive_plans: {
        Row: {
          actual_yield: number | null
          climate_data: Json | null
          comprehensive_summary: Json | null
          created_at: string | null
          crop_analysis: Json | null
          farm_id: string
          id: string
          included_sections: Json
          market_analysis: Json | null
          optimal_planting_window: Json | null
          plan_name: string
          predicted_yield: number | null
          preferred_planting_date: string | null
          season: string | null
          soil_analysis: Json | null
          updated_at: string | null
          user_id: string
          water_analysis: Json | null
        }
        Insert: {
          actual_yield?: number | null
          climate_data?: Json | null
          comprehensive_summary?: Json | null
          created_at?: string | null
          crop_analysis?: Json | null
          farm_id: string
          id?: string
          included_sections: Json
          market_analysis?: Json | null
          optimal_planting_window?: Json | null
          plan_name: string
          predicted_yield?: number | null
          preferred_planting_date?: string | null
          season?: string | null
          soil_analysis?: Json | null
          updated_at?: string | null
          user_id: string
          water_analysis?: Json | null
        }
        Update: {
          actual_yield?: number | null
          climate_data?: Json | null
          comprehensive_summary?: Json | null
          created_at?: string | null
          crop_analysis?: Json | null
          farm_id?: string
          id?: string
          included_sections?: Json
          market_analysis?: Json | null
          optimal_planting_window?: Json | null
          plan_name?: string
          predicted_yield?: number | null
          preferred_planting_date?: string | null
          season?: string | null
          soil_analysis?: Json | null
          updated_at?: string | null
          user_id?: string
          water_analysis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "comprehensive_plans_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_consultations: {
        Row: {
          created_at: string | null
          description: string
          expert_response: Json | null
          farm_id: string | null
          id: string
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string | null
          urgency: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          expert_response?: Json | null
          farm_id?: string | null
          id?: string
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          urgency?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          expert_response?: Json | null
          farm_id?: string | null
          id?: string
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          urgency?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expert_consultations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          created_at: string | null
          crops: Json | null
          farm_name: string
          id: string
          irrigation_method: string | null
          location: Json
          soil_type: string | null
          total_size: number
          updated_at: string | null
          user_id: string
          water_source: string | null
        }
        Insert: {
          created_at?: string | null
          crops?: Json | null
          farm_name: string
          id?: string
          irrigation_method?: string | null
          location: Json
          soil_type?: string | null
          total_size: number
          updated_at?: string | null
          user_id: string
          water_source?: string | null
        }
        Update: {
          created_at?: string | null
          crops?: Json | null
          farm_name?: string
          id?: string
          irrigation_method?: string | null
          location?: Json
          soil_type?: string | null
          total_size?: number
          updated_at?: string | null
          user_id?: string
          water_source?: string | null
        }
        Relationships: []
      }
      pest_disease_reports: {
        Row: {
          created_at: string | null
          crop_type: string
          diagnosis: Json | null
          farm_id: string | null
          id: string
          images: string[] | null
          location: Json | null
          report_date: string | null
          symptoms: string[]
          treatment_recommendations: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          crop_type: string
          diagnosis?: Json | null
          farm_id?: string | null
          id?: string
          images?: string[] | null
          location?: Json | null
          report_date?: string | null
          symptoms: string[]
          treatment_recommendations?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          crop_type?: string
          diagnosis?: Json | null
          farm_id?: string | null
          id?: string
          images?: string[] | null
          location?: Json | null
          report_date?: string | null
          symptoms?: string[]
          treatment_recommendations?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pest_disease_reports_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          farm_size: number | null
          full_name: string | null
          id: string
          location: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          farm_size?: number | null
          full_name?: string | null
          id: string
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          farm_size?: number | null
          full_name?: string | null
          id?: string
          location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      saved_plans: {
        Row: {
          analysis_result: Json | null
          created_at: string | null
          crop_type: string | null
          expected_yield: number | null
          farm_size: number | null
          harvest_date: string | null
          id: string
          irrigation_method: string | null
          location: string | null
          plan_name: string
          plan_type: string
          soil_type: string | null
          updated_at: string | null
          user_id: string
          water_source: string | null
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string | null
          crop_type?: string | null
          expected_yield?: number | null
          farm_size?: number | null
          harvest_date?: string | null
          id?: string
          irrigation_method?: string | null
          location?: string | null
          plan_name: string
          plan_type: string
          soil_type?: string | null
          updated_at?: string | null
          user_id: string
          water_source?: string | null
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string | null
          crop_type?: string | null
          expected_yield?: number | null
          farm_size?: number | null
          harvest_date?: string | null
          id?: string
          irrigation_method?: string | null
          location?: string | null
          plan_name?: string
          plan_type?: string
          soil_type?: string | null
          updated_at?: string | null
          user_id?: string
          water_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
