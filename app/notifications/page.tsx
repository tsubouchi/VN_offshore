"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Bell, Check, Trash2, MessageSquare, Star, CheckCircle, Settings, 
  Archive, BellOff, Clock, Filter, MoreVertical, AlertCircle, 
  TrendingUp, Users, Calendar, Volume2, VolumeX 
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/auth-context"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { formatDistanceToNow } from "date-fns"
import { ja } from "date-fns/locale"

interface Notification {
  id: string
  type: "message" | "review" | "approval" | "system" | "mention" | "follow" | "deadline"
  title: string
  message: string
  timestamp: string
  read: boolean
  actionUrl?: string
  details?: string
  priority?: "low" | "medium" | "high"
  groupId?: string
  userId?: string
}

interface NotificationGroup {
  id: string
  type: string
  count: number
  notifications: Notification[]
  latestTimestamp: string
}

interface NotificationSettings {
  email: boolean
  push: boolean
  sound: boolean
  messages: boolean
  reviews: boolean
  system: boolean
  mentions: boolean
  deadlines: boolean
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [groupedNotifications, setGroupedNotifications] = useState<NotificationGroup[]>([])
  const [filter, setFilter] = useState<"all" | "unread" | "message" | "review" | "approval" | "system" | "mention" | "follow" | "deadline">("all")
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    sound: true,
    messages: true,
    reviews: true,
    system: true,
    mentions: true,
    deadlines: true,
  })
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [selectedPriority, setSelectedPriority] = useState<"all" | "high" | "medium" | "low">("all")

  const showBrowserNotification = useCallback(async (notification: Notification) => {
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: notification.id,
        requireInteraction: notification.priority === 'high'
      })
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        showBrowserNotification(notification)
      }
    }
  }, [])

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isSupabaseAvailable() || !supabase || !user) {
        // Use mock data when Supabase is not available
        setNotifications([
          {
            id: "1",
            type: "message",
            title: "新しいメッセージ",
            message: "Tokyo Systems Inc からメッセージが届きました",
            details: "プロジェクトの詳細について質問があります。",
            timestamp: new Date().toISOString(),
            read: false,
            actionUrl: "/messages",
            priority: "high",
            groupId: "msg-group-1"
          },
          {
            id: "2",
            type: "review",
            title: "新しいレビュー",
            message: "5つ星のレビューが投稿されました",
            details: "優れたサービスと技術力でした。",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false,
            actionUrl: "/company/reviews",
            priority: "medium"
          },
          {
            id: "3",
            type: "deadline",
            title: "締切通知",
            message: "プロジェクト提案の締切が近づいています",
            details: "明日の17:00までに提出してください。",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            read: false,
            priority: "high",
            actionUrl: "/projects"
          },
          {
            id: "4",
            type: "mention",
            title: "メンション通知",
            message: "Tokyo Tech があなたをメンションしました",
            details: "プロジェクトレビューであなたの意見が求められています。",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            read: true,
            priority: "medium"
          },
          {
            id: "5",
            type: "system",
            title: "システムアップデート",
            message: "新機能が追加されました",
            details: "AIアシスタント機能が利用可能になりました。",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true,
            priority: "low"
          }
        ])
        return
      }

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (data) setNotifications(data)
      } catch (error) {
        console.error('Error fetching notifications:', error)
      }
    }

    fetchNotifications()

    // Set up real-time subscription
    if (isSupabaseAvailable() && supabase && user) {
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            const newNotification = payload.new as Notification
            setNotifications(prev => [newNotification, ...prev])
            
            // Play notification sound if enabled
            if (notificationSettings.sound) {
              playNotificationSound()
            }

            // Show browser notification if enabled
            if (notificationSettings.push && 'Notification' in window) {
              showBrowserNotification(newNotification)
            }
          }
        )
        .subscribe()

      return () => {
        if (supabase) {
          supabase.removeChannel(channel)
        }
      }
    }
  }, [user, notificationSettings.sound, notificationSettings.push, showBrowserNotification])

  // Group notifications
  useEffect(() => {
    const groups = notifications.reduce((acc, notification) => {
      const groupKey = notification.groupId || `${notification.type}-${notification.id}`
      if (!acc[groupKey]) {
        acc[groupKey] = {
          id: groupKey,
          type: notification.type,
          count: 0,
          notifications: [],
          latestTimestamp: notification.timestamp
        }
      }
      acc[groupKey].notifications.push(notification)
      acc[groupKey].count++
      if (new Date(notification.timestamp) > new Date(acc[groupKey].latestTimestamp)) {
        acc[groupKey].latestTimestamp = notification.timestamp
      }
      return acc
    }, {} as Record<string, NotificationGroup>)

    setGroupedNotifications(Object.values(groups).sort((a, b) => 
      new Date(b.latestTimestamp).getTime() - new Date(a.latestTimestamp).getTime()
    ))
  }, [notifications])

  const playNotificationSound = () => {
    const audio = new Audio('/notification-sound.mp3')
    audio.play().catch(e => console.log('Could not play notification sound:', e))
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") {
      if (selectedPriority === "all") return true
      return notification.priority === selectedPriority
    }
    if (filter === "unread") return !notification.read
    return notification.type === filter
  })

  const unreadCount = notifications.filter((n) => !n.read).length
  const highPriorityCount = notifications.filter((n) => n.priority === 'high' && !n.read).length

  const markAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification))
    )

    if (isSupabaseAvailable() && supabase) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
    }
  }

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

    if (isSupabaseAvailable() && supabase && user) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
    }
  }

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))

    if (isSupabaseAvailable() && supabase) {
      await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
    }
  }

  const archiveNotification = async (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    )

    if (isSupabaseAvailable() && supabase) {
      await supabase
        .from('notifications')
        .update({ is_archived: true, is_read: true })
        .eq('id', id)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case "review":
        return <Star className="w-5 h-5 text-yellow-500" />
      case "approval":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "system":
        return <Settings className="w-5 h-5 text-gray-500" />
      case "mention":
        return <Users className="w-5 h-5 text-purple-500" />
      case "follow":
        return <TrendingUp className="w-5 h-5 text-indigo-500" />
      case "deadline":
        return <Calendar className="w-5 h-5 text-red-500" />
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
      case "mention":
        return "メンション"
      case "follow":
        return "フォロー"
      case "deadline":
        return "締切"
      default:
        return "通知"
    }
  }

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">緊急</Badge>
      case "medium":
        return <Badge variant="default" className="text-xs">通常</Badge>
      case "low":
        return <Badge variant="secondary" className="text-xs">低</Badge>
      default:
        return null
    }
  }

  const updateNotificationSettings = useCallback(async (settings: NotificationSettings) => {
    setNotificationSettings(settings)
    
    if (isSupabaseAvailable() && supabase && user) {
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          notification_settings: settings
        })
    }
  }, [user])

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">通知センター</h1>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount}件の未読通知` : "すべて確認済み"}
                </p>
                {highPriorityCount > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {highPriorityCount}件の緊急通知
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline">
                  <Check className="w-4 h-4 mr-2" />
                  すべて既読
                </Button>
              )}
              
              {/* Notification Settings */}
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>通知設定</DialogTitle>
                    <DialogDescription>
                      通知の受信方法をカスタマイズします
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">メール通知</Label>
                      <Switch
                        id="email"
                        checked={notificationSettings.email}
                        onCheckedChange={(checked: boolean) =>
                          updateNotificationSettings({ ...notificationSettings, email: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">プッシュ通知</Label>
                      <Switch
                        id="push"
                        checked={notificationSettings.push}
                        onCheckedChange={(checked: boolean) =>
                          updateNotificationSettings({ ...notificationSettings, push: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sound">
                        <div className="flex items-center gap-2">
                          {notificationSettings.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                          サウンド
                        </div>
                      </Label>
                      <Switch
                        id="sound"
                        checked={notificationSettings.sound}
                        onCheckedChange={(checked: boolean) =>
                          updateNotificationSettings({ ...notificationSettings, sound: checked })
                        }
                      />
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-3">通知タイプ</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="messages">メッセージ</Label>
                          <Switch
                            id="messages"
                            checked={notificationSettings.messages}
                            onCheckedChange={(checked: boolean) =>
                              updateNotificationSettings({ ...notificationSettings, messages: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="reviews">レビュー</Label>
                          <Switch
                            id="reviews"
                            checked={notificationSettings.reviews}
                            onCheckedChange={(checked: boolean) =>
                              updateNotificationSettings({ ...notificationSettings, reviews: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="mentions">メンション</Label>
                          <Switch
                            id="mentions"
                            checked={notificationSettings.mentions}
                            onCheckedChange={(checked: boolean) =>
                              updateNotificationSettings({ ...notificationSettings, mentions: checked })
                            }
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="deadlines">締切通知</Label>
                          <Switch
                            id="deadlines"
                            checked={notificationSettings.deadlines}
                            onCheckedChange={(checked: boolean) =>
                              updateNotificationSettings({ ...notificationSettings, deadlines: checked })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <Tabs value={filter} onValueChange={(value: string) => setFilter(value as "all" | "unread" | "message" | "review" | "approval" | "system" | "mention" | "follow" | "deadline")} className="flex-1">
            <TabsList className="grid grid-cols-4 lg:grid-cols-8">
              <TabsTrigger value="all">すべて</TabsTrigger>
              <TabsTrigger value="unread">未読</TabsTrigger>
              <TabsTrigger value="message">メッセージ</TabsTrigger>
              <TabsTrigger value="review">レビュー</TabsTrigger>
              <TabsTrigger value="mention">メンション</TabsTrigger>
              <TabsTrigger value="deadline">締切</TabsTrigger>
              <TabsTrigger value="approval">承認</TabsTrigger>
              <TabsTrigger value="system">システム</TabsTrigger>
            </TabsList>
          </Tabs>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                優先度: {selectedPriority === "all" ? "すべて" : 
                        selectedPriority === "high" ? "高" :
                        selectedPriority === "medium" ? "中" : "低"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>優先度フィルター</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedPriority("all")}>
                すべて
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("high")}>
                <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
                高優先度
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("medium")}>
                <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                中優先度
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedPriority("low")}>
                <BellOff className="w-4 h-4 mr-2 text-gray-500" />
                低優先度
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">通知がありません</h3>
                  <p className="text-muted-foreground">
                    {filter === "unread" ? "未読の通知はありません" : "該当する通知がありません"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              groupedNotifications.map((group) => {
                const groupNotifications = group.notifications.filter(n => 
                  filteredNotifications.some(fn => fn.id === n.id)
                )
                
                if (groupNotifications.length === 0) return null

                if (group.count > 1 && groupNotifications.length > 1) {
                  // Render grouped notifications
                  return (
                    <Card key={group.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getNotificationIcon(group.type)}
                            <CardTitle className="text-base">
                              {getTypeLabel(group.type)} ({group.count}件)
                            </CardTitle>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(group.latestTimestamp), { 
                              addSuffix: true, 
                              locale: ja 
                            })}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {groupNotifications.slice(0, 3).map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg border ${
                              !notification.read ? 'bg-muted/50' : 'bg-background'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">{notification.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.message}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 ml-2">
                                {getPriorityBadge(notification.priority)}
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {group.count > 3 && (
                          <Button variant="ghost" size="sm" className="w-full">
                            他{group.count - 3}件を表示
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )
                }

                // Render individual notifications
                return groupNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`transition-all hover:shadow-md ${
                      !notification.read ? 'border-primary/20 bg-muted/30' : ''
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-medium">{notification.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {getTypeLabel(notification.type)}
                              </Badge>
                              {getPriorityBadge(notification.priority)}
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                            </div>
                            <p className="text-muted-foreground mb-2">{notification.message}</p>
                            {notification.details && (
                              <p className="text-sm text-muted-foreground mb-3 bg-muted/50 p-3 rounded-lg">
                                {notification.details}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.timestamp), {
                                addSuffix: true,
                                locale: ja
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.read && (
                              <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                <Check className="w-4 h-4 mr-2" />
                                既読にする
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => archiveNotification(notification.id)}>
                              <Archive className="w-4 h-4 mr-2" />
                              アーカイブ
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => deleteNotification(notification.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              削除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {notification.actionUrl && (
                        <div className="mt-4 pt-4 border-t">
                          <Button
                            size="sm"
                            onClick={() => window.location.href = notification.actionUrl!}
                          >
                            詳細を見る
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}