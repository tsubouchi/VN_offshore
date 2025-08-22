"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { SearchFilters, type SearchFilters as SearchFiltersType } from "@/components/search/search-filters"
import { CompanyCard } from "@/components/search/company-card"
import { CompanyCardSkeleton } from "@/components/search/company-card-skeleton"
import { InquiryModal } from "@/components/inquiry/inquiry-modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Search, Filter } from "lucide-react"
import type { Company } from "@/lib/supabase"
import { PageErrorBoundary } from "@/components/page-error-boundary"

// Mock data for demonstration
const MOCK_COMPANIES: (Company & { industries: string[]; technologies: string[] })[] = [
  {
    id: "1",
    user_id: "user1",
    company_name: "TechViet Solutions",
    description:
      "Leading Vietnamese software development company specializing in web and mobile applications for Japanese market.",
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
  },
  {
    id: "3",
    user_id: "user3",
    company_name: "Hanoi Tech Hub",
    description: "Enterprise software development with focus on scalable solutions and Japanese business practices.",
    website: "https://hanoitech.com",
    established_year: 2016,
    employee_count: 72,
    location: "Hanoi",
    address: "Ba Dinh District, Hanoi",
    status: "approved" as const,
    logo_url: "/tech-hub-logo.png",
    cover_image_url: "",
    hourly_rate_min: 30,
    hourly_rate_max: 55,
    currency: "USD",
    average_rating: 4.9,
    total_reviews: 31,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    industries: ["AI/Machine Learning", "Fintech", "Gaming"],
    technologies: ["Java", "Python", "React", "Angular", "Kubernetes", "Docker"],
  },
]

export default function SearchPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<(Company & { industries: string[]; technologies: string[] })[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<(Company & { industries: string[]; technologies: string[] })[]>([])
  const [selectedCompany, setSelectedCompany] = useState<
    (Company & { industries?: string[]; technologies?: string[] }) | null
  >(null)
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<SearchFiltersType>({
    search: "",
    industries: [],
    technologies: [],
    location: "",
    employeeCount: "",
    hourlyRateRange: [10, 100],
    minRating: 0,
    sortBy: "rating",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Simulate initial data loading
  useEffect(() => {
    const loadCompanies = async () => {
      setIsLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      setCompanies(MOCK_COMPANIES)
      setFilteredCompanies(MOCK_COMPANIES)
      setIsLoading(false)
    }
    loadCompanies()
  }, [])

  useEffect(() => {
    if (companies.length > 0) {
      applyFilters()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, companies])

  const applyFilters = async () => {
    setIsSearching(true)
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 300))
    let filtered = [...companies]

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(
        (company) =>
          company.company_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          company.description?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    // Industry filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        company.industries.some((industry) => filters.industries.includes(industry)),
      )
    }

    // Technology filter
    if (filters.technologies.length > 0) {
      filtered = filtered.filter((company) => company.technologies.some((tech) => filters.technologies.includes(tech)))
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter((company) => company.location === filters.location)
    }

    // Employee count filter
    if (filters.employeeCount) {
      filtered = filtered.filter((company) => {
        const count = company.employee_count || 0
        switch (filters.employeeCount) {
          case "1-10":
            return count >= 1 && count <= 10
          case "11-50":
            return count >= 11 && count <= 50
          case "51-200":
            return count >= 51 && count <= 200
          case "201-500":
            return count >= 201 && count <= 500
          case "500+":
            return count >= 500
          default:
            return true
        }
      })
    }

    // Hourly rate filter
    filtered = filtered.filter((company) => {
      const minRate = company.hourly_rate_min || 0
      const maxRate = company.hourly_rate_max || 0
      return maxRate >= filters.hourlyRateRange[0] && minRate <= filters.hourlyRateRange[1]
    })

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter((company) => company.average_rating >= filters.minRating)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "rating":
          return b.average_rating - a.average_rating
        case "reviews":
          return b.total_reviews - a.total_reviews
        case "price-low":
          return (a.hourly_rate_min || 0) - (b.hourly_rate_min || 0)
        case "price-high":
          return (b.hourly_rate_max || 0) - (a.hourly_rate_max || 0)
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        default:
          return 0
      }
    })

    setFilteredCompanies(filtered)
    setIsSearching(false)
  }

  const handleContact = (company: Company & { industries?: string[]; technologies?: string[] }) => {
    setSelectedCompany(company)
    setIsInquiryModalOpen(true)
  }

  const handleStartChat = (companyId: string, initialMessage: string) => {
    console.log("Starting chat with company:", companyId, "Message:", initialMessage)
    const company = companies.find((c) => c.id === companyId)
    if (company) {
      // Store the conversation data in sessionStorage for the messages page
      const conversationData = {
        companyId,
        companyName: company.company_name,
        companyLogo: company.logo_url,
        initialMessage,
        timestamp: new Date().toISOString(),
      }
      sessionStorage.setItem("newConversation", JSON.stringify(conversationData))
    }
    router.push("/messages")
  }

  const handleViewProfile = (companyId: string) => {
    router.push(`/company/${companyId}`)
  }

  return (
    <PageErrorBoundary>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-card-foreground">Find Vietnamese Development Teams</h1>
              <p className="text-muted-foreground mt-1">
                Discover skilled offshore development partners for your next project
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:hidden">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Quick Search */}
          <div className="relative max-w-md">
            {isSearching ? (
              <Spinner size="sm" className="absolute left-3 top-1/2 transform -translate-y-1/2" />
            ) : (
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <Input
              placeholder="Search companies..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <div className={`${showFilters ? "block" : "hidden"} md:block`}>
            <SearchFilters onFiltersChange={setFilters} />
          </div>

          {/* Results */}
          <div className="flex-1">
            {!isLoading && (
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {isSearching ? "Searching..." : `${filteredCompanies.length} companies found`}
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-6">
              {isLoading ? (
                // Show skeleton loading cards
                Array.from({ length: 6 }).map((_, index) => (
                  <CompanyCardSkeleton key={index} />
                ))
              ) : (
                filteredCompanies.map((company) => (
                  <CompanyCard
                    key={company.id}
                    company={company}
                    onContact={handleContact}
                    onViewProfile={handleViewProfile}
                  />
                ))
              )}
            </div>

            {!isLoading && filteredCompanies.length === 0 && !isSearching && (
              <div className="text-center py-12">
                <div className="text-muted-foreground mb-4">
                  <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">No companies found</h3>
                  <p>Try adjusting your search criteria or filters</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {selectedCompany && (
        <InquiryModal
          isOpen={isInquiryModalOpen}
          onClose={() => {
            setIsInquiryModalOpen(false)
            setSelectedCompany(null)
          }}
          company={selectedCompany}
          onStartChat={handleStartChat}
        />
      )}
      </div>
    </PageErrorBoundary>
  )
}
