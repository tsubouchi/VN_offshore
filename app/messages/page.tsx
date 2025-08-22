"use client"

import { useState, useEffect } from "react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { ChatList } from "@/components/chat/chat-list"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Filter, Archive, Star } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MessageStats {
  unread: number
  archived: number
  starred: number
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [showChatList, setShowChatList] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "archived" | "starred">("all")
  const [messageStats, setMessageStats] = useState<MessageStats>({
    unread: 0,
    archived: 0,
    starred: 0
  })
  const [newConversation, setNewConversation] = useState<{
    companyId: string
    companyName: string
    companyLogo?: string
    initialMessage: string
    timestamp: string
  } | null>(null)

  const currentUserId = user?.id || "00000000-0000-0000-0000-000000000001"
  const currentUserRole = (user?.role || "buyer") as "buyer" | "vendor"

  useEffect(() => {
    const conversationData = sessionStorage.getItem("newConversation")
    if (conversationData) {
      try {
        const data = JSON.parse(conversationData)
        setNewConversation(data)
        setShowChatList(false)
        sessionStorage.removeItem("newConversation")
      } catch (error) {
        console.error("Error parsing conversation data:", error)
      }
    }
  }, [])

  // Fetch message statistics
  useEffect(() => {
    const fetchMessageStats = async () => {
      if (!isSupabaseAvailable() || !supabase || !user) return

      try {
        // Get unread count
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('recipient_id', user.id)
          .eq('is_read', false)

        // Get archived count
        const { count: archivedCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`)
          .eq('is_archived', true)

        // Get starred count
        const { count: starredCount } = await supabase
          .from('conversations')
          .select('*', { count: 'exact', head: true })
          .or(`buyer_id.eq.${user.id},vendor_id.eq.${user.id}`)
          .eq('is_starred', true)

        setMessageStats({
          unread: unreadCount || 0,
          archived: archivedCount || 0,
          starred: starredCount || 0
        })
      } catch (error) {
        console.error('Error fetching message stats:', error)
      }
    }

    fetchMessageStats()
    
    // Set up real-time subscription for message updates
    if (isSupabaseAvailable() && supabase && user) {
      const channel = supabase
        .channel('message-stats')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `recipient_id=eq.${user.id}`
          },
          () => {
            fetchMessageStats()
          }
        )
        .subscribe()

      return () => {
        if (supabase) {
          supabase.removeChannel(channel)
        }
      }
    }
  }, [user])

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId)
    setShowChatList(false)
    setNewConversation(null)
    // Mark messages as read
    markMessagesAsRead(chatId)
  }

  const handleBackToList = () => {
    setShowChatList(true)
    setSelectedChatId(null)
    setNewConversation(null)
  }

  const markMessagesAsRead = async (conversationId: string) => {
    if (!isSupabaseAvailable() || !supabase || !user) return

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id)
        .eq('is_read', false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
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
            
            {/* Message Stats */}
            <div className="hidden md:flex items-center gap-4">
              {messageStats.unread > 0 && (
                <Badge variant="destructive">
                  {messageStats.unread} unread
                </Badge>
              )}
              <Badge variant="outline">
                <Star className="h-3 w-3 mr-1" />
                {messageStats.starred} starred
              </Badge>
              <Badge variant="outline">
                <Archive className="h-3 w-3 mr-1" />
                {messageStats.archived} archived
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filter: {filterStatus}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter Messages</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterStatus("all")}>
                All Messages
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("unread")}>
                Unread Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("starred")}>
                <Star className="h-4 w-4 mr-2" />
                Starred
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterStatus("archived")}>
                <Archive className="h-4 w-4 mr-2" />
                Archived
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Tabs defaultValue="inbox" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value="inbox" className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-6">
              <div className={`lg:col-span-2 ${showChatList ? "block" : "hidden lg:block"}`}>
                <ChatList 
                  onSelectChat={handleSelectChat}
                />
              </div>

              <div className={`lg:col-span-3 ${!showChatList ? "block" : "hidden lg:block"}`}>
                {selectedChatId || !showChatList || newConversation ? (
                  <ChatInterface
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    newConversation={newConversation}
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
          </TabsContent>

          <TabsContent value="starred" className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-6">
              <div className={`lg:col-span-2 ${showChatList ? "block" : "hidden lg:block"}`}>
                <ChatList 
                  onSelectChat={handleSelectChat}
                />
              </div>

              <div className={`lg:col-span-3 ${!showChatList ? "block" : "hidden lg:block"}`}>
                {selectedChatId ? (
                  <ChatInterface
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    newConversation={null}
                  />
                ) : (
                  <div className="hidden lg:flex h-[600px] items-center justify-center border rounded-lg bg-card">
                    <div className="text-center text-muted-foreground">
                      <div className="text-lg font-medium mb-2">No starred conversations</div>
                      <p>Star important conversations to access them quickly</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="archived" className="space-y-4">
            <div className="grid lg:grid-cols-5 gap-6">
              <div className={`lg:col-span-2 ${showChatList ? "block" : "hidden lg:block"}`}>
                <ChatList 
                  onSelectChat={handleSelectChat}
                />
              </div>

              <div className={`lg:col-span-3 ${!showChatList ? "block" : "hidden lg:block"}`}>
                {selectedChatId ? (
                  <ChatInterface
                    currentUserId={currentUserId}
                    currentUserRole={currentUserRole}
                    newConversation={null}
                  />
                ) : (
                  <div className="hidden lg:flex h-[600px] items-center justify-center border rounded-lg bg-card">
                    <div className="text-center text-muted-foreground">
                      <div className="text-lg font-medium mb-2">No archived conversations</div>
                      <p>Archived conversations will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
