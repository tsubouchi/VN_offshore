"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, MessageCircle, Circle } from "lucide-react"

interface ChatPreview {
  id: string
  company_name: string
  contact_person: string
  logo_url?: string
  last_message: string
  last_message_time: string
  unread_count: number
  is_online: boolean
  role: "buyer" | "vendor"
}

interface ChatListProps {
  onSelectChat: (chatId: string) => void
}

export function ChatList({ onSelectChat }: ChatListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unread" | "online">("all")

  // Mock data for demonstration
  const mockChats: ChatPreview[] = [
    {
      id: "1",
      company_name: "Tokyo Tech Solutions",
      contact_person: "Tanaka Hiroshi",
      logo_url: "/japanese-tech-logo.png",
      last_message: "We need a modern e-commerce platform with inventory management...",
      last_message_time: "2024-01-15T10:30:00Z",
      unread_count: 0,
      is_online: true,
      role: "buyer",
    },
    {
      id: "2",
      company_name: "Osaka Digital Corp",
      contact_person: "Sato Yuki",
      logo_url: "/digital-corporation-logo.png",
      last_message: "Thank you for the proposal. When can we start?",
      last_message_time: "2024-01-15T09:45:00Z",
      unread_count: 2,
      is_online: false,
      role: "buyer",
    },
    {
      id: "3",
      company_name: "Kyoto Innovations",
      contact_person: "Yamamoto Kenji",
      logo_url: "/innovation-company-logo.png",
      last_message: "Could you provide more details about your mobile app development services?",
      last_message_time: "2024-01-14T16:20:00Z",
      unread_count: 1,
      is_online: true,
      role: "buyer",
    },
    {
      id: "4",
      company_name: "Nagoya Systems",
      contact_person: "Suzuki Akiko",
      logo_url: "/systems-company-logo.png",
      last_message: "The project timeline looks good. Let's discuss the budget.",
      last_message_time: "2024-01-14T14:15:00Z",
      unread_count: 0,
      is_online: false,
      role: "buyer",
    },
  ]

  const filteredChats = mockChats.filter((chat) => {
    const matchesSearch =
      chat.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.contact_person.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    switch (selectedFilter) {
      case "unread":
        return chat.unread_count > 0
      case "online":
        return chat.is_online
      default:
        return true
    }
  })

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Messages
        </CardTitle>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={selectedFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("all")}
          >
            All
          </Button>
          <Button
            variant={selectedFilter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("unread")}
          >
            Unread
          </Button>
          <Button
            variant={selectedFilter === "online" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedFilter("online")}
          >
            Online
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted border border-transparent hover:border-border"
                onClick={() => onSelectChat(chat.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={chat.logo_url || "/placeholder.svg"} />
                      <AvatarFallback>{chat.company_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {chat.is_online && (
                      <Circle className="absolute -bottom-1 -right-1 h-4 w-4 fill-gray-500 text-gray-500 bg-background rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-sm truncate">{chat.company_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{formatTime(chat.last_message_time)}</span>
                        {chat.unread_count > 0 && (
                          <Badge variant="default" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {chat.unread_count}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-1">{chat.contact_person}</p>

                    <p className="text-sm text-muted-foreground line-clamp-2">{chat.last_message}</p>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {chat.role === "buyer" ? "Japanese Company" : "Vietnamese Company"}
                      </Badge>
                      {chat.is_online && (
                        <div className="flex items-center gap-1">
                          <Circle className="h-2 w-2 fill-gray-500 text-gray-500" />
                          <span className="text-xs text-gray-600">Online</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredChats.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-medium mb-2">No conversations found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "Start a conversation with a company"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
