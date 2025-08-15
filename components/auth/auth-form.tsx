"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { UserRole } from "@/lib/supabase"
import { User } from "lucide-react"

interface AuthFormProps {
  onSuccess?: () => void
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { guestLogin, signIn, signUp } = useAuth()
  const router = useRouter()

  const handleGuestLogin = async (role: UserRole) => {
    setIsLoading(true)
    setError(null)

    try {
      guestLogin(role)

      if (role === "buyer") {
        router.push("/search")
      } else {
        router.push("/dashboard")
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      const role = formData.get("role") as UserRole
      const companyName = formData.get("companyName") as string
      const contactPerson = formData.get("contactPerson") as string
      const country = formData.get("country") as string

      await signUp(email, password, role, companyName, contactPerson, country)

      if (role === "buyer") {
        router.push("/search")
      } else {
        router.push("/dashboard")
      }

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignIn = async (formData: FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      await signIn(email, password)

      router.push("/search")

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            ゲストログイン
          </CardTitle>
          <CardDescription>アカウント作成なしで今すぐ体験できます</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button onClick={() => handleGuestLogin("buyer")} className="w-full" variant="outline" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "日本企業としてゲストログイン"}
          </Button>
          <Button onClick={() => handleGuestLogin("vendor")} className="w-full" variant="outline" disabled={isLoading}>
            {isLoading ? "ログイン中..." : "ベトナム企業としてゲストログイン"}
          </Button>
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
        </CardContent>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">または</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>正式アカウント</CardTitle>
          <CardDescription>本格的にサービスを利用する場合はアカウントを作成してください</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">ログイン</TabsTrigger>
              <TabsTrigger value="signup">新規登録</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form action={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">メールアドレス</Label>
                  <Input id="signin-email" name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">パスワード</Label>
                  <Input id="signin-password" name="password" type="password" required />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "ログイン中..." : "ログイン"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form action={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role">アカウント種別</Label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="アカウント種別を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer">日本企業（発注者）</SelectItem>
                      <SelectItem value="vendor">ベトナム企業（受注者）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">パスワード</Label>
                  <Input id="password" name="password" type="password" minLength={6} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyName">会社名</Label>
                  <Input id="companyName" name="companyName" placeholder="株式会社サンプル" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">担当者名</Label>
                  <Input id="contactPerson" name="contactPerson" placeholder="山田太郎" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">国</Label>
                  <Select name="country" required>
                    <SelectTrigger>
                      <SelectValue placeholder="国を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Japan">日本</SelectItem>
                      <SelectItem value="Vietnam">ベトナム</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">電話番号（任意）</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+81-90-1234-5678" />
                </div>
                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "アカウント作成中..." : "アカウント作成"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
