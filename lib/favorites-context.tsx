"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useAuth } from "./auth-context"
import { supabase, isSupabaseAvailable } from "./supabase"
import { useToast } from "@/components/ui/toast-container"

interface FavoritesContextType {
  favorites: string[]
  isLoading: boolean
  addToFavorites: (companyId: string, companyName?: string) => Promise<void>
  removeFromFavorites: (companyId: string, companyName?: string) => Promise<void>
  isFavorite: (companyId: string) => boolean
  toggleFavorite: (companyId: string, companyName?: string) => Promise<void>
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadFavorites = useCallback(async () => {
    if (!user || user.is_guest || !isSupabaseAvailable()) return

    setIsLoading(true)
    try {
      const { data, error } = await supabase!
        .from('user_favorites')
        .select('company_id')
        .eq('user_id', user.id)

      if (error) throw error

      const favoriteIds = data?.map(fav => fav.company_id) || []
      setFavorites(favoriteIds)
    } catch (error) {
      console.error("Error loading favorites:", error)
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to load favorites"
      })
    } finally {
      setIsLoading(false)
    }
  }, [user, addToast])

  // Load user's favorites on mount
  useEffect(() => {
    if (user && !user.is_guest) {
      loadFavorites()
    } else {
      // Load from localStorage for guest users
      const guestFavorites = localStorage.getItem(`guest_favorites`)
      if (guestFavorites) {
        try {
          setFavorites(JSON.parse(guestFavorites))
        } catch (error) {
          console.error("Error loading guest favorites:", error)
        }
      }
    }
  }, [user, loadFavorites])

  const addToFavorites = useCallback(async (companyId: string, companyName?: string) => {
    if (!user) {
      addToast({
        type: "warning",
        title: "Login Required",
        description: "Please log in to add companies to favorites"
      })
      return
    }

    // Optimistic update
    setFavorites(prev => [...prev, companyId])

    try {
      if (user.is_guest) {
        // Save to localStorage for guest users
        const updatedFavorites = [...favorites, companyId]
        localStorage.setItem(`guest_favorites`, JSON.stringify(updatedFavorites))
        
        addToast({
          type: "info",
          title: "Added to Favorites (Guest Mode)",
          description: `${companyName || "Company"} added to favorites. Sign up to sync across devices.`
        })
        return
      }

      if (!isSupabaseAvailable()) throw new Error("Database not available")

      const { error } = await supabase!
        .from('user_favorites')
        .insert({
          user_id: user.id,
          company_id: companyId
        })

      if (error) throw error

      addToast({
        type: "success",
        title: "Added to Favorites",
        description: `${companyName || "Company"} has been added to your favorites`
      })
    } catch (error) {
      // Revert optimistic update
      setFavorites(prev => prev.filter(id => id !== companyId))
      
      console.error("Error adding to favorites:", error)
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to add company to favorites"
      })
    }
  }, [user, favorites, addToast])

  const removeFromFavorites = useCallback(async (companyId: string, companyName?: string) => {
    if (!user) return

    // Optimistic update
    setFavorites(prev => prev.filter(id => id !== companyId))

    try {
      if (user.is_guest) {
        // Remove from localStorage for guest users
        const updatedFavorites = favorites.filter(id => id !== companyId)
        localStorage.setItem(`guest_favorites`, JSON.stringify(updatedFavorites))
        
        addToast({
          type: "info",
          title: "Removed from Favorites",
          description: `${companyName || "Company"} removed from favorites`
        })
        return
      }

      if (!isSupabaseAvailable()) throw new Error("Database not available")

      const { error } = await supabase!
        .from('user_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('company_id', companyId)

      if (error) throw error

      addToast({
        type: "success",
        title: "Removed from Favorites",
        description: `${companyName || "Company"} has been removed from your favorites`
      })
    } catch (error) {
      // Revert optimistic update
      setFavorites(prev => [...prev, companyId])
      
      console.error("Error removing from favorites:", error)
      addToast({
        type: "error",
        title: "Error",
        description: "Failed to remove company from favorites"
      })
    }
  }, [user, favorites, addToast])

  const isFavorite = useCallback((companyId: string) => {
    return favorites.includes(companyId)
  }, [favorites])

  const toggleFavorite = useCallback(async (companyId: string, companyName?: string) => {
    if (isFavorite(companyId)) {
      await removeFromFavorites(companyId, companyName)
    } else {
      await addToFavorites(companyId, companyName)
    }
  }, [isFavorite, addToFavorites, removeFromFavorites])

  const value = {
    favorites,
    isLoading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}