"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatList } from "@/components/chat/chat-list"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showChatList, setShowChatList] = useState(true)
  const [newConversation, setNewConversation] = useState<{
    companyId: string
    companyName: string
    companyLogo?: string
    initialMessage: string
    timestamp: string
  } | null>(null)

  // TODO: Get from authenticated user
  const currentUserId = "buyer1" // Changed to buyer1 to match the flow from search
  const currentUserRole = "buyer" as const // Changed to buyer to match Japanese companies searching for Vietnamese teams

  useEffect(() => {
    const conversationData = sessionStorage.getItem("newConversation")
    if (conversationData) {
      try {
        const data = JSON.parse(conversationData)
        setNewConversation(data)
        setShowChatList(false) // Automatically show the chat interface
        sessionStorage.removeItem("newConversation") // Clean up
      } catch (error) {
        console.error("Error parsing conversation data:", error)
      }
    }
  }, [])

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setShowChatList(false)
    setNewConversation(null) // Clear new conversation when selecting existing chat
  }

  const handleBackToList = () => {
    setShowChatList(true)
    setSelectedChatId(null)
    setNewConversation(null) // Clear new conversation when going back to list
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
            {selectedChatId || !showChatList || newConversation ? (
              <ChatInterface
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                newConversation={newConversation} // Pass new conversation data to chat interface
              />
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
