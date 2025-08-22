-- Enhance reviews table to match UI components
-- Add comprehensive review fields for better user experience

-- Drop existing reviews table and recreate with enhanced schema
DROP TABLE IF EXISTS reviews CASCADE;

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Overall rating and review details
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Detailed ratings
  communication_rating INTEGER NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  quality_rating INTEGER NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  timeline_rating INTEGER NOT NULL CHECK (timeline_rating >= 1 AND timeline_rating <= 5),
  
  -- Project information
  project_type TEXT,
  project_duration TEXT,
  would_recommend BOOLEAN NOT NULL DEFAULT false,
  
  -- Verification and moderation
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  
  -- Engagement metrics
  helpful_count INTEGER NOT NULL DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one review per user per company
  UNIQUE(company_id, reviewer_id)
);

-- Create review responses table for company responses
CREATE TABLE review_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one response per review
  UNIQUE(review_id)
);

-- Create helpful votes table for review helpfulness
CREATE TABLE review_helpful_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure one vote per user per review
  UNIQUE(review_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at);
CREATE INDEX idx_reviews_is_approved ON reviews(is_approved);

CREATE INDEX idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX idx_review_helpful_votes_review_id ON review_helpful_votes(review_id);

-- Update timestamps trigger for reviews
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_reviews_updated_at ON reviews;
CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_review_responses_updated_at ON review_responses;
CREATE TRIGGER update_review_responses_updated_at 
  BEFORE UPDATE ON review_responses
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to update helpful_count on reviews
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count + 1 
    WHERE id = NEW.review_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE reviews 
    SET helpful_count = helpful_count - 1 
    WHERE id = OLD.review_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update helpful_count
DROP TRIGGER IF EXISTS update_helpful_count_trigger ON review_helpful_votes;
CREATE TRIGGER update_helpful_count_trigger
  AFTER INSERT OR DELETE ON review_helpful_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_review_helpful_count();

-- Function to update company average rating
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE companies 
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews 
        WHERE company_id = NEW.company_id AND is_approved = true
      ),
      total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE company_id = NEW.company_id AND is_approved = true
      )
    WHERE id = NEW.company_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies 
    SET 
      average_rating = (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews 
        WHERE company_id = OLD.company_id AND is_approved = true
      ),
      total_reviews = (
        SELECT COUNT(*) 
        FROM reviews 
        WHERE company_id = OLD.company_id AND is_approved = true
      )
    WHERE id = OLD.company_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger to automatically update company ratings
DROP TRIGGER IF EXISTS update_company_rating_trigger ON reviews;
CREATE TRIGGER update_company_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_company_rating();