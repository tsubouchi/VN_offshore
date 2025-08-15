"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ReviewSummary } from "@/components/reviews/review-summary"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewForm } from "@/components/reviews/review-form"
import { Plus } from "lucide-react"

// Mock data for demonstration
const mockReviews = [
  {
    id: "1",
    company_id: "1",
    reviewer_id: "buyer1",
    rating: 5,
    title: "Excellent work on our e-commerce platform",
    content:
      "TechViet Solutions delivered exceptional results for our e-commerce project. Their team was professional, responsive, and delivered high-quality code on time. The communication was excellent throughout the project, and they provided valuable insights that improved our final product. I would definitely work with them again and highly recommend them to other Japanese companies looking for reliable offshore development partners.",
    communication_rating: 5,
    quality_rating: 5,
    timeline_rating: 4,
    project_type: "E-commerce Platform",
    project_duration: "6 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    created_at: "2024-01-10T00:00:00Z",
    reviewer: {
      company_name: "Tokyo Tech Solutions",
      contact_person: "Tanaka Hiroshi",
      avatar_url: "/japanese-tech-logo.png",
    },
    helpful_count: 8,
    response: {
      content:
        "Thank you so much for your kind words! It was a pleasure working with your team. We're glad we could deliver a solution that met your expectations and look forward to future collaborations.",
      created_at: "2024-01-12T00:00:00Z",
    },
  },
  {
    id: "2",
    company_id: "1",
    reviewer_id: "buyer2",
    rating: 4,
    title: "Good experience with mobile app development",
    content:
      "We hired TechViet Solutions for our mobile app project and overall had a positive experience. The development team was skilled and delivered a functional app that met most of our requirements. There were some minor delays in the timeline, but they communicated well and kept us updated throughout the process. The final product quality was good, though there were a few bugs that needed to be fixed post-launch.",
    communication_rating: 4,
    quality_rating: 4,
    timeline_rating: 3,
    project_type: "Mobile Application",
    project_duration: "4 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    created_at: "2024-01-05T00:00:00Z",
    reviewer: {
      company_name: "Osaka Digital Corp",
      contact_person: "Sato Yuki",
      avatar_url: "/digital-corporation-logo.png",
    },
    helpful_count: 5,
  },
  {
    id: "3",
    company_id: "1",
    reviewer_id: "buyer3",
    rating: 5,
    title: "Outstanding partnership for fintech project",
    content:
      "Working with TechViet Solutions on our fintech application was an outstanding experience. Their expertise in financial technology and security best practices was evident throughout the project. They delivered clean, well-documented code and provided excellent support during the deployment phase. The team's understanding of Japanese business culture made communication smooth and effective.",
    communication_rating: 5,
    quality_rating: 5,
    timeline_rating: 5,
    project_type: "Fintech Application",
    project_duration: "8 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    created_at: "2023-12-20T00:00:00Z",
    reviewer: {
      company_name: "Kyoto Innovations",
      contact_person: "Yamamoto Kenji",
      avatar_url: "/innovation-company-logo.png",
    },
    helpful_count: 12,
  },
]

const mockSummary = {
  totalReviews: 24,
  averageRating: 4.8,
  ratingDistribution: { 5: 18, 4: 4, 3: 1, 2: 1, 1: 0 },
  averageCommunication: 4.7,
  averageQuality: 4.8,
  averageTimeline: 4.6,
  recommendationRate: 96,
}

export default function CompanyReviewsPage({ params }: { params: { id: string } }) {
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState(mockReviews)

  // TODO: Get from authenticated user
  const canWriteReview = true // User is a buyer and has worked with this company
  const canRespond = false // User is the company owner

  const handleSubmitReview = async (reviewData: any) => {
    // TODO: Submit review to database
    console.log("Submitting review:", reviewData)
    setShowReviewForm(false)
    // Add to reviews list (in real app, refetch from server)
  }

  const handleHelpful = (reviewId: string) => {
    // TODO: Mark review as helpful
    console.log("Marking review as helpful:", reviewId)
  }

  const handleReport = (reviewId: string) => {
    // TODO: Report review
    console.log("Reporting review:", reviewId)
  }

  const handleRespond = (reviewId: string) => {
    // TODO: Open response form
    console.log("Responding to review:", reviewId)
  }

  if (showReviewForm) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <ReviewForm
            companyId={params.id}
            companyName="TechViet Solutions"
            onSubmit={handleSubmitReview}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reviews for TechViet Solutions</h1>
            <p className="text-muted-foreground">
              Read what Japanese companies say about working with this Vietnamese development team
            </p>
          </div>
          {canWriteReview && (
            <Button onClick={() => setShowReviewForm(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Write Review
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review Summary */}
          <div className="lg:col-span-1">
            <ReviewSummary {...mockSummary} />
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            <ReviewList
              reviews={reviews}
              canRespond={canRespond}
              onHelpful={handleHelpful}
              onReport={handleReport}
              onRespond={handleRespond}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
