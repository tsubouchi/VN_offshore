"use client"

import React from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { cn } from "@/lib/utils"

export interface BreadcrumbItem {
  label: string
  href?: string
  current?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
  showHome?: boolean
}

export function Breadcrumb({ items, className, showHome = true }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex", className)}>
      <ol role="list" className="flex items-center space-x-2">
        {showHome && (
          <>
            <li>
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Link>
            </li>
            {items.length > 0 && (
              <li className="flex items-center">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </li>
            )}
          </>
        )}
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          
          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                {item.href && !item.current ? (
                  <Link
                    href={item.href}
                    className={cn(
                      "text-sm transition-colors",
                      isLast
                        ? "font-medium text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      "text-sm",
                      isLast || item.current
                        ? "font-medium text-foreground"
                        : "text-muted-foreground"
                    )}
                    aria-current={item.current || isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
              
              {!isLast && (
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </li>
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// Hook for easy breadcrumb management
export function useBreadcrumb() {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([])
  
  const setBreadcrumb = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems)
  }, [])
  
  const addBreadcrumb = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item])
  }, [])
  
  const clearBreadcrumb = React.useCallback(() => {
    setItems([])
  }, [])
  
  return {
    items,
    setBreadcrumb,
    addBreadcrumb,
    clearBreadcrumb
  }
}