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
      agricultural_experts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          location: string
          name: string
          phone: string
          specialization: string
          updated_at: string | null
          whatsapp_link: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          location: string
          name: string
          phone: string
          specialization: string
          updated_at?: string | null
          whatsapp_link?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          location?: string
          name?: string
          phone?: string
          specialization?: string
          updated_at?: string | null
          whatsapp_link?: string | null
        }
        Relationships: []
      }
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
      agricultural_news_feed: {
        Row: {
          category: string
          created_at: string | null
          id: string
          location: string | null
          published_date: string | null
          source_name: string
          source_url: string
          summary: string
          title: string
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          location?: string | null
          published_date?: string | null
          source_name: string
          source_url: string
          summary: string
          title: string
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          location?: string | null
          published_date?: string | null
          source_name?: string
          source_url?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      agricultural_nfts: {
        Row: {
          created_at: string | null
          description: string | null
          expiry_date: string | null
          farm_id: string | null
          hedera_serial_number: number | null
          hedera_token_id: string | null
          id: string
          image_url: string | null
          issued_date: string | null
          issuer: string | null
          metadata: Json | null
          nft_type: string
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          farm_id?: string | null
          hedera_serial_number?: number | null
          hedera_token_id?: string | null
          id?: string
          image_url?: string | null
          issued_date?: string | null
          issuer?: string | null
          metadata?: Json | null
          nft_type: string
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          expiry_date?: string | null
          farm_id?: string | null
          hedera_serial_number?: number | null
          hedera_token_id?: string | null
          id?: string
          image_url?: string | null
          issued_date?: string | null
          issuer?: string | null
          metadata?: Json | null
          nft_type?: string
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agricultural_nfts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      agricultural_resources: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          language: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          language?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          language?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
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
          expert_id: string | null
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
          expert_id?: string | null
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
          expert_id?: string | null
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
            foreignKeyName: "expert_consultations_expert_id_fkey"
            columns: ["expert_id"]
            isOneToOne: false
            referencedRelation: "agricultural_experts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expert_consultations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_data_registry: {
        Row: {
          created_at: string | null
          data_hash: string
          data_summary: Json | null
          farm_id: string | null
          hedera_file_id: string | null
          hedera_transaction_id: string | null
          id: string
          record_type: string
          updated_at: string | null
          user_id: string
          verification_status: string | null
          visibility: string | null
        }
        Insert: {
          created_at?: string | null
          data_hash: string
          data_summary?: Json | null
          farm_id?: string | null
          hedera_file_id?: string | null
          hedera_transaction_id?: string | null
          id?: string
          record_type: string
          updated_at?: string | null
          user_id: string
          verification_status?: string | null
          visibility?: string | null
        }
        Update: {
          created_at?: string | null
          data_hash?: string
          data_summary?: Json | null
          farm_id?: string | null
          hedera_file_id?: string | null
          hedera_transaction_id?: string | null
          id?: string
          record_type?: string
          updated_at?: string | null
          user_id?: string
          verification_status?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "farm_data_registry_farm_id_fkey"
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
      payment_contracts: {
        Row: {
          amount: number
          contract_type: string
          created_at: string | null
          currency: string | null
          execution_date: string | null
          farm_id: string | null
          hedera_contract_id: string | null
          id: string
          parties: Json
          status: string | null
          terms: Json
          trigger_conditions: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contract_type: string
          created_at?: string | null
          currency?: string | null
          execution_date?: string | null
          farm_id?: string | null
          hedera_contract_id?: string | null
          id?: string
          parties: Json
          status?: string | null
          terms: Json
          trigger_conditions?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contract_type?: string
          created_at?: string | null
          currency?: string | null
          execution_date?: string | null
          farm_id?: string | null
          hedera_contract_id?: string | null
          id?: string
          parties?: Json
          status?: string | null
          terms?: Json
          trigger_conditions?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_contracts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string | null
          id: string
          location: Json | null
          plan_data: Json
          plan_name: string
          plan_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          location?: Json | null
          plan_data: Json
          plan_name: string
          plan_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          location?: Json | null
          plan_data?: Json
          plan_name?: string
          plan_type?: string
          updated_at?: string | null
          user_id?: string
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
      supply_chain_records: {
        Row: {
          batch_id: string
          created_at: string | null
          crop_type: string
          current_stage: string
          farm_id: string | null
          hedera_topic_id: string | null
          hedera_transaction_id: string | null
          id: string
          location: Json | null
          metadata: Json | null
          previous_record_id: string | null
          timestamp: string | null
          user_id: string
        }
        Insert: {
          batch_id: string
          created_at?: string | null
          crop_type: string
          current_stage: string
          farm_id?: string | null
          hedera_topic_id?: string | null
          hedera_transaction_id?: string | null
          id?: string
          location?: Json | null
          metadata?: Json | null
          previous_record_id?: string | null
          timestamp?: string | null
          user_id: string
        }
        Update: {
          batch_id?: string
          created_at?: string | null
          crop_type?: string
          current_stage?: string
          farm_id?: string | null
          hedera_topic_id?: string | null
          hedera_transaction_id?: string | null
          id?: string
          location?: Json | null
          metadata?: Json | null
          previous_record_id?: string | null
          timestamp?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supply_chain_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supply_chain_records_previous_record_id_fkey"
            columns: ["previous_record_id"]
            isOneToOne: false
            referencedRelation: "supply_chain_records"
            referencedColumns: ["id"]
          },
        ]
      }
      tokenized_farm_assets: {
        Row: {
          asset_name: string
          asset_type: string
          available_supply: number
          created_at: string | null
          description: string | null
          farm_id: string | null
          id: string
          metadata: Json | null
          status: string | null
          token_id: string | null
          total_supply: number
          total_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          asset_name: string
          asset_type: string
          available_supply: number
          created_at?: string | null
          description?: string | null
          farm_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          token_id?: string | null
          total_supply: number
          total_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          asset_name?: string
          asset_type?: string
          available_supply?: number
          created_at?: string | null
          description?: string | null
          farm_id?: string | null
          id?: string
          metadata?: Json | null
          status?: string | null
          token_id?: string | null
          total_supply?: number
          total_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tokenized_farm_assets_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
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
      user_wallets: {
        Row: {
          connected_at: string | null
          created_at: string | null
          hedera_account_id: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          public_key: string | null
          user_id: string
          wallet_type: string | null
        }
        Insert: {
          connected_at?: string | null
          created_at?: string | null
          hedera_account_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          public_key?: string | null
          user_id: string
          wallet_type?: string | null
        }
        Update: {
          connected_at?: string | null
          created_at?: string | null
          hedera_account_id?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          public_key?: string | null
          user_id?: string
          wallet_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_expert_contact_info: {
        Args: { _expert_id: string }
        Returns: {
          created_at: string
          email: string
          id: string
          location: string
          name: string
          phone: string
          specialization: string
          whatsapp_link: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_has_consultation_with_expert: {
        Args: { _expert_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
