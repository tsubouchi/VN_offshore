import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { AuthProvider } from "@/lib/auth-context"
import Header from "@/components/header"
import { FloatingChatbot } from "@/components/chatbot/floating-chatbot"
import { ErrorBoundary } from "@/components/error-boundary"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "Offshore Match - Connect Japanese & Vietnamese Companies",
  description: "Platform for Japanese companies to find and connect with Vietnamese offshore development teams",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Header />
            </Suspense>
            {children}
            <FloatingChatbot />
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
