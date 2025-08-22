"use client"

import { ErrorBoundary } from "./error-boundary"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"

interface PageErrorBoundaryProps {
  children: React.ReactNode
}

export function PageErrorBoundary({ children }: PageErrorBoundaryProps) {
  const router = useRouter()

  const errorFallback = (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Page Error</h1>
          <p className="text-muted-foreground">
            This page encountered an error and couldn&apos;t be displayed properly.
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
          <Button onClick={() => router.push("/")}>
            <Home className="h-4 w-4 mr-2" />
            Home Page
          </Button>
        </div>
      </div>
    </div>
  )

  return <ErrorBoundary fallback={errorFallback}>{children}</ErrorBoundary>
}