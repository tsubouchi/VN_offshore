"use client"

import { Heart } from "lucide-react"
import { Button } from "./button"
import { useFavorites } from "@/lib/favorites-context"
import { cn } from "@/lib/utils"

interface FavoriteButtonProps {
  companyId: string
  companyName?: string
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "lg"
  showText?: boolean
  className?: string
}

export function FavoriteButton({ 
  companyId, 
  companyName, 
  variant = "outline", 
  size = "sm", 
  showText = false,
  className 
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, isLoading } = useFavorites()
  
  const isCurrentlyFavorite = isFavorite(companyId)

  const handleClick = async () => {
    await toggleFavorite(companyId, companyName)
  }

  const iconSizes = {
    sm: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        isCurrentlyFavorite && variant === "outline" && "border-red-500 bg-red-50 text-red-600 hover:bg-red-100",
        isCurrentlyFavorite && variant === "default" && "bg-red-500 hover:bg-red-600",
        className
      )}
      aria-label={isCurrentlyFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          "transition-all duration-200",
          isCurrentlyFavorite ? "fill-current" : "fill-none",
          showText && "mr-2"
        )} 
      />
      {showText && (
        <span className="hidden sm:inline">
          {isCurrentlyFavorite ? "Favorited" : "Add to Favorites"}
        </span>
      )}
      {showText && (
        <span className="sm:hidden">
          {isCurrentlyFavorite ? "★" : "☆"}
        </span>
      )}
    </Button>
  )
}