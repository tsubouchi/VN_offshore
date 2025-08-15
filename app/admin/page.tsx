"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Building2, Star, CheckCircle, XCircle, Eye } from "lucide-react"

export default function AdminDashboard() {
  const [stats] = useState({
    totalUsers: 1247,
    totalCompanies: 89,
    pendingApprovals: 12,
    totalReviews: 456,
    averageRating: 4.2,
    monthlyGrowth: 15.3,
  })

  const [pendingCompanies] = useState([
    {
      id: "1",
      name: "VietTech Solutions",
      location: "Ho Chi Minh City",
      employees: "50-100",
      submittedAt: "2024-01-15",
      status: "pending",
    },
    {
      id: "2",
      name: "Saigon Dev Hub",
      location: "Ho Chi Minh City",
      employees: "20-50",
      submittedAt: "2024-01-14",
      status: "pending",
    },
    {
      id: "3",
      name: "Hanoi Software Group",
      location: "Hanoi",
      employees: "100-200",
      submittedAt: "2024-01-13",
      status: "pending",
    },
  ])

  const [recentReviews] = useState([
    {
      id: "1",
      company: "Digital Innovations Ltd",
      reviewer: "Tokyo Systems Inc",
      rating: 5,
      status: "published",
      date: "2024-01-15",
    },
    {
      id: "2",
      company: "VietCode Solutions",
      reviewer: "Osaka Tech Corp",
      rating: 4,
      status: "pending",
      date: "2024-01-14",
    },
    {
      id: "3",
      company: "Saigon Digital",
      reviewer: "Kyoto Innovations",
      rating: 3,
      status: "flagged",
      date: "2024-01-13",
    },
  ])

  const handleApproveCompany = (id: string) => {
    console.log("[v0] Approving company:", id)
    // Implementation would update company status
  }

  const handleRejectCompany = (id: string) => {
    console.log("[v0] Rejecting company:", id)
    // Implementation would update company status
  }

  const handleModerateReview = (id: string, action: string) => {
    console.log("[v0] Moderating review:", id, action)
    // Implementation would update review status
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">管理ダッシュボード</h1>
                <p className="text-sm text-gray-500">ベトナムオフショアマッチングプラットフォーム</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                管理者
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">総ユーザー数</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+{stats.monthlyGrowth}% 前月比</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">登録企業数</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompanies}</div>
              <p className="text-xs text-muted-foreground">承認待ち: {stats.pendingApprovals}件</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">レビュー数</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">平均評価: {stats.averageRating}/5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="companies" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="companies">企業管理</TabsTrigger>
            <TabsTrigger value="reviews">レビュー管理</TabsTrigger>
            <TabsTrigger value="users">ユーザー管理</TabsTrigger>
            <TabsTrigger value="analytics">分析</TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>承認待ち企業</CardTitle>
                <CardDescription>新規登録されたベトナム企業の審査を行います</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingCompanies.map((company) => (
                    <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{company.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>{company.location}</span>
                          <span>従業員数: {company.employees}</span>
                          <span>申請日: {company.submittedAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("[v0] Viewing company details:", company.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          詳細
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                          onClick={() => handleApproveCompany(company.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          承認
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => handleRejectCompany(company.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          却下
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>レビュー管理</CardTitle>
                <CardDescription>投稿されたレビューの承認・削除を行います</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <div key={review.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{review.company}</h3>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span>投稿者: {review.reviewer}</span>
                          <span>投稿日: {review.date}</span>
                          <Badge
                            variant={
                              review.status === "published"
                                ? "default"
                                : review.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {review.status === "published"
                              ? "公開済み"
                              : review.status === "pending"
                                ? "承認待ち"
                                : "要確認"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => console.log("[v0] Viewing review details:", review.id)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          詳細
                        </Button>
                        {review.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-gray-600 border-gray-200 hover:bg-gray-50 bg-transparent"
                            onClick={() => handleModerateReview(review.id, "approve")}
                          >
                            承認
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50 bg-transparent"
                          onClick={() => handleModerateReview(review.id, "delete")}
                        >
                          削除
                        </Button>
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
                <CardTitle>ユーザー管理</CardTitle>
                <CardDescription>登録ユーザーの管理とアカウント状態の確認</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">ユーザー管理機能は開発中です</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>プラットフォーム分析</CardTitle>
                <CardDescription>利用状況とパフォーマンス指標の確認</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">分析機能は開発中です</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
