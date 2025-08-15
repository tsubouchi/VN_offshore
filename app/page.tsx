"use client"

import { AuthForm } from "@/components/auth/auth-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "buyer") {
        router.push("/search")
      } else if (user.role === "vendor") {
        router.push("/dashboard")
      } else if (user.role === "admin") {
        router.push("/admin")
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Offshore Match</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Connect Japanese companies with top Vietnamese offshore development teams. Find the perfect match for your
            next project.
          </p>
          <Link href="/search">
            <Button size="lg" className="mb-8">
              Browse Vietnamese Companies
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Japanese Companies</h3>
              <p className="text-gray-600">
                Discover skilled Vietnamese development teams, compare portfolios, read reviews, and communicate
                directly through our platform.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">For Vietnamese Companies</h3>
              <p className="text-gray-600">
                Showcase your expertise, build your reputation, and connect with Japanese companies looking for offshore
                development partners.
              </p>
            </div>
          </div>

          <div>
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
