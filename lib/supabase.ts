import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

// Helper function to check if Supabase is available
export const isSupabaseAvailable = () => Boolean(supabase)

// Types for our database
export type UserRole = "buyer" | "vendor" | "admin"
export type CompanyStatus = "pending" | "approved" | "rejected" | "suspended"

export interface User {
  id: string
  email: string
  role: UserRole
  company_name: string
  contact_person: string
  phone?: string
  country: string
  created_at: string
  updated_at: string
  is_active: boolean
  email_verified: boolean
}

export interface Company {
  id: string
  user_id: string
  company_name: string
  description?: string
  website?: string
  established_year?: number
  employee_count?: number
  location?: string
  address?: string
  status: CompanyStatus
  logo_url?: string
  cover_image_url?: string
  hourly_rate_min?: number
  hourly_rate_max?: number
  currency: string
  average_rating: number
  total_reviews: number
  created_at: string
  updated_at: string
}
