"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import Link from "next/link"

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

export default function ContactChatPage() {
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get initial message from contact form
    const initialMessage = searchParams.get("message")
    const name = searchParams.get("name")
    const company = searchParams.get("company")

    if (initialMessage) {
      const welcomeMessage: Message = {
        id: "1",
        text: `${name}様、${company}からのお問い合わせありがとうございます。以下の内容について詳しくお聞かせください：\n\n"${initialMessage}"\n\nご質問やご不明な点がございましたら、お気軽にお聞かせください。`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([welcomeMessage])
    } else {
      const defaultMessage: Message = {
        id: "1",
        text: "お問い合わせありがとうございます。どのようなことでお困りでしょうか？",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages([defaultMessage])
    }
  }, [searchParams])

  const sendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputMessage }),
      })

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || "申し訳ございませんが、回答を生成できませんでした。",
        isUser: false,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "エラーが発生しました。しばらく後にお試しください。",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link href="/contact" className="inline-flex items-center text-gray-600 hover:text-black">
            <ArrowLeft className="h-4 w-4 mr-2" />
            お問い合わせフォームに戻る
          </Link>
        </div>

        <Card className="bg-white shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-black">サポートチャット</h1>
            <p className="text-gray-600 mt-2">リアルタイムでサポートチームとやり取りできます</p>
          </div>

          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-lg ${
                    message.isUser ? "bg-black text-white" : "bg-gray-100 text-black"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.text}</div>
                  <div className={`text-xs mt-2 ${message.isUser ? "text-gray-300" : "text-gray-500"}`}>
                    {message.timestamp.toLocaleTimeString("ja-JP")}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-black p-4 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="メッセージを入力してください..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                送信
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
