"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReviewSummary } from "@/components/reviews/review-summary"
import { ReviewList } from "@/components/reviews/review-list"
import { ReviewForm } from "@/components/reviews/review-form"
import type { ReviewData } from "@/components/reviews/review-form"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useAuth } from "@/lib/auth-context"
import { supabase, isSupabaseAvailable } from "@/lib/supabase"
import { Star, MessageCircle, Plus } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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

interface CompanyReviewsClientProps {
  companyId: string
}

// Mock reviews data for demonstration
const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    company_id: "1",
    reviewer_id: "reviewer1",
    rating: 5,
    title: "Excellent offshore development partner",
    content: "TechViet Solutions delivered exceptional results for our e-commerce platform. Their team demonstrated strong technical skills and excellent communication throughout the project. They completed the work ahead of schedule and provided valuable suggestions for optimization.",
    communication_rating: 5,
    quality_rating: 5,
    timeline_rating: 4,
    project_type: "Web Development",
    project_duration: "6 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    created_at: "2024-01-15T10:00:00Z",
    reviewer: {
      company_name: "Tokyo Digital Solutions",
      contact_person: "田中太郎",
      avatar_url: "/avatars/reviewer1.jpg"
    },
    helpful_count: 12
  },
  {
    id: "2",
    company_id: "1",
    reviewer_id: "reviewer2",
    rating: 4,
    title: "Great quality work, minor communication gaps",
    content: "The development team delivered high-quality code and met our requirements. There were occasional communication delays, but overall the project was successful. Would consider working with them again.",
    communication_rating: 3,
    quality_rating: 5,
    timeline_rating: 4,
    project_type: "Mobile App",
    project_duration: "4 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    created_at: "2024-01-10T14:30:00Z",
    reviewer: {
      company_name: "Osaka Tech Corp",
      contact_person: "佐藤花子"
    },
    helpful_count: 8
  },
  {
    id: "3",
    company_id: "1",
    reviewer_id: "reviewer3",
    rating: 5,
    title: "Outstanding partnership",
    content: "Professional, responsive, and delivered exactly what we needed. The team understood our requirements quickly and provided regular updates. Highly recommended for any Japanese company looking for reliable offshore development.",
    communication_rating: 5,
    quality_rating: 5,
    timeline_rating: 5,
    project_type: "Enterprise Software",
    project_duration: "8 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    created_at: "2024-01-05T09:15:00Z",
    reviewer: {
      company_name: "Kyoto Systems Inc",
      contact_person: "山田一郎"
    },
    helpful_count: 15
  }
]

export function CompanyReviewsClient({ companyId }: CompanyReviewsClientProps) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        if (isSupabaseAvailable() && supabase) {
          const { data, error } = await supabase
            .from('reviews')
            .select(`
              *,
              reviewer:users!reviews_reviewer_id_fkey(company_name, contact_person, avatar_url)
            `)
            .eq('company_id', companyId)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })

          if (error) throw error
          setReviews(data || [])
        } else {
          // Use mock data when Supabase is not available
          setReviews(MOCK_REVIEWS)
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        setReviews(MOCK_REVIEWS) // Fallback to mock data
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [companyId])

  // Calculate review statistics
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0
  
  const ratingDistribution = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const averageCommunication = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.communication_rating, 0) / totalReviews
    : 0

  const averageQuality = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.quality_rating, 0) / totalReviews
    : 0

  const averageTimeline = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.timeline_rating, 0) / totalReviews
    : 0

  const recommendationRate = totalReviews > 0
    ? Math.round((reviews.filter(r => r.would_recommend).length / totalReviews) * 100)
    : 0

  const handleHelpful = async (reviewId: string) => {
    if (isSupabaseAvailable() && supabase && user) {
      try {
        // Update helpful count in database
        await supabase.rpc('increment_helpful_count', { review_id: reviewId })
        
        // Update local state
        setReviews(prev => 
          prev.map(review => 
            review.id === reviewId 
              ? { ...review, helpful_count: (review.helpful_count || 0) + 1 }
              : review
          )
        )
      } catch (error) {
        console.error('Error updating helpful count:', error)
      }
    }
  }

  const handleReport = async (reviewId: string) => {
    // TODO: Implement review reporting functionality
    console.log('Report review:', reviewId)
  }

  const handleRespond = async (reviewId: string) => {
    // TODO: Implement review response functionality
    console.log('Respond to review:', reviewId)
  }

  const handleReviewSubmit = async (reviewData: ReviewData) => {
    try {
      if (isSupabaseAvailable() && supabase && user) {
        const { error } = await supabase
          .from('reviews')
          .insert({
            ...reviewData,
            company_id: companyId,
            reviewer_id: user.id,
            is_approved: false, // Reviews need approval
            created_at: new Date().toISOString()
          })
          .select()

        if (error) throw error
        
        // Don't add to local state until approved
        setIsWriteReviewOpen(false)
        // TODO: Show success message
      } else {
        // Mock success for demonstration
        setIsWriteReviewOpen(false)
        // TODO: Show success message
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      // TODO: Show error message
    }
  }

  const breadcrumbItems = [
    { label: "ホーム", href: "/" },
    { label: "企業検索", href: "/search" },
    { label: "企業詳細", href: `/company/${companyId}` },
    { label: "レビュー一覧", href: `/company/${companyId}/reviews` }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">レビュー一覧</h1>
            <p className="text-muted-foreground">
              {totalReviews > 0 ? `${totalReviews}件のレビュー` : "まだレビューがありません"}
            </p>
          </div>
          
          {user && (
            <Dialog open={isWriteReviewOpen} onOpenChange={setIsWriteReviewOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  レビューを書く
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>レビューを投稿</DialogTitle>
                  <DialogDescription>
                    この企業との協業体験についてレビューを投稿してください
                  </DialogDescription>
                </DialogHeader>
                <ReviewForm
                  companyId={companyId}
                  companyName="TechViet Solutions" // TODO: Get actual company name
                  onSubmit={handleReviewSubmit}
                  onCancel={() => setIsWriteReviewOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Review Summary */}
          <div className="lg:col-span-1">
            <ReviewSummary
              totalReviews={totalReviews}
              averageRating={averageRating}
              ratingDistribution={ratingDistribution}
              averageCommunication={averageCommunication}
              averageQuality={averageQuality}
              averageTimeline={averageTimeline}
              recommendationRate={recommendationRate}
            />
          </div>

          {/* Review List */}
          <div className="lg:col-span-2">
            {totalReviews > 0 ? (
              <ReviewList
                reviews={reviews}
                canRespond={false} // TODO: Check if current user can respond (company owner)
                onHelpful={handleHelpful}
                onReport={handleReport}
                onRespond={handleRespond}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">レビューがありません</h3>
                  <p className="text-muted-foreground mb-4">
                    まだこの企業にレビューが投稿されていません。
                  </p>
                  {user && (
                    <Button onClick={() => setIsWriteReviewOpen(true)}>
                      <Star className="h-4 w-4 mr-2" />
                      最初のレビューを書く
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}