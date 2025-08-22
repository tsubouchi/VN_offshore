"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { X, Search, Filter, Star, MapPin, Users, DollarSign } from "lucide-react"

interface SearchFiltersProps {
  onFiltersChange: (filters: SearchFilters) => void
}

export interface SearchFilters {
  search: string
  industries: string[]
  technologies: string[]
  location: string
  employeeCount: string
  hourlyRateRange: [number, number]
  minRating: number
  sortBy: string
}

const INDUSTRIES = [
  "Web Development",
  "Mobile App Development",
  "E-commerce",
  "Fintech",
  "Healthcare",
  "Education",
  "Gaming",
  "IoT",
  "AI/Machine Learning",
  "Blockchain",
]

const TECHNOLOGIES = [
  "React",
  "Vue.js",
  "Angular",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "PHP",
  "Ruby on Rails",
  "Go",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "React Native",
  "Flutter",
  "iOS (Swift)",
  "Android (Kotlin)",
  "AWS",
  "Docker",
  "Kubernetes",
]

const LOCATIONS = ["Ho Chi Minh City", "Hanoi", "Da Nang", "Can Tho", "Hai Phong", "Other"]

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    search: "",
    industries: [],
    technologies: [],
    location: "",
    employeeCount: "",
    hourlyRateRange: [10, 100],
    minRating: 0,
    sortBy: "rating",
  })

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    onFiltersChange(updated)
  }

  const toggleArrayFilter = (key: "industries" | "technologies", value: string) => {
    const current = filters[key]
    const updated = current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    updateFilters({ [key]: updated })
  }

  const removeFilter = (key: "industries" | "technologies", value: string) => {
    const updated = filters[key].filter((item) => item !== value)
    updateFilters({ [key]: updated })
  }

  const clearAllFilters = () => {
    const cleared: SearchFilters = {
      search: "",
      industries: [],
      technologies: [],
      location: "",
      employeeCount: "",
      hourlyRateRange: [10, 100],
      minRating: 0,
      sortBy: "rating",
    }
    setFilters(cleared)
    onFiltersChange(cleared)
  }

  const hasActiveFilters = filters.industries.length > 0 || 
                          filters.technologies.length > 0 || 
                          filters.location !== "" || 
                          filters.employeeCount !== "" ||
                          filters.minRating > 0 ||
                          (filters.hourlyRateRange[0] !== 10 || filters.hourlyRateRange[1] !== 100)

  return (
    <div className="w-80 space-y-6">
      {/* Filter Status Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">Filters</h2>
          {hasActiveFilters && (
            <Badge variant="secondary" className="animate-pulse">
              {filters.industries.length + filters.technologies.length + 
               (filters.location ? 1 : 0) + (filters.employeeCount ? 1 : 0) + 
               (filters.minRating > 0 ? 1 : 0) + 
               (filters.hourlyRateRange[0] !== 10 || filters.hourlyRateRange[1] !== 100 ? 1 : 0)} active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            Clear All
          </Button>
        )}
      </div>
      {/* Search Input */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Companies
            {filters.search && (
              <Badge variant="outline" className="ml-auto">
                searching
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
              className="w-full pl-10 transition-colors focus:border-primary"
            />
            {filters.search && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateFilters({ search: "" })}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(filters.industries.length > 0 || filters.technologies.length > 0) && (
        <Card className="transition-all duration-200 border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Active Filters
              <Badge variant="secondary" className="ml-auto">
                {filters.industries.length + filters.technologies.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.industries.map((industry) => (
                <Badge 
                  key={industry} 
                  variant="secondary" 
                  className="flex items-center gap-1 hover:bg-secondary/80 transition-colors cursor-pointer group"
                  onClick={() => removeFilter("industries", industry)}
                >
                  {industry}
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
              {filters.technologies.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="outline" 
                  className="flex items-center gap-1 hover:bg-muted transition-colors cursor-pointer group"
                  onClick={() => removeFilter("technologies", tech)}
                >
                  {tech}
                  <X className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort By */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Sort By
            {filters.sortBy !== "rating" && (
              <Badge variant="outline" className="ml-auto">
                {filters.sortBy === "price-low" ? "price ↑" : 
                 filters.sortBy === "price-high" ? "price ↓" :
                 filters.sortBy === "reviews" ? "reviews" :
                 filters.sortBy === "newest" ? "newest" : "rating"}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
            <SelectTrigger className="transition-colors focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">⭐ Highest Rated</SelectItem>
              <SelectItem value="reviews">💬 Most Reviews</SelectItem>
              <SelectItem value="price-low">💰 Lowest Price</SelectItem>
              <SelectItem value="price-high">💎 Highest Price</SelectItem>
              <SelectItem value="newest">🆕 Newest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Industries */}
      <Card className={`transition-all duration-200 hover:shadow-md ${
        filters.industries.length > 0 ? 'border-primary/30 bg-primary/5' : ''
      }`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Industries
            {filters.industries.length > 0 && (
              <Badge variant="secondary" className="ml-auto animate-pulse">
                {filters.industries.length} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {INDUSTRIES.map((industry) => (
            <div key={industry} className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
              filters.industries.includes(industry) ? 'bg-primary/10' : 'hover:bg-muted/50'
            }`}>
              <Checkbox
                id={`industry-${industry}`}
                checked={filters.industries.includes(industry)}
                onCheckedChange={() => toggleArrayFilter("industries", industry)}
                className="transition-colors"
              />
              <Label 
                htmlFor={`industry-${industry}`} 
                className={`text-sm font-normal cursor-pointer flex-1 transition-colors ${
                  filters.industries.includes(industry) ? 'font-medium text-primary' : ''
                }`}
              >
                {industry}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card className={`transition-all duration-200 hover:shadow-md ${
        filters.technologies.length > 0 ? 'border-primary/30 bg-primary/5' : ''
      }`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Technologies
            {filters.technologies.length > 0 && (
              <Badge variant="secondary" className="ml-auto animate-pulse">
                {filters.technologies.length} selected
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
          {TECHNOLOGIES.map((tech) => (
            <div key={tech} className={`flex items-center space-x-2 p-2 rounded-md transition-colors ${
              filters.technologies.includes(tech) ? 'bg-primary/10' : 'hover:bg-muted/50'
            }`}>
              <Checkbox
                id={`tech-${tech}`}
                checked={filters.technologies.includes(tech)}
                onCheckedChange={() => toggleArrayFilter("technologies", tech)}
                className="transition-colors"
              />
              <Label 
                htmlFor={`tech-${tech}`} 
                className={`text-sm font-normal cursor-pointer flex-1 transition-colors ${
                  filters.technologies.includes(tech) ? 'font-medium text-primary' : ''
                }`}
              >
                {tech}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Location */}
      <Card className={`transition-all duration-200 hover:shadow-md ${
        filters.location ? 'border-primary/30 bg-primary/5' : ''
      }`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Location
            {filters.location && filters.location !== "all" && (
              <Badge variant="outline" className="ml-auto">
                {filters.location}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
            <SelectTrigger className="transition-colors focus:border-primary">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌍 All Locations</SelectItem>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  📍 {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Company Size */}
      <Card className={`transition-all duration-200 hover:shadow-md ${
        filters.employeeCount ? 'border-primary/30 bg-primary/5' : ''
      }`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Company Size
            {filters.employeeCount && filters.employeeCount !== "any" && (
              <Badge variant="outline" className="ml-auto">
                {filters.employeeCount} emp
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.employeeCount} onValueChange={(value) => updateFilters({ employeeCount: value })}>
            <SelectTrigger className="transition-colors focus:border-primary">
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">👥 Any Size</SelectItem>
              <SelectItem value="1-10">🏢 1-10 employees</SelectItem>
              <SelectItem value="11-50">🏭 11-50 employees</SelectItem>
              <SelectItem value="51-200">🏗️ 51-200 employees</SelectItem>
              <SelectItem value="201-500">🏛️ 201-500 employees</SelectItem>
              <SelectItem value="500+">🌆 500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Hourly Rate Range */}
      <Card className={`transition-all duration-200 hover:shadow-md ${
        (filters.hourlyRateRange[0] !== 10 || filters.hourlyRateRange[1] !== 100) ? 'border-primary/30 bg-primary/5' : ''
      }`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Hourly Rate (USD)
            {(filters.hourlyRateRange[0] !== 10 || filters.hourlyRateRange[1] !== 100) && (
              <Badge variant="outline" className="ml-auto">
                ${filters.hourlyRateRange[0]}-${filters.hourlyRateRange[1]}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-2">
            <Slider
              value={filters.hourlyRateRange}
              onValueChange={(value) => updateFilters({ hourlyRateRange: value as [number, number] })}
              max={150}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span className="px-2 py-1 bg-primary/10 rounded">${filters.hourlyRateRange[0]}</span>
            <span className="px-2 py-1 bg-primary/10 rounded">${filters.hourlyRateRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Rating */}
      <Card className={`transition-all duration-200 hover:shadow-md ${
        filters.minRating > 0 ? 'border-primary/30 bg-primary/5' : ''
      }`}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Minimum Rating
            {filters.minRating > 0 && (
              <Badge variant="outline" className="ml-auto">
                {filters.minRating}+ ⭐
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.minRating.toString()}
            onValueChange={(value) => updateFilters({ minRating: Number.parseInt(value) })}
          >
            <SelectTrigger className="transition-colors focus:border-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">⭐ Any Rating</SelectItem>
              <SelectItem value="3">⭐⭐⭐ 3+ Stars</SelectItem>
              <SelectItem value="4">⭐⭐⭐⭐ 4+ Stars</SelectItem>
              <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars Only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
