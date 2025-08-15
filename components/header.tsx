"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black">
              VietJapan Match
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              {user.role === "buyer" && (
                <nav className="hidden md:flex space-x-6">
                  <Link href="/search" className="text-gray-700 hover:text-black">
                    企業検索
                  </Link>
                  <Link href="/messages" className="text-gray-700 hover:text-black">
                    メッセージ
                  </Link>
                </nav>
              )}

              {user.role === "vendor" && (
                <nav className="hidden md:flex space-x-6">
                  <Link href="/dashboard" className="text-gray-700 hover:text-black">
                    ダッシュボード
                  </Link>
                  <Link href="/profile/manage" className="text-gray-700 hover:text-black">
                    プロフィール管理
                  </Link>
                  <Link href="/messages" className="text-gray-700 hover:text-black">
                    メッセージ
                  </Link>
                </nav>
              )}

              {user.role === "admin" && (
                <nav className="hidden md:flex space-x-6">
                  <Link href="/admin" className="text-gray-700 hover:text-black">
                    管理画面
                  </Link>
                </nav>
              )}

              <NotificationBell />

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{user.is_guest ? "ゲスト" : user.contact_person}</span>
                <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-700 hover:text-black">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-black">
                ログイン
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
