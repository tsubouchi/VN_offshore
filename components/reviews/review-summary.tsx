"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, TrendingUp, Users, Award } from "lucide-react"

interface ReviewSummaryProps {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<number, number>
  averageCommunication: number
  averageQuality: number
  averageTimeline: number
  recommendationRate: number
}

export function ReviewSummary({
  totalReviews,
  averageRating,
  ratingDistribution,
  averageCommunication,
  averageQuality,
  averageTimeline,
  recommendationRate,
}: ReviewSummaryProps) {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  const getRatingPercentage = (rating: number) => {
    return totalReviews > 0 ? ((ratingDistribution[rating] || 0) / totalReviews) * 100 : 0
  }

  return (
    <div className="space-y-6">
      {/* Overall Rating */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {renderStars(averageRating)}
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              </div>
              <p className="text-muted-foreground">Based on {totalReviews} reviews</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{recommendationRate}%</div>
              <p className="text-sm text-muted-foreground">Recommend</p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm">{rating}</span>
                  <Star className="h-3 w-3 fill-accent text-accent" />
                </div>
                <Progress value={getRatingPercentage(rating)} className="flex-1 h-2" />
                <span className="text-sm text-muted-foreground w-12 text-right">{ratingDistribution[rating] || 0}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Ratings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Rating Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Communication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">{renderStars(averageCommunication)}</div>
              <span className="text-sm font-medium">{averageCommunication.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Work Quality</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">{renderStars(averageQuality)}</div>
              <span className="text-sm font-medium">{averageQuality.toFixed(1)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Timeline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">{renderStars(averageTimeline)}</div>
              <span className="text-sm font-medium">{averageTimeline.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
