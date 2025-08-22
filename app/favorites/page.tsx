"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FavoriteButton } from "@/components/ui/favorite-button"
import { CompanyCardSkeleton } from "@/components/search/company-card-skeleton"
import { PageErrorBoundary } from "@/components/page-error-boundary"
import { useFavorites } from "@/lib/favorites-context"
import { useAuth } from "@/lib/auth-context"
import { Heart, Search, Grid, List, Star, MapPin, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import type { Company } from "@/lib/supabase"

// Mock company data - in real app, this would come from the database
const MOCK_COMPANIES: (Company & { industries: string[]; technologies: string[] })[] = [
  {
    id: "1",
    user_id: "user1",
    company_name: "TechViet Solutions",
    description: "Leading Vietnamese software development company specializing in web and mobile applications for Japanese market.",
    website: "https://techviet.com",
    established_year: 2018,
    employee_count: 45,
    location: "Ho Chi Minh City",
    address: "District 1, Ho Chi Minh City",
    status: "approved" as const,
    logo_url: "/abstract-tech-logo.png",
    cover_image_url: "",
    hourly_rate_min: 25,
    hourly_rate_max: 45,
    currency: "USD",
    average_rating: 4.8,
    total_reviews: 24,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    industries: ["Web Development", "E-commerce", "Fintech"],
    technologies: ["React", "Node.js", "TypeScript", "PostgreSQL", "AWS"],
  },
  {
    id: "2",
    user_id: "user2",
    company_name: "Saigon Digital",
    description: "Full-stack development team with expertise in modern JavaScript frameworks and cloud technologies.",
    website: "https://saigondigital.vn",
    established_year: 2020,
    employee_count: 28,
    location: "Ho Chi Minh City",
    address: "District 3, Ho Chi Minh City",
    status: "approved" as const,
    logo_url: "/digital-agency-logo.png",
    cover_image_url: "",
    hourly_rate_min: 20,
    hourly_rate_max: 35,
    currency: "USD",
    average_rating: 4.6,
    total_reviews: 18,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    industries: ["Mobile App Development", "Web Development", "Healthcare"],
    technologies: ["React Native", "Flutter", "Vue.js", "Python", "MongoDB"],
  }
]

export default function FavoritesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { favorites } = useFavorites()
  const [companies, setCompanies] = useState<(Company & { industries: string[]; technologies: string[] })[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<(Company & { industries: string[]; technologies: string[] })[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const loadFavoriteCompanies = useCallback(async () => {
    if (!favorites.length) {
      setCompanies([])
      setFilteredCompanies([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      // For demo purposes, filter mock companies by favorites
      // In real app, this would fetch from database
      const favoriteCompanies = MOCK_COMPANIES.filter(company => 
        favorites.includes(company.id)
      )
      
      setCompanies(favoriteCompanies)
      setFilteredCompanies(favoriteCompanies)
    } catch (error) {
      console.error("Error loading favorite companies:", error)
    } finally {
      setIsLoading(false)
    }
  }, [favorites])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    loadFavoriteCompanies()
  }, [user, favorites, router, loadFavoriteCompanies])

  useEffect(() => {
    // Filter companies based on search query
    if (searchQuery.trim() === "") {
      setFilteredCompanies(companies)
    } else {
      const filtered = companies.filter(company =>
        company.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        company.industries.some(industry => 
          industry.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        company.technologies.some(tech => 
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
      setFilteredCompanies(filtered)
    }
  }, [searchQuery, companies])

  const handleViewProfile = (companyId: string) => {
    router.push(`/company/${companyId}`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <Breadcrumb
              items={[
                { label: "My Favorites", current: true }
              ]}
            />
          </div>
        </div>

        {/* Header */}
        <div className="border-b bg-card">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Heart className="h-6 w-6 text-red-500 fill-current" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-card-foreground">My Favorites</h1>
                  <p className="text-muted-foreground mt-1">
                    Companies you&apos;ve saved for future reference ({favorites.length} total)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="mt-6">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search your favorite companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <CompanyCardSkeleton key={index} />
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground mb-6">
                Start browsing companies and add them to your favorites to see them here.
              </p>
              <Button onClick={() => router.push("/search")}>
                <Search className="h-4 w-4 mr-2" />
                Browse Companies
              </Button>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No matches found</h3>
              <p className="text-muted-foreground mb-6">
                No favorite companies match your search query.
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredCompanies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                          <span className="text-primary font-bold">{company.company_name.charAt(0)}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{company.company_name}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{company.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span>{company.employee_count} emp</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <FavoriteButton
                        companyId={company.id}
                        companyName={company.company_name}
                        size="sm"
                      />
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {company.description}
                    </p>
                    
                    <div className="space-y-3">
                      {/* Rating and Price */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {renderStars(company.average_rating)}
                          <span className="text-sm ml-1">{company.average_rating}</span>
                        </div>
                        <div className="text-sm font-semibold text-primary">
                          ${company.hourly_rate_min}-${company.hourly_rate_max}/hr
                        </div>
                      </div>
                      
                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1">
                        {company.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {company.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{company.technologies.length - 3}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Action Button */}
                      <Button
                        onClick={() => handleViewProfile(company.id)}
                        className="w-full"
                        size="sm"
                      >
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageErrorBoundary>
  )
}