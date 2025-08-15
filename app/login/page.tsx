"use client"

import { IntegratedAuthForm } from "@/components/auth/integrated-auth-form"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/vietnam-japan-digital-cityscape.png')",
          }}
        />
        <div className="absolute inset-0 hero-gradient hero-pattern" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ホームに戻る
            </Link>
          </div>

          {/* Login Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-xl p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">VietJapan Match</h1>
              <p className="text-gray-600">アカウントにログインまたは新規登録</p>
            </div>

            <IntegratedAuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
