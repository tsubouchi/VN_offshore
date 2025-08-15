"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Search, MapPin, Code, Star, ArrowRight, Users, Globe } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedTech, setSelectedTech] = useState("")

  useEffect(() => {
    if (!loading && user) {
      if (user.role === "buyer") {
        router.push("/search")
      } else if (user.role === "vendor") {
        router.push("/dashboard")
      } else if (user.role === "admin") {
        router.push("/admin")
      }
    }
  }, [user, loading, router])

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchKeyword) params.set("keyword", searchKeyword)
    if (selectedCity) params.set("city", selectedCity)
    if (selectedTech) params.set("tech", selectedTech)
    router.push(`/search?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground">Loading...</div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect via useEffect
  }

  const categories = [
    { name: "AI", icon: "🤖" },
    { name: "Web", icon: "🌐" },
    { name: "Mobile", icon: "📱" },
    { name: "組込", icon: "⚙️" },
    { name: "QA", icon: "🔍" },
    { name: "SAP", icon: "📊" },
    { name: "Blockchain", icon: "⛓️" },
    { name: "IoT", icon: "📡" },
  ]

  const popularVendors = [
    {
      id: 1,
      name: "TechViet Solutions",
      city: "Ho Chi Minh City",
      rating: 4.8,
      reviewCount: 127,
      specialties: ["React", "Node.js", "AWS"],
      priceRange: "$25-45/hr",
      image: "/modern-vietnam-office.png",
    },
    {
      id: 2,
      name: "Saigon Digital",
      city: "Ho Chi Minh City",
      rating: 4.9,
      reviewCount: 89,
      specialties: ["Mobile", "Flutter", "iOS"],
      priceRange: "$30-50/hr",
      image: "/vietnam-dev-team-meeting.png",
    },
    {
      id: 3,
      name: "Hanoi Tech Hub",
      city: "Hanoi",
      rating: 4.7,
      reviewCount: 156,
      specialties: ["AI/ML", "Python", "TensorFlow"],
      priceRange: "$35-55/hr",
      image: "/saigon-tech-workspace.png",
    },
    {
      id: 4,
      name: "Da Nang Developers",
      city: "Da Nang",
      rating: 4.6,
      reviewCount: 73,
      specialties: ["Blockchain", "Solidity", "Web3"],
      priceRange: "$40-60/hr",
      image: "/modern-vietnam-office.png",
    },
  ]

  const recentReviews = [
    {
      id: 1,
      company: "TechViet Solutions",
      reviewer: "田中商事株式会社",
      rating: 5,
      comment: "非常に高品質な開発チームでした。コミュニケーションも円滑で、期日通りに納品していただきました。",
      date: "2024年1月15日",
    },
    {
      id: 2,
      company: "Saigon Digital",
      reviewer: "株式会社山田システム",
      rating: 5,
      comment: "モバイルアプリ開発において優れた技術力を発揮してくれました。また依頼したいと思います。",
      date: "2024年1月12日",
    },
    {
      id: 3,
      company: "Hanoi Tech Hub",
      reviewer: "佐藤エンジニアリング",
      rating: 4,
      comment: "AI機能の実装が素晴らしく、期待以上の成果を得ることができました。",
      date: "2024年1月10日",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-white py-20">
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{ backgroundImage: "url('/modern-vietnam-office.png')" }}
        />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              ベトナム現地企業を即時チャットで
              <span className="block text-primary">スピード比較</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              日本の開発会社向け -
              評判・レビュー付きでベトナム開発企業を検索・比較し、そのままオンラインで即時問い合わせ
            </p>

            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 border border-border">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="キーワード"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground"
                  >
                    <option value="">都市を選択</option>
                    <option value="hanoi">Hanoi</option>
                    <option value="hcmc">Ho Chi Minh City</option>
                    <option value="danang">Da Nang</option>
                  </select>
                </div>
                <div className="relative">
                  <Code className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    value={selectedTech}
                    onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-input text-foreground"
                  >
                    <option value="">技術を選択</option>
                    <option value="react">React</option>
                    <option value="nodejs">Node.js</option>
                    <option value="python">Python</option>
                    <option value="mobile">Mobile</option>
                    <option value="ai">AI/ML</option>
                  </select>
                </div>
                <Button onClick={handleSearch} className="w-full">
                  検索
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <Badge
                  key={category.name}
                  variant="secondary"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setSelectedTech(category.name.toLowerCase())}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">人気ベンダー</h2>
            <Link href="/search">
              <Button variant="outline">
                すべて見る
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularVendors.map((vendor) => (
              <Card key={vendor.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={vendor.image || "/placeholder.svg"}
                        alt={vendor.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">{vendor.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {vendor.city}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 font-medium">{vendor.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">({vendor.reviewCount} レビュー)</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {vendor.specialties.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">{vendor.priceRange}</span>
                    <Link href={`/company/${vendor.id}`}>
                      <Button size="sm">詳細</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-8 text-center">新着レビュー</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {recentReviews.map((review) => (
              <Card key={review.id} className="bg-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-card-foreground">{review.company}</h4>
                    <div className="flex items-center">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{review.comment}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{review.reviewer}</span>
                    <span>{review.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">今すぐ始めましょう</h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            数百社の成功事例から、あなたに最適なベトナム開発チームを見つけてください
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login?role=buyer">
              <Button size="lg" variant="secondary" className="px-8 py-3 font-semibold">
                無料ではじめる (Buyer)
                <Users className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/login?role=vendor">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 font-semibold border-white text-white hover:bg-white/10 bg-transparent"
              >
                掲載申請 (Vendor)
                <Globe className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
