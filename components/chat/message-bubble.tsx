"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Languages, Check, CheckCheck, Copy, MoreVertical, Reply } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    translated_content?: string
    sender_id: string
    created_at: string
    is_read: boolean
    sender?: {
      company_name: string
      role: "buyer" | "vendor"
      avatar_url?: string
    }
  }
  isOwnMessage: boolean
  onTranslate?: (messageId: string) => void
  onReply?: (messageId: string) => void
}

export function MessageBubble({ message, isOwnMessage, onTranslate, onReply }: MessageBubbleProps) {
  const [showTranslation, setShowTranslation] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleTranslate = () => {
    if (message.translated_content) {
      setShowTranslation(!showTranslation)
    } else {
      onTranslate?.(message.id)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className={`flex gap-3 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar - only show for other person's messages */}
      {!isOwnMessage && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.sender?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="text-xs">{message.sender?.company_name.charAt(0)}</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Sender info - only show for other person's messages */}
        {!isOwnMessage && (
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-muted-foreground">{message.sender?.company_name}</span>
            <Badge variant="outline" className="text-xs h-4">
              {message.sender?.role === "buyer" ? "Japanese Company" : "Vietnamese Company"}
            </Badge>
          </div>
        )}

        {/* Message bubble */}
        <div className="group relative">
          <div
            className={`rounded-lg px-4 py-2 ${
              isOwnMessage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            <p className="text-sm whitespace-pre-wrap">
              {showTranslation && message.translated_content ? message.translated_content : message.content}
            </p>

            {/* Translation toggle */}
            {message.translated_content && (
              <Button
                variant="ghost"
                size="sm"
                className={`mt-2 h-6 text-xs ${
                  isOwnMessage
                    ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={handleTranslate}
              >
                <Languages className="h-3 w-3 mr-1" />
                {showTranslation ? "Show Original" : "Show Translation"}
              </Button>
            )}
          </div>

          {/* Message actions */}
          <div
            className={`absolute top-0 ${isOwnMessage ? "left-0 -translate-x-full" : "right-0 translate-x-full"} opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwnMessage ? "end" : "start"}>
                <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </DropdownMenuItem>
                {!isOwnMessage && message.translated_content && (
                  <DropdownMenuItem onClick={handleTranslate}>
                    <Languages className="h-4 w-4 mr-2" />
                    {showTranslation ? "Show Original" : "Translate"}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Message status and time */}
        <div
          className={`flex items-center gap-2 mt-1 text-xs text-muted-foreground ${
            isOwnMessage ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <span>{formatTime(message.created_at)}</span>
          {isOwnMessage && (
            <div className="flex items-center">
              {message.is_read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
