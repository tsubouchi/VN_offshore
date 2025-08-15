"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Paperclip, MoreVertical, Phone, Video, Languages, Check, CheckCheck, Circle } from "lucide-react"

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  translated_content?: string
  is_read: boolean
  created_at: string
  sender?: {
    company_name: string
    role: "buyer" | "vendor"
  }
}

interface Conversation {
  id: string
  buyer_id: string
  vendor_id: string
  company_id: string
  last_message_at: string
  buyer?: {
    company_name: string
    contact_person: string
  }
  vendor?: {
    company_name: string
    contact_person: string
  }
  company?: {
    company_name: string
    logo_url?: string
  }
}

interface ChatInterfaceProps {
  currentUserId: string
  currentUserRole: "buyer" | "vendor"
  newConversation?: {
    companyId: string
    companyName: string
    companyLogo?: string
    initialMessage: string
    timestamp: string
  } | null
}

export function ChatInterface({ currentUserId, currentUserRole, newConversation }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({})
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Mock data for demonstration
  const mockConversations: Conversation[] = [
    {
      id: "conv1",
      buyer_id: "buyer1",
      vendor_id: "vendor1",
      company_id: "comp1",
      last_message_at: "2024-01-15T10:30:00Z",
      buyer: {
        company_name: "Tokyo Tech Solutions",
        contact_person: "Tanaka Hiroshi",
      },
      vendor: {
        company_name: "TechViet Solutions",
        contact_person: "Nguyen Van A",
      },
      company: {
        company_name: "TechViet Solutions",
        logo_url: "/abstract-tech-logo.png",
      },
    },
    {
      id: "conv2",
      buyer_id: "buyer1",
      vendor_id: "vendor2",
      company_id: "comp2",
      last_message_at: "2024-01-14T15:45:00Z",
      buyer: {
        company_name: "Tokyo Tech Solutions",
        contact_person: "Tanaka Hiroshi",
      },
      vendor: {
        company_name: "Saigon Digital",
        contact_person: "Tran Thi B",
      },
      company: {
        company_name: "Saigon Digital",
        logo_url: "/digital-agency-logo.png",
      },
    },
  ]

  const mockMessages: Message[] = [
    {
      id: "msg1",
      conversation_id: "conv1",
      sender_id: "buyer1",
      content: "Hello! I'm interested in your web development services for our e-commerce project.",
      is_read: true,
      created_at: "2024-01-15T09:00:00Z",
      sender: {
        company_name: "Tokyo Tech Solutions",
        role: "buyer",
      },
    },
    {
      id: "msg2",
      conversation_id: "conv1",
      sender_id: "vendor1",
      content:
        "Hello! Thank you for your interest. We'd be happy to discuss your e-commerce project. Could you tell us more about your requirements?",
      translated_content:
        "こんにちは！ご関心をお寄せいただき、ありがとうございます。Eコマースプロジェクトについて喜んでご相談させていただきます。要件について詳しく教えていただけますか？",
      is_read: true,
      created_at: "2024-01-15T09:15:00Z",
      sender: {
        company_name: "TechViet Solutions",
        role: "vendor",
      },
    },
    {
      id: "msg3",
      conversation_id: "conv1",
      sender_id: "buyer1",
      content:
        "We need a modern e-commerce platform with inventory management, payment integration, and mobile responsiveness. The timeline is about 6 months.",
      is_read: true,
      created_at: "2024-01-15T09:30:00Z",
      sender: {
        company_name: "Tokyo Tech Solutions",
        role: "buyer",
      },
    },
    {
      id: "msg4",
      conversation_id: "conv1",
      sender_id: "vendor1",
      content:
        "Perfect! We have extensive experience with e-commerce platforms. We can provide a detailed proposal including timeline, team structure, and pricing. Would you like to schedule a video call to discuss further?",
      translated_content:
        "完璧です！私たちはEコマースプラットフォームの豊富な経験があります。タイムライン、チーム構成、価格設定を含む詳細な提案を提供できます。さらに詳しく話し合うためにビデオ通話をスケジュールしませんか？",
      is_read: false,
      created_at: "2024-01-15T10:30:00Z",
      sender: {
        company_name: "TechViet Solutions",
        role: "vendor",
      },
    },
  ]

  useEffect(() => {
    // Initialize with mock data
    setConversations(mockConversations)

    if (newConversation) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        buyer_id: currentUserRole === "buyer" ? currentUserId : "buyer1",
        vendor_id: currentUserRole === "vendor" ? currentUserId : newConversation.companyId,
        company_id: newConversation.companyId,
        last_message_at: newConversation.timestamp,
        buyer:
          currentUserRole === "buyer"
            ? {
                company_name: "Your Company",
                contact_person: "You",
              }
            : {
                company_name: "Tokyo Tech Solutions",
                contact_person: "Tanaka Hiroshi",
              },
        vendor:
          currentUserRole === "vendor"
            ? {
                company_name: "Your Company",
                contact_person: "You",
              }
            : {
                company_name: newConversation.companyName,
                contact_person: "Contact Person",
              },
        company: {
          company_name: newConversation.companyName,
          logo_url: newConversation.companyLogo,
        },
      }

      const initialMessage: Message = {
        id: `msg_${Date.now()}`,
        conversation_id: newConv.id,
        sender_id: currentUserId,
        content: newConversation.initialMessage,
        is_read: false,
        created_at: newConversation.timestamp,
        sender: {
          company_name: currentUserRole === "buyer" ? "Your Company" : "Your Company",
          role: currentUserRole,
        },
      }

      setConversations((prev) => [newConv, ...prev])
      setSelectedConversation(newConv)
      setMessages([initialMessage])
    } else if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0])
      setMessages(mockMessages.filter((msg) => msg.conversation_id === mockConversations[0].id))
    }
  }, [newConversation, currentUserId, currentUserRole])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message: Message = {
      id: Date.now().toString(),
      conversation_id: selectedConversation.id,
      sender_id: currentUserId,
      content: newMessage,
      is_read: false,
      created_at: new Date().toISOString(),
      sender: {
        company_name: currentUserRole === "buyer" ? "Your Company" : "Your Company",
        role: currentUserRole,
      },
    }

    setMessages((prev) => [...prev, message])
    setNewMessage("")

    // TODO: Send message via Supabase
    // const { error } = await supabase.from('messages').insert(message)
  }

  const handleTranslateMessage = async (messageId: string) => {
    setIsTranslating(true)
    // TODO: Implement actual translation
    setTimeout(() => {
      setShowTranslation((prev) => ({ ...prev, [messageId]: !prev[messageId] }))
      setIsTranslating(false)
    }, 1000)
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOtherParty = (conversation: Conversation) => {
    return currentUserRole === "buyer" ? conversation.vendor : conversation.buyer
  }

  return (
    <div className="flex h-[600px] bg-background border rounded-lg overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(600px-73px)]">
          <div className="p-2 space-y-1">
            {conversations.map((conversation) => {
              const otherParty = getOtherParty(conversation)
              const isSelected = selectedConversation?.id === conversation.id

              return (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation)
                    setMessages(mockMessages.filter((msg) => msg.conversation_id === conversation.id))
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversation.company?.logo_url || "/placeholder.svg"} />
                      <AvatarFallback>{conversation.company?.company_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm truncate">{otherParty?.company_name}</h3>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conversation.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{otherParty?.contact_person}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Circle className="h-2 w-2 fill-gray-500 text-gray-500" />
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.company?.logo_url || "/placeholder.svg"} />
                    <AvatarFallback>{selectedConversation.company?.company_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{getOtherParty(selectedConversation)?.company_name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getOtherParty(selectedConversation)?.contact_person}
                    </p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    <Circle className="h-2 w-2 fill-gray-500 text-gray-500 mr-1" />
                    Online
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage = message.sender_id === currentUserId
                  const showTranslated = showTranslation[message.id]

                  return (
                    <div key={message.id} className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] ${isOwnMessage ? "order-2" : "order-1"}`}>
                        <div
                          className={`rounded-lg p-3 ${
                            isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">
                            {showTranslated && message.translated_content
                              ? message.translated_content
                              : message.content}
                          </p>

                          {message.translated_content && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className={`mt-2 h-6 text-xs ${
                                isOwnMessage ? "text-primary-foreground/70 hover:text-primary-foreground" : ""
                              }`}
                              onClick={() => handleTranslateMessage(message.id)}
                              disabled={isTranslating}
                            >
                              <Languages className="h-3 w-3 mr-1" />
                              {showTranslated ? "Show Original" : "Translate"}
                            </Button>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>{formatTime(message.created_at)}</span>
                          {isOwnMessage && (
                            <div className="flex items-center">
                              {message.is_read ? (
                                <CheckCheck className="h-3 w-3 text-primary" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="h-4 w-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="pr-10"
                  />
                </div>
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <div className="text-lg font-medium mb-2">Select a conversation</div>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
