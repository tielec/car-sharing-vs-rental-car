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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      comparison_logs: {
        Row: {
          browser: string | null
          cheaper_service: string | null
          created_at: string
          device_type: string | null
          distance: number | null
          donation_amount: number | null
          donation_clicked: boolean
          donation_confirmed: boolean
          has_car_share_insurance: boolean | null
          has_interacted: boolean
          has_refuel: boolean | null
          has_url_params: boolean
          has_wash: boolean | null
          id: string
          insurance_type: string | null
          is_member: boolean | null
          landing_path: string | null
          language: string | null
          referrer: string | null
          referrer_domain: string | null
          screen_width: number | null
          session_id: string
          timezone: string | null
          toll_fee: number | null
          total_hours: number | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
          vehicle_type: string | null
        }
        Insert: {
          browser?: string | null
          cheaper_service?: string | null
          created_at?: string
          device_type?: string | null
          distance?: number | null
          donation_amount?: number | null
          donation_clicked?: boolean
          donation_confirmed?: boolean
          has_car_share_insurance?: boolean | null
          has_interacted?: boolean
          has_refuel?: boolean | null
          has_url_params?: boolean
          has_wash?: boolean | null
          id?: string
          insurance_type?: string | null
          is_member?: boolean | null
          landing_path?: string | null
          language?: string | null
          referrer?: string | null
          referrer_domain?: string | null
          screen_width?: number | null
          session_id: string
          timezone?: string | null
          toll_fee?: number | null
          total_hours?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_type?: string | null
        }
        Update: {
          browser?: string | null
          cheaper_service?: string | null
          created_at?: string
          device_type?: string | null
          distance?: number | null
          donation_amount?: number | null
          donation_clicked?: boolean
          donation_confirmed?: boolean
          has_car_share_insurance?: boolean | null
          has_interacted?: boolean
          has_refuel?: boolean | null
          has_url_params?: boolean
          has_wash?: boolean | null
          id?: string
          insurance_type?: string | null
          is_member?: boolean | null
          landing_path?: string | null
          language?: string | null
          referrer?: string | null
          referrer_domain?: string | null
          screen_width?: number | null
          session_id?: string
          timezone?: string | null
          toll_fee?: number | null
          total_hours?: number | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
      gasoline_price_overrides: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          note: string | null
          price: number
          set_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string | null
          price: number
          set_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          note?: string | null
          price?: number
          set_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      upsert_comparison_log:
        | {
            Args: {
              p_cheaper_service?: string
              p_distance?: number
              p_donation_amount?: number
              p_donation_clicked?: boolean
              p_has_car_share_insurance?: boolean
              p_has_interacted?: boolean
              p_has_refuel?: boolean
              p_has_wash?: boolean
              p_insurance_type?: string
              p_is_member?: boolean
              p_session_id: string
              p_toll_fee?: number
              p_total_hours?: number
              p_vehicle_type?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_browser?: string
              p_cheaper_service?: string
              p_device_type?: string
              p_distance?: number
              p_donation_amount?: number
              p_donation_clicked?: boolean
              p_has_car_share_insurance?: boolean
              p_has_interacted?: boolean
              p_has_refuel?: boolean
              p_has_wash?: boolean
              p_insurance_type?: string
              p_is_member?: boolean
              p_landing_path?: string
              p_language?: string
              p_referrer?: string
              p_referrer_domain?: string
              p_screen_width?: number
              p_session_id: string
              p_timezone?: string
              p_toll_fee?: number
              p_total_hours?: number
              p_utm_campaign?: string
              p_utm_medium?: string
              p_utm_source?: string
              p_vehicle_type?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_browser?: string
              p_cheaper_service?: string
              p_device_type?: string
              p_distance?: number
              p_donation_amount?: number
              p_donation_clicked?: boolean
              p_has_car_share_insurance?: boolean
              p_has_interacted?: boolean
              p_has_refuel?: boolean
              p_has_url_params?: boolean
              p_has_wash?: boolean
              p_insurance_type?: string
              p_is_member?: boolean
              p_landing_path?: string
              p_language?: string
              p_referrer?: string
              p_referrer_domain?: string
              p_screen_width?: number
              p_session_id: string
              p_timezone?: string
              p_toll_fee?: number
              p_total_hours?: number
              p_utm_campaign?: string
              p_utm_medium?: string
              p_utm_source?: string
              p_vehicle_type?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_browser?: string
              p_cheaper_service?: string
              p_device_type?: string
              p_distance?: number
              p_donation_amount?: number
              p_donation_clicked?: boolean
              p_donation_confirmed?: boolean
              p_has_car_share_insurance?: boolean
              p_has_interacted?: boolean
              p_has_refuel?: boolean
              p_has_url_params?: boolean
              p_has_wash?: boolean
              p_insurance_type?: string
              p_is_member?: boolean
              p_landing_path?: string
              p_language?: string
              p_referrer?: string
              p_referrer_domain?: string
              p_screen_width?: number
              p_session_id: string
              p_timezone?: string
              p_toll_fee?: number
              p_total_hours?: number
              p_utm_campaign?: string
              p_utm_medium?: string
              p_utm_source?: string
              p_vehicle_type?: string
            }
            Returns: undefined
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
