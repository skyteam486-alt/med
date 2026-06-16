export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          acknowledged: boolean
          condition_id: string
          created_at: string
          id: string
          message: string
          severity: string
          template_id: string | null
          value: number | null
          vital_entry_id: string | null
        }
        Insert: {
          acknowledged?: boolean
          condition_id: string
          created_at?: string
          id?: string
          message: string
          severity?: string
          template_id?: string | null
          value?: number | null
          vital_entry_id?: string | null
        }
        Update: {
          acknowledged?: boolean
          condition_id?: string
          created_at?: string
          id?: string
          message?: string
          severity?: string
          template_id?: string | null
          value?: number | null
          vital_entry_id?: string | null
        }
        Relationships: []
      }
      chats: {
        Row: {
          condition_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          condition_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          condition_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: []
      }
      clinical_notes: {
        Row: {
          body: string
          condition_id: string
          created_at: string
          doctor_id: string | null
          id: string
        }
        Insert: {
          body: string
          condition_id: string
          created_at?: string
          doctor_id?: string | null
          id?: string
        }
        Update: {
          body?: string
          condition_id?: string
          created_at?: string
          doctor_id?: string | null
          id?: string
        }
        Relationships: []
      }
      condition_vitals: {
        Row: {
          condition_id: string
          id: string
          template_id: string
        }
        Insert: {
          condition_id: string
          id?: string
          template_id: string
        }
        Update: {
          condition_id?: string
          id?: string
          template_id?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          condition_type: string
          created_at: string
          description: string | null
          doctor_id: string | null
          id: string
          profile_id: string
          status: string
          title: string
        }
        Insert: {
          condition_type?: string
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          id?: string
          profile_id: string
          status?: string
          title: string
        }
        Update: {
          condition_type?: string
          created_at?: string
          description?: string | null
          doctor_id?: string | null
          id?: string
          profile_id?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          created_at: string
          gender: string | null
          id: string
          name: string
          role: string
          user_id: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          name: string
          role?: string
          user_id: string
        }
        Update: {
          age?: number | null
          created_at?: string
          gender?: string | null
          id?: string
          name?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      vital_entries: {
        Row: {
          condition_id: string
          created_by: string | null
          id: string
          notes: string | null
          recorded_at: string
          template_id: string
          value: number
        }
        Insert: {
          condition_id: string
          created_by?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string
          template_id: string
          value: number
        }
        Update: {
          condition_id?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          recorded_at?: string
          template_id?: string
          value?: number
        }
        Relationships: []
      }
      vital_templates: {
        Row: {
          condition_type: string
          created_at: string
          id: string
          max_value: number | null
          min_value: number | null
          name: string
          unit: string | null
        }
        Insert: {
          condition_type?: string
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          name: string
          unit?: string | null
        }
        Update: {
          condition_type?: string
          created_at?: string
          id?: string
          max_value?: number | null
          min_value?: number | null
          name?: string
          unit?: string | null
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      auth_profile_id: { Args: Record<string, never>; Returns: string }
      can_access_condition: { Args: { cid: string }; Returns: boolean }
      profile_shares_condition: { Args: { target: string }; Returns: boolean }
    }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]
