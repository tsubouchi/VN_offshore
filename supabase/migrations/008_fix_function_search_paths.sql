-- Fix function search path security warnings
-- This addresses the function_search_path_mutable lint warnings

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix update_review_helpful_count function
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;

-- Fix update_company_rating function
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
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
$$;