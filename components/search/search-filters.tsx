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
import { X } from "lucide-react"

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

  return (
    <div className="w-80 space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search Companies</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by company name..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Active Filters */}
      {(filters.industries.length > 0 || filters.technologies.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Filters</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {filters.industries.map((industry) => (
                <Badge key={industry} variant="secondary" className="flex items-center gap-1">
                  {industry}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("industries", industry)} />
                </Badge>
              ))}
              {filters.technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="flex items-center gap-1">
                  {tech}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter("technologies", tech)} />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sort By */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="reviews">Most Reviews</SelectItem>
              <SelectItem value="price-low">Lowest Price</SelectItem>
              <SelectItem value="price-high">Highest Price</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Industries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Industries</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {INDUSTRIES.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`industry-${industry}`}
                checked={filters.industries.includes(industry)}
                onCheckedChange={() => toggleArrayFilter("industries", industry)}
              />
              <Label htmlFor={`industry-${industry}`} className="text-sm font-normal">
                {industry}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Technologies */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Technologies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-64 overflow-y-auto">
          {TECHNOLOGIES.map((tech) => (
            <div key={tech} className="flex items-center space-x-2">
              <Checkbox
                id={`tech-${tech}`}
                checked={filters.technologies.includes(tech)}
                onCheckedChange={() => toggleArrayFilter("technologies", tech)}
              />
              <Label htmlFor={`tech-${tech}`} className="text-sm font-normal">
                {tech}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Location</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.location} onValueChange={(value) => updateFilters({ location: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Company Size */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Company Size</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={filters.employeeCount} onValueChange={(value) => updateFilters({ employeeCount: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any Size</SelectItem>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-500">201-500 employees</SelectItem>
              <SelectItem value="500+">500+ employees</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Hourly Rate Range */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Hourly Rate (USD)</CardTitle>
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
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>${filters.hourlyRateRange[0]}</span>
            <span>${filters.hourlyRateRange[1]}</span>
          </div>
        </CardContent>
      </Card>

      {/* Minimum Rating */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Minimum Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={filters.minRating.toString()}
            onValueChange={(value) => updateFilters({ minRating: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any Rating</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="5">5 Stars Only</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>
    </div>
  )
}
