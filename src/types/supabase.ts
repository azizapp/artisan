export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      artisans: {
        Row: {
          id: string
          full_name: string
          national_id: string
          shop_number: string
          area: string
          employee_count: number
          trade_id: string
          documents: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name: string
          national_id: string
          shop_number: string
          area: string
          employee_count?: number
          trade_id: string
          documents?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          national_id?: string
          shop_number?: string
          area?: string
          employee_count?: number
          trade_id?: string
          documents?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artisans_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["id"]
          }
        ]
      }
      contributions: {
        Row: {
          id: string
          artisan_id: string
          occasion: string
          amount: number
          payment_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          artisan_id: string
          occasion: string
          amount: number
          payment_date: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          artisan_id?: string
          occasion?: string
          amount?: number
          payment_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_artisan_id_fkey"
            columns: ["artisan_id"]
            isOneToOne: false
            referencedRelation: "artisans"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          subject: string
          amount: number
          expense_date: string
          notes: string | null
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          subject: string
          amount: number
          expense_date: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          subject?: string
          amount?: number
          expense_date?: string
          notes?: string | null
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          id: string
          theme: string
          language: string
          font_family: string
          font_size: string
          user_id: string
        }
        Insert: {
          id?: string
          theme?: string
          language?: string
          font_family?: string
          font_size?: string
          user_id: string
        }
        Update: {
          id?: string
          theme?: string
          language?: string
          font_family?: string
          font_size?: string
          user_id?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          id: string
          name_ar: string
          name_fr: string
          created_at: string
        }
        Insert: {
          id?: string
          name_ar: string
          name_fr: string
          created_at?: string
        }
        Update: {
          id?: string
          name_ar?: string
          name_fr?: string
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          role?: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role?: string
          is_active?: boolean
          created_at?: string
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
