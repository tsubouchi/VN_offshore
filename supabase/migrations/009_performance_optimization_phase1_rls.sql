-- =====================================================
-- Phase 1: RLS初期化計画の最適化
-- パフォーマンス改善のためauth.uid()を(SELECT auth.uid())に変更
-- =====================================================

-- 1. user_favorites テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Users can view own favorites" ON user_favorites;
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert own favorites" ON user_favorites;
CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can delete own favorites" ON user_favorites;
CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING ((SELECT auth.uid()) = user_id);

-- 2. contact_history テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Users can view own contact history" ON contact_history;
CREATE POLICY "Users can view own contact history" ON contact_history
  FOR SELECT USING ((SELECT auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Users can insert own contact history" ON contact_history;
CREATE POLICY "Users can insert own contact history" ON contact_history
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = buyer_id);

DROP POLICY IF EXISTS "Vendors can view contacts for their companies" ON contact_history;
CREATE POLICY "Vendors can view contacts for their companies" ON contact_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = contact_history.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "Vendors can update contact status for their companies" ON contact_history;
CREATE POLICY "Vendors can update contact status for their companies" ON contact_history
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = contact_history.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- 3. notification_settings テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Users can manage own notification settings" ON notification_settings;
CREATE POLICY "Users can manage own notification settings" ON notification_settings
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- 4. company_files テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "Company owners can manage their files" ON company_files;
CREATE POLICY "Company owners can manage their files" ON company_files
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_files.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- 5. reviews テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "reviews_authenticated_create" ON reviews;
CREATE POLICY "reviews_authenticated_create" ON reviews
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = reviewer_id AND
    NOT EXISTS (
      SELECT 1 FROM companies
      WHERE id = company_id AND user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "reviews_author_update" ON reviews;
CREATE POLICY "reviews_author_update" ON reviews
  FOR UPDATE
  USING ((SELECT auth.uid()) = reviewer_id)
  WITH CHECK ((SELECT auth.uid()) = reviewer_id);

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 6. review_responses テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "review_responses_company_create" ON review_responses;
CREATE POLICY "review_responses_company_create" ON review_responses
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = responder_id AND
    EXISTS (
      SELECT 1 FROM reviews r
      JOIN companies c ON c.id = r.company_id
      WHERE r.id = review_id AND c.user_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "review_responses_author_update" ON review_responses;
CREATE POLICY "review_responses_author_update" ON review_responses
  FOR UPDATE
  USING ((SELECT auth.uid()) = responder_id)
  WITH CHECK ((SELECT auth.uid()) = responder_id);

DROP POLICY IF EXISTS "review_responses_admin_all" ON review_responses;
CREATE POLICY "review_responses_admin_all" ON review_responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 7. review_helpful_votes テーブルのRLSポリシー最適化
-- ----------------------------------------------------
DROP POLICY IF EXISTS "review_helpful_votes_authenticated_create" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_authenticated_create" ON review_helpful_votes
  FOR INSERT
  WITH CHECK (
    (SELECT auth.uid()) = user_id AND
    NOT EXISTS (
      SELECT 1 FROM reviews
      WHERE id = review_id AND reviewer_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "review_helpful_votes_user_delete" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_user_delete" ON review_helpful_votes
  FOR DELETE
  USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "review_helpful_votes_admin_all" ON review_helpful_votes;
CREATE POLICY "review_helpful_votes_admin_all" ON review_helpful_votes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 8. プロジェクト管理関連テーブルのRLSポリシー最適化
-- ----------------------------------------------------
-- 注: 既存のポリシーが008_project_management_rls_policies.sqlで定義されているため、
-- ここでは主要なauth.uid()の最適化のみを行います

-- projects テーブルのポリシー最適化
DROP POLICY IF EXISTS "projects_public_read" ON projects;
CREATE POLICY "projects_public_read" ON projects
  FOR SELECT
  TO PUBLIC
  USING (is_public = true);

DROP POLICY IF EXISTS "projects_authenticated_read" ON projects;
CREATE POLICY "projects_authenticated_read" ON projects
  FOR SELECT
  TO authenticated
  USING (
    (SELECT auth.uid()) = client_id OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM companies WHERE id = company_id
    ) OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM project_team_members WHERE project_id = projects.id
    )
  );

DROP POLICY IF EXISTS "projects_company_create" ON projects;
CREATE POLICY "projects_company_create" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) IN (
      SELECT user_id FROM companies WHERE id = company_id
    )
  );

DROP POLICY IF EXISTS "projects_update" ON projects;
CREATE POLICY "projects_update" ON projects
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = client_id OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM companies WHERE id = company_id
    )
  )
  WITH CHECK (
    (SELECT auth.uid()) = client_id OR
    (SELECT auth.uid()) IN (
      SELECT user_id FROM companies WHERE id = company_id
    )
  );

DROP POLICY IF EXISTS "projects_admin_all" ON projects;
CREATE POLICY "projects_admin_all" ON projects
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- =====================================================
-- パフォーマンス改善の検証用クエリ
-- =====================================================

-- 最適化前後のクエリプランを比較するためのテストクエリ
-- EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM user_favorites WHERE user_id = auth.uid();
-- EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM user_favorites WHERE user_id = (SELECT auth.uid());

-- =====================================================
-- ロールバックスクリプト（必要な場合）
-- =====================================================
-- このファイルの変更を元に戻すには、元のマイグレーションファイルを再実行してください：
-- 003_create_favorites_tables.sql
-- 005_reviews_rls_policies.sql
-- 008_project_management_rls_policies.sql