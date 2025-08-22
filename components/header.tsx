"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Button } from "@/components/ui/button"
import { LogOut, Menu } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const { user, signOut } = useAuth()

  const buyerLinks = [
    { href: "/search", label: "企業検索" },
    { href: "/messages", label: "メッセージ" },
    { href: "/contact", label: "お問い合わせ" },
  ]

  const vendorLinks = [
    { href: "/dashboard", label: "ダッシュボード" },
    { href: "/profile/manage", label: "プロフィール管理" },
    { href: "/messages", label: "メッセージ" },
    { href: "/contact", label: "お問い合わせ" },
  ]

  const adminLinks = [
    { href: "/admin", label: "管理画面" },
    { href: "/contact", label: "お問い合わせ" },
  ]

  const guestLinks = [
    { href: "/contact", label: "お問い合わせ" },
    { href: "/login", label: "ログイン" },
  ]

  const getNavigationLinks = () => {
    if (!user) return guestLinks
    switch (user.role) {
      case "buyer": return buyerLinks
      case "vendor": return vendorLinks
      case "admin": return adminLinks
      default: return guestLinks
    }
  }

  const navigationLinks = getNavigationLinks()

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-black hover:text-primary transition-all duration-200 hover:scale-105">
              VietJapan Match
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <nav className="flex space-x-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-primary transition-all duration-200 hover:scale-105 px-2 py-1 rounded-md hover:bg-primary/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {!user && (
              <nav className="flex space-x-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-primary transition-all duration-200 hover:scale-105 px-2 py-1 rounded-md hover:bg-primary/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            {user && (
              <>
                <NotificationBell />
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    {user.is_guest ? "ゲスト" : user.contact_person}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={signOut} 
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
                  >
                    <LogOut className="h-4 w-4 hover:scale-110 transition-transform duration-200" />
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationBell />}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-700 hover:text-primary hover:bg-primary/10 transition-all duration-200 hover:scale-105">
                  <Menu className="h-5 w-5 hover:scale-110 transition-transform duration-200" />
                  <span className="sr-only">メニューを開く</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {navigationLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link 
                      href={link.href}
                      className="w-full cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                
                {user && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <div className="flex items-center justify-between w-full px-2 py-1">
                        <span className="text-sm text-gray-700">
                          {user.is_guest ? "ゲスト" : user.contact_person}
                        </span>
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      ログアウト
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
