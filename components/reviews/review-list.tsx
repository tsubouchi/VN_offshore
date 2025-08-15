"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ReviewCard } from "./review-card"
import { Filter, SortAsc } from "lucide-react"

interface Review {
  id: string
  company_id: string
  reviewer_id: string
  rating: number
  title: string
  content: string
  communication_rating: number
  quality_rating: number
  timeline_rating: number
  project_type?: string
  project_duration?: string
  would_recommend: boolean
  is_verified: boolean
  is_approved: boolean
  created_at: string
  reviewer?: {
    company_name: string
    contact_person: string
    avatar_url?: string
  }
  helpful_count?: number
  response?: {
    content: string
    created_at: string
  }
}

interface ReviewListProps {
  reviews: Review[]
  canRespond?: boolean
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  onRespond?: (reviewId: string) => void
}

export function ReviewList({ reviews, canRespond, onHelpful, onReport, onRespond }: ReviewListProps) {
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "highest" | "lowest" | "helpful">("newest")
  const [filterBy, setFilterBy] = useState<"all" | "5" | "4" | "3" | "2" | "1" | "verified">("all")

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (filterBy === "all") return true
      if (filterBy === "verified") return review.is_verified
      return review.rating === Number.parseInt(filterBy)
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "highest":
          return b.rating - a.rating
        case "lowest":
          return a.rating - b.rating
        case "helpful":
          return (b.helpful_count || 0) - (a.helpful_count || 0)
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reviews</SelectItem>
                <SelectItem value="verified">Verified Only</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-muted-foreground" />
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
                <SelectItem value="helpful">Most Helpful</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedReviews.length} of {reviews.length} reviews
        </div>
      </div>

      {/* Reviews */}
      <div className="space-y-6">
        {filteredAndSortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canRespond={canRespond}
            onHelpful={onHelpful}
            onReport={onReport}
            onRespond={onRespond}
          />
        ))}

        {filteredAndSortedReviews.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">
              <h3 className="text-lg font-medium mb-2">No reviews found</h3>
              <p>No reviews match your current filters.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
