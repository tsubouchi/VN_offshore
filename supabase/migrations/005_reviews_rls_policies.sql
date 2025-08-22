-- Enable Row Level Security for enhanced reviews tables

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_helpful_votes ENABLE ROW LEVEL SECURITY;

-- Reviews policies
-- Allow public read access to approved reviews
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
CREATE POLICY "reviews_public_read" ON reviews
  FOR SELECT
  TO PUBLIC
  USING (is_approved = true);

-- Allow authenticated users to create reviews
DROP POLICY IF EXISTS "reviews_authenticated_create" ON reviews;
CREATE POLICY "reviews_authenticated_create" ON reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id AND
    -- Ensure user is a buyer (not vendor of the company being reviewed)
    NOT EXISTS (
      SELECT 1 FROM companies 
      WHERE id = company_id AND user_id = auth.uid()
    )
  );

-- Allow review authors to update their own reviews (within limits)
DROP POLICY IF EXISTS "reviews_author_update" ON reviews;
CREATE POLICY "reviews_author_update" ON reviews
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (
    auth.uid() = reviewer_id
    -- Note: To prevent changing certain fields, you would need to use triggers
    -- RLS policies cannot reference OLD values
  );

-- Allow admins to manage all reviews
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Review responses policies
-- Allow public read access to responses
DROP POLICY IF EXISTS "review_responses_public_read" ON review_responses;
CREATE POLICY "review_responses_public_read" ON review_responses
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Allow company owners to respond to reviews on their company
DROP POLICY IF EXISTS "review_responses_company_create" ON review_responses;
CREATE POLICY "review_responses_company_create" ON review_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = responder_id AND
    EXISTS (
      SELECT 1 FROM reviews r
      JOIN companies c ON r.company_id = c.id
      WHERE r.id = review_id AND c.user_id = auth.uid()
    )
  );

-- Allow response authors to update their own responses
DROP POLICY IF EXISTS "review_responses_author_update" ON review_responses;
CREATE POLICY "review_responses_author_update" ON review_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = responder_id)
  WITH CHECK (auth.uid() = responder_id);

-- Allow admins to manage all responses
DROP POLICY IF EXISTS "review_responses_admin_all" ON review_responses;
CREATE POLICY "review_responses_admin_all" ON review_responses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Review helpful votes policies
-- Allow public read access to helpful votes
DROP POLICY IF EXISTS "review_helpful_votes_public_read" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_public_read" ON review_helpful_votes
  FOR SELECT
  TO PUBLIC
  USING (true);

-- Allow authenticated users to vote on reviews
DROP POLICY IF EXISTS "review_helpful_votes_authenticated_create" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_authenticated_create" ON review_helpful_votes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    -- Don't allow users to vote on their own reviews
    NOT EXISTS (
      SELECT 1 FROM reviews 
      WHERE id = review_id AND reviewer_id = auth.uid()
    )
  );

-- Allow users to remove their own votes
DROP POLICY IF EXISTS "review_helpful_votes_user_delete" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_user_delete" ON review_helpful_votes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow admins to manage all helpful votes
DROP POLICY IF EXISTS "review_helpful_votes_admin_all" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_admin_all" ON review_helpful_votes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );