"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Users, Building2, Star, CheckCircle, XCircle, Eye, 
  TrendingUp, AlertCircle, Download, Filter,
  Calendar, BarChart3, PieChart, Activity, DollarSign,
  Shield, Settings, RefreshCw, UserCheck, UserX, Mail,
  MessageSquare, FileText, Database, Clock, Globe
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { format } from "date-fns"
import { ja } from "date-fns/locale"

interface DashboardStats {
  totalUsers: number
  totalCompanies: number
  pendingApprovals: number
  totalReviews: number
  averageRating: number
  monthlyGrowth: number
  activeUsers: number
  revenue: number
  conversionRate: number
  supportTickets: number
}

interface SystemLog extends Record<string, unknown> {
  id: string
  type: "info" | "warning" | "error" | "success"
  message: string
  user?: string
  timestamp: string
  details?: Record<string, unknown>
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 1247,
    totalCompanies: 89,
    pendingApprovals: 12,
    totalReviews: 456,
    averageRating: 4.2,
    monthlyGrowth: 15.3,
    activeUsers: 823,
    revenue: 248500,
    conversionRate: 3.7,
    supportTickets: 24
  })

  const [pendingCompanies, setPendingCompanies] = useState([
    {
      id: "1",
      name: "VietTech Solutions",
      location: "Ho Chi Minh City",
      employees: "50-100",
      technologies: ["React", "Node.js", "AWS"],
      submittedAt: "2024-01-15",
      status: "pending",
      documents: ["business_license.pdf", "portfolio.pdf"],
      contactEmail: "contact@viettech.vn"
    },
    {
      id: "2",
      name: "Saigon Dev Hub",
      location: "Ho Chi Minh City",
      employees: "20-50",
      technologies: ["Angular", "Java", "Docker"],
      submittedAt: "2024-01-14",
      status: "pending",
      documents: ["business_license.pdf"],
      contactEmail: "info@saigondev.vn"
    },
  ])

  const [users, setUsers] = useState([
    {
      id: "1",
      name: "田中太郎",
      email: "tanaka@example.com",
      role: "buyer",
      company: "Tokyo Systems Inc",
      status: "active",
      joinedAt: "2023-12-01",
      lastLogin: "2024-01-15 14:30"
    },
    {
      id: "2",
      name: "Nguyen Van A",
      email: "nguyen@example.vn",
      role: "vendor",
      company: "VietCode Solutions",
      status: "active",
      joinedAt: "2023-11-15",
      lastLogin: "2024-01-15 10:20"
    },
    {
      id: "3",
      name: "佐藤花子",
      email: "sato@example.com",
      role: "buyer",
      company: "Osaka Tech Corp",
      status: "suspended",
      joinedAt: "2023-10-20",
      lastLogin: "2024-01-10 09:00"
    }
  ])

  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([
    {
      id: "1",
      type: "success",
      message: "新規企業登録が承認されました",
      user: "admin@platform.com",
      timestamp: new Date().toISOString(),
      details: { company: "VietTech Solutions" }
    },
    {
      id: "2",
      type: "warning",
      message: "不正なログイン試行を検出",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: { ip: "192.168.1.1", attempts: 5 }
    },
    {
      id: "3",
      type: "info",
      message: "システムバックアップ完了",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      details: { size: "2.4GB", duration: "12min" }
    },
    {
      id: "4",
      type: "error",
      message: "メール送信エラー",
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      details: { recipient: "user@example.com", error: "SMTP connection failed" }
    }
  ])

  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch real-time stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!isSupabaseAvailable() || !supabase) return

      try {
        // Fetch user stats
        const { count: userCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true })

        // Fetch company stats
        const { count: companyCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })

        // Fetch pending approvals
        const { count: pendingCount } = await supabase
          .from('companies')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')

        // Fetch review stats
        const { data: reviews } = await supabase
          .from('reviews')
          .select('rating')

        const avgRating = reviews 
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
          : 0

        setStats(prev => ({
          ...prev,
          totalUsers: userCount || prev.totalUsers,
          totalCompanies: companyCount || prev.totalCompanies,
          pendingApprovals: pendingCount || prev.pendingApprovals,
          totalReviews: reviews?.length || prev.totalReviews,
          averageRating: avgRating || prev.averageRating
        }))
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const handleApproveCompany = async (id: string) => {
    if (isSupabaseAvailable() && supabase) {
      await supabase
        .from('companies')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', id)
    }
    
    setPendingCompanies(prev => prev.filter(c => c.id !== id))
    setSystemLogs(prev => [{
      id: Date.now().toString(),
      type: "success",
      message: "企業を承認しました",
      user: user?.email,
      timestamp: new Date().toISOString(),
      details: { companyId: id }
    }, ...prev])
  }

  const handleRejectCompany = async (id: string, reason: string) => {
    if (isSupabaseAvailable() && supabase) {
      await supabase
        .from('companies')
        .update({ 
          status: 'rejected', 
          rejection_reason: reason,
          rejected_at: new Date().toISOString() 
        })
        .eq('id', id)
    }
    
    setPendingCompanies(prev => prev.filter(c => c.id !== id))
    setSystemLogs(prev => [{
      id: Date.now().toString(),
      type: "warning",
      message: "企業登録を却下しました",
      user: user?.email,
      timestamp: new Date().toISOString(),
      details: { companyId: id, reason }
    }, ...prev])
  }

  const handleUserAction = async (userId: string, action: "suspend" | "activate" | "delete") => {
    if (isSupabaseAvailable() && supabase) {
      if (action === "delete") {
        await supabase.from('users').delete().eq('id', userId)
      } else {
        await supabase
          .from('users')
          .update({ status: action === "suspend" ? "suspended" : "active" })
          .eq('id', userId)
      }
    }

    setUsers(prev => 
      action === "delete" 
        ? prev.filter(u => u.id !== userId)
        : prev.map(u => u.id === userId ? { ...u, status: action === "suspend" ? "suspended" : "active" } : u)
    )

    setSystemLogs(prev => [{
      id: Date.now().toString(),
      type: action === "delete" ? "warning" : "info",
      message: `ユーザーアカウントを${action === "suspend" ? "停止" : action === "activate" ? "有効化" : "削除"}しました`,
      user: user?.email,
      timestamp: new Date().toISOString(),
      details: { userId, action }
    }, ...prev])
  }

  const exportData = async (type: "users" | "companies" | "reviews" | "logs") => {
    const data = type === "users" ? users : 
                 type === "companies" ? pendingCompanies : 
                 type === "logs" ? systemLogs : []
    
    const csv = convertToCSV(data)
    downloadCSV(csv, `${type}_${format(new Date(), 'yyyyMMdd')}.csv`)

    setSystemLogs(prev => [{
      id: Date.now().toString(),
      type: "info",
      message: `${type}データをエクスポートしました`,
      user: user?.email,
      timestamp: new Date().toISOString(),
      details: { type, recordCount: data.length }
    }, ...prev])
  }

  const convertToCSV = (data: Record<string, unknown>[]) => {
    if (data.length === 0) return ""
    const headers = Object.keys(data[0]).join(",")
    const rows = data.map(row => Object.values(row).join(","))
    return [headers, ...rows].join("\n")
  }

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
  }

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />
      case "warning": return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case "error": return <XCircle className="w-4 h-4 text-red-500" />
      default: return <Activity className="w-4 h-4 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">管理ダッシュボード</h1>
                <p className="text-sm text-muted-foreground">システム全体の管理と監視</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="w-4 h-4 mr-2" />
                更新
              </Button>
              <Badge variant="outline">
                管理者: {user?.email || "admin@platform.com"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                <span className="text-green-500">+{stats.monthlyGrowth}%</span>
                <span className="text-muted-foreground ml-1">前月比</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                アクティブ: {stats.activeUsers.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">登録企業数</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <div className="flex items-center text-xs">
                <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />
                <span className="text-yellow-500">{stats.pendingApprovals}件</span>
                <span className="text-muted-foreground ml-1">承認待ち</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                承認率: 92.3%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">月間収益</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">¥{stats.revenue.toLocaleString()}</div>
              <div className="flex items-center text-xs">
                <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                <span className="text-green-500">+23.5%</span>
                <span className="text-muted-foreground ml-1">前月比</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                CV率: {stats.conversionRate}%
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">サポート</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.supportTickets}</div>
              <div className="flex items-center text-xs">
                <Clock className="w-3 h-3 mr-1 text-blue-500" />
                <span className="text-blue-500">平均2.5時間</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                解決率: 94.2%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="companies">企業管理</TabsTrigger>
            <TabsTrigger value="users">ユーザー管理</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
            <TabsTrigger value="logs">システムログ</TabsTrigger>
            <TabsTrigger value="settings">設定</TabsTrigger>
            <TabsTrigger value="export">データ管理</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>承認待ち企業</CardTitle>
                    <CardDescription>新規登録されたベトナム企業の審査</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="企業名で検索..."
                      className="w-64"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="outline" size="icon">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCompanies.map((company) => (
                    <div key={company.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-lg">{company.name}</h3>
                            <Badge variant="secondary">承認待ち</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div>
                              <Globe className="w-4 h-4 inline mr-1" />
                              {company.location}
                            </div>
                            <div>
                              <Users className="w-4 h-4 inline mr-1" />
                              従業員: {company.employees}
                            </div>
                            <div>
                              <Mail className="w-4 h-4 inline mr-1" />
                              {company.contactEmail}
                            </div>
                            <div>
                              <Calendar className="w-4 h-4 inline mr-1" />
                              申請日: {company.submittedAt}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            {company.technologies.map((tech) => (
                              <Badge key={tech} variant="outline" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              提出書類: {company.documents.join(", ")}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4 mr-1" />
                                詳細確認
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>{company.name} - 詳細情報</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>会社概要</Label>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    ベトナムを拠点とするソフトウェア開発会社。
                                    日本企業向けのオフショア開発を専門としています。
                                  </p>
                                </div>
                                <div>
                                  <Label>技術スタック</Label>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {company.technologies.map((tech) => (
                                      <Badge key={tech}>{tech}</Badge>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <Label>提出書類</Label>
                                  <div className="space-y-2 mt-1">
                                    {company.documents.map((doc) => (
                                      <div key={doc} className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm">{doc}</span>
                                        <Button size="sm" variant="ghost">
                                          <Download className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    const reason = prompt("却下理由を入力してください")
                                    if (reason) handleRejectCompany(company.id, reason)
                                  }}
                                >
                                  却下
                                </Button>
                                <Button onClick={() => handleApproveCompany(company.id)}>
                                  承認
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            size="sm"
                            onClick={() => handleApproveCompany(company.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            承認
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt("却下理由を入力してください")
                              if (reason) handleRejectCompany(company.id, reason)
                            }}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            却下
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ユーザー管理</CardTitle>
                    <CardDescription>登録ユーザーの管理とアカウント状態の確認</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="ユーザー検索..."
                      className="w-64"
                    />
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべて</SelectItem>
                        <SelectItem value="active">アクティブ</SelectItem>
                        <SelectItem value="suspended">停止中</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ユーザー名</TableHead>
                      <TableHead>メール</TableHead>
                      <TableHead>役割</TableHead>
                      <TableHead>会社</TableHead>
                      <TableHead>ステータス</TableHead>
                      <TableHead>最終ログイン</TableHead>
                      <TableHead className="text-right">アクション</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(u => filterStatus === "all" || u.status === filterStatus)
                      .map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "destructive" : "default"}>
                            {user.role === "buyer" ? "購入者" : 
                             user.role === "vendor" ? "販売者" : "管理者"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.company}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
                            {user.status === "active" ? "アクティブ" : "停止中"}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Settings className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>アクション</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                詳細表示
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                メール送信
                              </DropdownMenuItem>
                              {user.status === "active" ? (
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, "suspend")}
                                  className="text-yellow-600"
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  アカウント停止
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem 
                                  onClick={() => handleUserAction(user.id, "activate")}
                                  className="text-green-600"
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  アカウント有効化
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => {
                                  if (confirm("本当に削除しますか？")) {
                                    handleUserAction(user.id, "delete")
                                  }
                                }}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                削除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>ユーザー成長</CardTitle>
                  <CardDescription>月別の新規ユーザー登録数</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded">
                    <BarChart3 className="w-16 h-16 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ユーザー分布</CardTitle>
                  <CardDescription>役割別のユーザー構成</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded">
                    <PieChart className="w-16 h-16 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>収益推移</CardTitle>
                  <CardDescription>月別の収益とコンバージョン率</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center border rounded">
                    <TrendingUp className="w-16 h-16 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>地域分布</CardTitle>
                  <CardDescription>企業の地域別分布</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ホーチミン市</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '65%' }} />
                        </div>
                        <span className="text-sm font-medium">65%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ハノイ</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '25%' }} />
                        </div>
                        <span className="text-sm font-medium">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">ダナン</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div className="bg-primary rounded-full h-2" style={{ width: '10%' }} />
                        </div>
                        <span className="text-sm font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>システムログ</CardTitle>
                    <CardDescription>システムイベントとアクティビティの監視</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="ログタイプ" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">すべて</SelectItem>
                        <SelectItem value="info">情報</SelectItem>
                        <SelectItem value="warning">警告</SelectItem>
                        <SelectItem value="error">エラー</SelectItem>
                        <SelectItem value="success">成功</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {systemLogs.map((log) => (
                      <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                        <div className="mt-0.5">{getLogIcon(log.type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{log.message}</span>
                            {log.user && (
                              <Badge variant="outline" className="text-xs">
                                {log.user}
                              </Badge>
                            )}
                          </div>
                          {log.details && (
                            <pre className="text-xs text-muted-foreground mt-1">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(log.timestamp), 'yyyy/MM/dd HH:mm:ss', { locale: ja })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>プラットフォーム設定</CardTitle>
                  <CardDescription>基本的なシステム設定</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>サイト名</Label>
                    <Input defaultValue="Vietnam Offshore Platform" />
                  </div>
                  <div className="space-y-2">
                    <Label>サポートメール</Label>
                    <Input type="email" defaultValue="support@platform.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>メンテナンスモード</Label>
                    <Select defaultValue="off">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="off">オフ</SelectItem>
                        <SelectItem value="on">オン</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button>設定を保存</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>セキュリティ設定</CardTitle>
                  <CardDescription>セキュリティとアクセス制御</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>2要素認証</Label>
                    <Select defaultValue="optional">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">無効</SelectItem>
                        <SelectItem value="optional">オプション</SelectItem>
                        <SelectItem value="required">必須</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>ログイン試行回数制限</Label>
                    <Input type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label>セッションタイムアウト（分）</Label>
                    <Input type="number" defaultValue="30" />
                  </div>
                  <Button>設定を保存</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>データエクスポート</CardTitle>
                <CardDescription>システムデータのバックアップとエクスポート</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        <h3 className="font-medium">ユーザーデータ</h3>
                      </div>
                      <Badge>{stats.totalUsers} 件</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      全ユーザーの情報をCSV形式でエクスポート
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportData("users")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-5 h-5" />
                        <h3 className="font-medium">企業データ</h3>
                      </div>
                      <Badge>{stats.totalCompanies} 件</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      全企業の情報をCSV形式でエクスポート
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportData("companies")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        <h3 className="font-medium">レビューデータ</h3>
                      </div>
                      <Badge>{stats.totalReviews} 件</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      全レビューの情報をCSV形式でエクスポート
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportData("reviews")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5" />
                        <h3 className="font-medium">システムログ</h3>
                      </div>
                      <Badge>{systemLogs.length} 件</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      システムログをCSV形式でエクスポート
                    </p>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => exportData("logs")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      エクスポート
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        <h3 className="font-medium">フルバックアップ</h3>
                      </div>
                      <Badge variant="destructive">管理者のみ</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      データベース全体のバックアップを作成
                    </p>
                    <div className="flex gap-2">
                      <Input type="date" placeholder="開始日" />
                      <Input type="date" placeholder="終了日" />
                      <Button className="flex-1">
                        <Database className="w-4 h-4 mr-2" />
                        バックアップ作成
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}