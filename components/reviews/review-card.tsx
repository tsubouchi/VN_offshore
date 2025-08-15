"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, Flag, MessageCircle, CheckCircle, Shield } from "lucide-react"

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

interface ReviewCardProps {
  review: Review
  canRespond?: boolean
  onHelpful?: (reviewId: string) => void
  onReport?: (reviewId: string) => void
  onRespond?: (reviewId: string) => void
}

export function ReviewCard({ review, canRespond, onHelpful, onReport, onRespond }: ReviewCardProps) {
  const [showFullContent, setShowFullContent] = useState(false)
  const [isHelpful, setIsHelpful] = useState(false)

  const renderStars = (rating: number, size: "sm" | "md" = "sm") => {
    const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5"
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${starSize} ${i < Math.floor(rating) ? "fill-accent text-accent" : "text-muted-foreground"}`}
      />
    ))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleHelpful = () => {
    setIsHelpful(!isHelpful)
    onHelpful?.(review.id)
  }

  const contentPreview = review.content.length > 300 ? review.content.substring(0, 300) + "..." : review.content

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={review.reviewer?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback>{review.reviewer?.company_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">{review.reviewer?.company_name}</h4>
                {review.is_verified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{review.reviewer?.contact_person}</p>
              <p className="text-xs text-muted-foreground">{formatDate(review.created_at)}</p>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 mb-1">
              {renderStars(review.rating, "md")}
              <span className="ml-2 font-semibold text-lg">{review.rating.toFixed(1)}</span>
            </div>
            {review.would_recommend && (
              <Badge variant="outline" className="text-xs">
                Recommends
              </Badge>
            )}
          </div>
        </div>

        {/* Review Title */}
        <h3 className="text-lg font-semibold mb-3">{review.title}</h3>

        {/* Detailed Ratings */}
        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Communication</div>
            <div className="flex justify-center gap-1 mb-1">{renderStars(review.communication_rating)}</div>
            <div className="text-sm font-medium">{review.communication_rating}/5</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Quality</div>
            <div className="flex justify-center gap-1 mb-1">{renderStars(review.quality_rating)}</div>
            <div className="text-sm font-medium">{review.quality_rating}/5</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Timeline</div>
            <div className="flex justify-center gap-1 mb-1">{renderStars(review.timeline_rating)}</div>
            <div className="text-sm font-medium">{review.timeline_rating}/5</div>
          </div>
        </div>

        {/* Project Details */}
        {(review.project_type || review.project_duration) && (
          <div className="flex gap-4 mb-4">
            {review.project_type && (
              <div>
                <span className="text-sm text-muted-foreground">Project Type: </span>
                <span className="text-sm font-medium">{review.project_type}</span>
              </div>
            )}
            {review.project_duration && (
              <div>
                <span className="text-sm text-muted-foreground">Duration: </span>
                <span className="text-sm font-medium">{review.project_duration}</span>
              </div>
            )}
          </div>
        )}

        {/* Review Content */}
        <div className="mb-4">
          <p className="text-muted-foreground leading-relaxed">{showFullContent ? review.content : contentPreview}</p>
          {review.content.length > 300 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowFullContent(!showFullContent)}
              className="p-0 h-auto mt-2"
            >
              {showFullContent ? "Show less" : "Read more"}
            </Button>
          )}
        </div>

        {/* Company Response */}
        {review.response && (
          <div className="bg-primary/5 border-l-4 border-primary p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Response from Company</span>
              <span className="text-xs text-muted-foreground">{formatDate(review.response.created_at)}</span>
            </div>
            <p className="text-sm text-muted-foreground">{review.response.content}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleHelpful} className={isHelpful ? "text-primary" : ""}>
              <ThumbsUp className={`h-4 w-4 mr-2 ${isHelpful ? "fill-current" : ""}`} />
              Helpful ({(review.helpful_count || 0) + (isHelpful ? 1 : 0)})
            </Button>

            <Button variant="ghost" size="sm" onClick={() => onReport?.(review.id)}>
              <Flag className="h-4 w-4 mr-2" />
              Report
            </Button>
          </div>

          {canRespond && !review.response && (
            <Button variant="outline" size="sm" onClick={() => onRespond?.(review.id)}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Respond
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
