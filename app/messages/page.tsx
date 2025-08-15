"use client"

import { useState } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatList } from "@/components/chat/chat-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showChatList, setShowChatList] = useState(true)

  // TODO: Get from authenticated user
  const currentUserId = "vendor1"
  const currentUserRole = "vendor" as const

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setShowChatList(false)
  }

  const handleBackToList = () => {
    setShowChatList(true)
    setSelectedChatId(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center gap-4">
            {!showChatList && (
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="md:hidden">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl font-bold">Messages</h1>
              <p className="text-muted-foreground">
                Communicate directly with{" "}
                {currentUserRole === "vendor" ? "Japanese companies" : "Vietnamese development teams"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* Chat List - Hidden on mobile when chat is selected */}
          <div className={`lg:col-span-2 ${showChatList ? "block" : "hidden lg:block"}`}>
            <ChatList onSelectChat={handleSelectChat} />
          </div>

          {/* Chat Interface - Hidden on mobile when no chat selected */}
          <div className={`lg:col-span-3 ${!showChatList ? "block" : "hidden lg:block"}`}>
            {selectedChatId || !showChatList ? (
              <ChatInterface currentUserId={currentUserId} currentUserRole={currentUserRole} />
            ) : (
              <div className="hidden lg:flex h-[600px] items-center justify-center border rounded-lg bg-card">
                <div className="text-center text-muted-foreground">
                  <div className="text-lg font-medium mb-2">Select a conversation</div>
                  <p>Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
