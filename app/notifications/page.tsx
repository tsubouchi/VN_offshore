"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bell, Check, Trash2, MessageSquare, Star, CheckCircle, Settings } from "lucide-react"

interface Notification {
  id: string
  type: "message" | "review" | "approval" | "system"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  details?: string
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "message",
      title: "新しいメッセージ",
      message: "Tokyo Systems Inc からメッセージが届きました",
      details: "プロジェクトの詳細について質問があります。来週お時間はありますでしょうか？",
      timestamp: "2024-01-15 14:30",
      read: false,
      actionUrl: "/messages",
    },
    {
      id: "2",
      type: "review",
      title: "新しいレビュー",
      message: "あなたの会社に新しいレビューが投稿されました",
      details: "Osaka Tech Corp から5つ星のレビューをいただきました。",
      timestamp: "2024-01-15 13:15",
      read: false,
      actionUrl: "/company/reviews",
    },
    {
      id: "3",
      type: "approval",
      title: "企業承認完了",
      message: "あなたの企業プロフィールが承認されました",
      details: "おめでとうございます！プロフィールが公開され、日本企業からの問い合わせを受け付けることができます。",
      timestamp: "2024-01-15 10:00",
      read: true,
    },
    {
      id: "4",
      type: "system",
      title: "システムメンテナンス",
      message: "明日午前2時〜4時にメンテナンスを実施します",
      details: "サーバーの性能向上のため、一時的にサービスを停止いたします。ご不便をおかけして申し訳ございません。",
      timestamp: "2024-01-14 18:00",
      read: true,
    },
    {
      id: "5",
      type: "message",
      title: "チャット招待",
      message: "Kyoto Innovations があなたをチャットに招待しました",
      details: "新しいプロジェクトについて相談したいことがあります。",
      timestamp: "2024-01-14 16:45",
      read: true,
      actionUrl: "/messages",
    },
  ])

  const [filter, setFilter] = useState<"all" | "unread" | "message" | "review" | "approval" | "system">("all")

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "review":
        return <Star className="w-5 h-5 text-yellow-500" />
      case "approval":
        return <CheckCircle className="w-5 h-5 text-gray-500" />
      case "system":
        return <Settings className="w-5 h-5 text-gray-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "message":
        return "メッセージ"
      case "review":
        return "レビュー"
      case "approval":
        return "承認"
      case "system":
        return "システム"
      default:
        return "通知"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">通知センター</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : "すべての通知を確認済みです"}
              </p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} className="bg-black hover:bg-gray-800">
                <Check className="w-4 h-4 mr-2" />
                すべて既読にする
              </Button>
            )}
          </div>
        </div>

        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="unread">未読</TabsTrigger>
            <TabsTrigger value="message">メッセージ</TabsTrigger>
            <TabsTrigger value="review">レビュー</TabsTrigger>
            <TabsTrigger value="approval">承認</TabsTrigger>
            <TabsTrigger value="system">システム</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">通知がありません</h3>
                  <p className="text-gray-500">
                    {filter === "unread" ? "未読の通知はありません" : "該当する通知がありません"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`transition-all hover:shadow-md ${!notification.read ? "border-gray-200 bg-gray-50" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(notification.type)}
                            </Badge>
                            {!notification.read && <div className="w-2 h-2 bg-gray-500 rounded-full" />}
                          </div>
                          <p className="text-gray-600 mb-2">{notification.message}</p>
                          {notification.details && (
                            <p className="text-sm text-gray-500 mb-3 bg-gray-50 p-3 rounded-lg">
                              {notification.details}
                            </p>
                          )}
                          <p className="text-xs text-gray-400">{notification.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        {!notification.read && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markAsRead(notification.id)}
                            className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {notification.actionUrl && (
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          size="sm"
                          onClick={() => (window.location.href = notification.actionUrl!)}
                          className="bg-black hover:bg-gray-800"
                        >
                          詳細を見る
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
