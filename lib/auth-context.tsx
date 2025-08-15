"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export type UserRole = "buyer" | "vendor" | "admin"

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
  is_guest?: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (
    email: string,
    password: string,
    role: UserRole,
    companyName: string,
    contactPerson: string,
    country: string,
  ) => Promise<void>
  signOut: () => void
  guestLogin: (role: UserRole) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const savedUser = localStorage.getItem("auth_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Mock sign in - in real app this would call Supabase
    const mockUser: User = {
      id: "user_" + Date.now(),
      email,
      role: "buyer",
      company_name: "Sample Company",
      contact_person: "John Doe",
      country: "Japan",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      email_verified: true,
    }
    setUser(mockUser)
    localStorage.setItem("auth_user", JSON.stringify(mockUser))
  }

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    companyName: string,
    contactPerson: string,
    country: string,
  ) => {
    // Mock sign up - in real app this would call Supabase
    const mockUser: User = {
      id: "user_" + Date.now(),
      email,
      role,
      company_name: companyName,
      contact_person: contactPerson,
      country,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      email_verified: true,
    }
    setUser(mockUser)
    localStorage.setItem("auth_user", JSON.stringify(mockUser))
  }

  const guestLogin = (role: UserRole) => {
    const guestUser: User = {
      id: "guest_" + Date.now(),
      email: "guest@example.com",
      role,
      company_name: role === "buyer" ? "ゲスト日本企業" : "ゲストベトナム企業",
      contact_person: "ゲストユーザー",
      country: role === "buyer" ? "Japan" : "Vietnam",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
      email_verified: true,
      is_guest: true,
    }
    setUser(guestUser)
    localStorage.setItem("auth_user", JSON.stringify(guestUser))
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        guestLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
