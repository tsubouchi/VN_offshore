"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star } from "lucide-react"

interface ReviewFormProps {
  companyId: string
  companyName: string
  onSubmit: (review: ReviewData) => void
  onCancel: () => void
}

export interface ReviewData {
  company_id: string
  rating: number
  title: string
  content: string
  communication_rating: number
  quality_rating: number
  timeline_rating: number
  project_type: string
  project_duration: string
  would_recommend: boolean
}

export function ReviewForm({ companyId, companyName, onSubmit, onCancel }: ReviewFormProps) {
  const [reviewData, setReviewData] = useState<ReviewData>({
    company_id: companyId,
    rating: 0,
    title: "",
    content: "",
    communication_rating: 0,
    quality_rating: 0,
    timeline_rating: 0,
    project_type: "",
    project_duration: "",
    would_recommend: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (field: keyof ReviewData, rating: number) => {
    setReviewData((prev) => ({ ...prev, [field]: rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (reviewData.rating === 0 || !reviewData.title || !reviewData.content) {
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit(reviewData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = (field: keyof ReviewData, label: string, value: number, description?: string) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm text-muted-foreground">{value}/5</span>
      </div>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      <div className="flex gap-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleRatingChange(field, i + 1)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star
              className={`h-6 w-6 ${i < value ? "fill-accent text-accent" : "text-muted-foreground hover:text-accent"}`}
            />
          </button>
        ))}
      </div>
    </div>
  )

  const isFormValid = reviewData.rating > 0 && reviewData.title.trim() && reviewData.content.trim()

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Write a Review for {companyName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your experience working with this company to help other businesses make informed decisions.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-lg font-semibold">Overall Rating</Label>
              <p className="text-sm text-muted-foreground mb-4">How would you rate your overall experience?</p>
              <div className="flex justify-center gap-2 mb-2">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingChange("rating", i + 1)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        i < reviewData.rating ? "fill-accent text-accent" : "text-muted-foreground hover:text-accent"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {reviewData.rating === 0 && "Click to rate"}
                {reviewData.rating === 1 && "Poor"}
                {reviewData.rating === 2 && "Fair"}
                {reviewData.rating === 3 && "Good"}
                {reviewData.rating === 4 && "Very Good"}
                {reviewData.rating === 5 && "Excellent"}
              </p>
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="grid md:grid-cols-3 gap-6">
            {renderStarRating(
              "communication_rating",
              "Communication",
              reviewData.communication_rating,
              "Responsiveness and clarity",
            )}
            {renderStarRating(
              "quality_rating",
              "Work Quality",
              reviewData.quality_rating,
              "Code quality and deliverables",
            )}
            {renderStarRating(
              "timeline_rating",
              "Timeline",
              reviewData.timeline_rating,
              "Meeting deadlines and schedules",
            )}
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Review Title</Label>
            <Input
              id="title"
              value={reviewData.title}
              onChange={(e) => setReviewData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Summarize your experience in one line"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">{reviewData.title.length}/100 characters</p>
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Detailed Review</Label>
            <Textarea
              id="content"
              value={reviewData.content}
              onChange={(e) => setReviewData((prev) => ({ ...prev, content: e.target.value }))}
              placeholder="Share details about your project, what went well, and areas for improvement..."
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{reviewData.content.length}/1000 characters</p>
          </div>

          {/* Project Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project_type">Project Type</Label>
              <Input
                id="project_type"
                value={reviewData.project_type}
                onChange={(e) => setReviewData((prev) => ({ ...prev, project_type: e.target.value }))}
                placeholder="e.g., Web Development, Mobile App"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_duration">Project Duration</Label>
              <Input
                id="project_duration"
                value={reviewData.project_duration}
                onChange={(e) => setReviewData((prev) => ({ ...prev, project_duration: e.target.value }))}
                placeholder="e.g., 3 months, 6 weeks"
              />
            </div>
          </div>

          {/* Recommendation */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="would_recommend"
              checked={reviewData.would_recommend}
              onChange={(e) => setReviewData((prev) => ({ ...prev, would_recommend: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <Label htmlFor="would_recommend" className="text-sm">
              I would recommend this company to other businesses
            </Label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={!isFormValid || isSubmitting} className="flex-1">
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 bg-transparent">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
