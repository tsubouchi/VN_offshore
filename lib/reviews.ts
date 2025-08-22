import { supabase, isSupabaseAvailable } from './supabase'

export interface Review {
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
  helpful_count: number
  created_at: string
  updated_at: string
  reviewer?: {
    id: string
    company_name: string
    contact_person: string
    avatar_url?: string
  }
  response?: {
    id: string
    content: string
    created_at: string
    responder?: {
      company_name: string
    }
  }
}

export interface ReviewSubmitData {
  company_id: string
  rating: number
  title: string
  content: string
  communication_rating: number
  quality_rating: number
  timeline_rating: number
  project_type?: string
  project_duration?: string
  would_recommend: boolean
}

export interface ReviewSummary {
  totalReviews: number
  averageRating: number
  ratingDistribution: Record<number, number>
  averageCommunication: number
  averageQuality: number
  averageTimeline: number
  recommendationRate: number
}

// Mock data for when Supabase is not available
const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    company_id: "1",
    reviewer_id: "00000000-0000-0000-0000-000000000001",
    rating: 5,
    title: "Excellent work on our e-commerce platform",
    content: "TechViet Solutions delivered exceptional results for our e-commerce project. Their team was professional, responsive, and delivered high-quality code on time.",
    communication_rating: 5,
    quality_rating: 5,
    timeline_rating: 4,
    project_type: "E-commerce Platform",
    project_duration: "6 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    helpful_count: 8,
    created_at: "2024-01-10T00:00:00Z",
    updated_at: "2024-01-10T00:00:00Z",
    reviewer: {
      id: "00000000-0000-0000-0000-000000000001",
      company_name: "Tokyo Tech Solutions",
      contact_person: "Tanaka Hiroshi",
      avatar_url: "/japanese-tech-logo.png",
    },
    response: {
      id: "1",
      content: "Thank you so much for your kind words! It was a pleasure working with your team.",
      created_at: "2024-01-12T00:00:00Z",
      responder: {
        company_name: "TechViet Solutions"
      }
    }
  },
  {
    id: "2",
    company_id: "1",
    reviewer_id: "buyer2",
    rating: 4,
    title: "Good experience with mobile app development",
    content: "We hired TechViet Solutions for our mobile app project and overall had a positive experience.",
    communication_rating: 4,
    quality_rating: 4,
    timeline_rating: 3,
    project_type: "Mobile Application",
    project_duration: "4 months",
    would_recommend: true,
    is_verified: true,
    is_approved: true,
    helpful_count: 5,
    created_at: "2024-01-05T00:00:00Z",
    updated_at: "2024-01-05T00:00:00Z",
    reviewer: {
      id: "buyer2",
      company_name: "Osaka Digital Corp",
      contact_person: "Sato Yuki",
      avatar_url: "/digital-corporation-logo.png",
    }
  }
]

export async function getCompanyReviews(companyId: string): Promise<Review[]> {
  if (!isSupabaseAvailable() || !supabase) {
    // Return mock data for demo
    return MOCK_REVIEWS.filter(r => r.company_id === companyId)
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          company_name,
          contact_person,
          avatar_url
        ),
        response:review_responses (
          id,
          content,
          created_at,
          responder:responder_id (
            company_name
          )
        )
      `)
      .eq('company_id', companyId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return MOCK_REVIEWS.filter(r => r.company_id === companyId)
  }
}

export async function getReviewSummary(companyId: string): Promise<ReviewSummary> {
  const reviews = await getCompanyReviews(companyId)
  
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      averageCommunication: 0,
      averageQuality: 0,
      averageTimeline: 0,
      recommendationRate: 0
    }
  }

  const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let totalRating = 0
  let totalCommunication = 0
  let totalQuality = 0
  let totalTimeline = 0
  let recommendCount = 0

  reviews.forEach(review => {
    ratingDistribution[review.rating] = (ratingDistribution[review.rating] || 0) + 1
    totalRating += review.rating
    totalCommunication += review.communication_rating
    totalQuality += review.quality_rating
    totalTimeline += review.timeline_rating
    if (review.would_recommend) recommendCount++
  })

  return {
    totalReviews: reviews.length,
    averageRating: totalRating / reviews.length,
    ratingDistribution,
    averageCommunication: totalCommunication / reviews.length,
    averageQuality: totalQuality / reviews.length,
    averageTimeline: totalTimeline / reviews.length,
    recommendationRate: Math.round((recommendCount / reviews.length) * 100)
  }
}

export async function submitReview(reviewData: ReviewSubmitData, userId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAvailable() || !supabase) {
    // Mock success for demo
    console.log('Mock review submitted:', reviewData)
    return { success: true }
  }

  try {
    const { error } = await supabase
      .from('reviews')
      .insert({
        ...reviewData,
        reviewer_id: userId,
        is_verified: false,
        is_approved: true // Auto-approve for now, can add moderation later
      })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error submitting review:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to submit review' 
    }
  }
}

export async function markReviewHelpful(reviewId: string, userId: string): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) {
    console.log('Mock marking review helpful:', reviewId)
    return true
  }

  try {
    // Check if already voted
    const { data: existing } = await supabase
      .from('review_helpful_votes')
      .select('id')
      .eq('review_id', reviewId)
      .eq('user_id', userId)
      .single()

    if (existing) {
      // Remove vote if already voted
      const { error } = await supabase
        .from('review_helpful_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', userId)
      
      if (error) throw error
      return false // Removed vote
    } else {
      // Add vote
      const { error } = await supabase
        .from('review_helpful_votes')
        .insert({
          review_id: reviewId,
          user_id: userId
        })
      
      if (error) throw error
      return true // Added vote
    }
  } catch (error) {
    console.error('Error marking review helpful:', error)
    return false
  }
}

export async function reportReview(reviewId: string, userId: string, reason: string): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) {
    console.log('Mock reporting review:', reviewId, reason)
    return true
  }

  try {
    // In a real app, you'd have a review_reports table
    // For now, we'll just log it
    console.log('Review reported:', { reviewId, userId, reason })
    
    // You could send a notification to admins here
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        type: 'review_report',
        title: 'Review Reported',
        message: `Review ${reviewId} has been reported for: ${reason}`,
        data: { reviewId, reason }
      })

    if (error) console.error('Error creating notification:', error)
    return true
  } catch (error) {
    console.error('Error reporting review:', error)
    return false
  }
}

export async function respondToReview(
  reviewId: string, 
  responderId: string, 
  content: string
): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) {
    console.log('Mock responding to review:', reviewId, content)
    return true
  }

  try {
    const { error } = await supabase
      .from('review_responses')
      .insert({
        review_id: reviewId,
        responder_id: responderId,
        content
      })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error responding to review:', error)
    return false
  }
}

export async function canUserReview(userId: string, companyId: string): Promise<boolean> {
  if (!isSupabaseAvailable() || !supabase) {
    // In demo mode, allow review
    return true
  }

  try {
    // Check if user has already reviewed this company
    const { data: existingReview } = await supabase
      .from('reviews')
      .select('id')
      .eq('reviewer_id', userId)
      .eq('company_id', companyId)
      .single()

    if (existingReview) return false

    // Check if user is not the company owner
    const { data: company } = await supabase
      .from('companies')
      .select('user_id')
      .eq('id', companyId)
      .single()

    if (company?.user_id === userId) return false

    // In a real app, you might also check if the user has actually worked with the company
    // For now, we'll allow any authenticated buyer to review
    return true
  } catch (error) {
    console.error('Error checking review permission:', error)
    return false
  }
}

export async function getUserHelpfulVotes(userId: string): Promise<string[]> {
  if (!isSupabaseAvailable() || !supabase) {
    return []
  }

  try {
    const { data, error } = await supabase
      .from('review_helpful_votes')
      .select('review_id')
      .eq('user_id', userId)

    if (error) throw error
    return data?.map(vote => vote.review_id) || []
  } catch (error) {
    console.error('Error fetching user helpful votes:', error)
    return []
  }
}