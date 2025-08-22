"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

interface ToastProps {
  id: string
  title?: string
  description?: string
  type?: "success" | "error" | "info" | "warning"
  duration?: number
  onClose: (id: string) => void
}

const typeStyles = {
  success: {
    bg: "bg-green-50 border-green-200",
    text: "text-green-800",
    icon: CheckCircle,
    iconColor: "text-green-500"
  },
  error: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-800",
    icon: AlertCircle,
    iconColor: "text-red-500"
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    text: "text-yellow-800",
    icon: AlertTriangle,
    iconColor: "text-yellow-500"
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-800",
    icon: Info,
    iconColor: "text-blue-500"
  }
}

export function Toast({ id, title, description, type = "info", duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isLeaving, setIsLeaving] = React.useState(false)

  const handleClose = React.useCallback(() => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }, [id, onClose])

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  React.useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, handleClose])

  const style = typeStyles[type]
  const IconComponent = style.icon

  return (
    <div
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all duration-300 ease-in-out",
        style.bg,
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0"
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={cn("h-5 w-5", style.iconColor)} aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1">
          {title && (
            <p className={cn("text-sm font-medium", style.text)}>
              {title}
            </p>
          )}
          {description && (
            <p className={cn("mt-1 text-sm", style.text)}>
              {description}
            </p>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <button
            type="button"
            className={cn(
              "inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors",
              style.text,
              "hover:opacity-75 focus:ring-offset-2"
            )}
            onClick={handleClose}
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}