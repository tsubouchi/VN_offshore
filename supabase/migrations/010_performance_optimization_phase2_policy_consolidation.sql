-- =====================================================
-- Phase 2: 複数許可ポリシーの統合
-- 同一テーブル・同一アクションの複数ポリシーを統合
-- =====================================================

-- 1. company_files テーブルのポリシー統合
-- ----------------------------------------------------
-- 既存の複数ポリシーを削除
DROP POLICY IF EXISTS "Company owners can manage their files" ON company_files;
DROP POLICY IF EXISTS "Everyone can view public company files" ON company_files;

-- 統合されたSELECTポリシー
CREATE POLICY "company_files_unified_select_policy" ON company_files
  FOR SELECT
  USING (
    -- 公開ファイルまたは所有者のファイル
    is_public = true OR
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_files.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- 所有者のみがINSERT/UPDATE/DELETE可能
CREATE POLICY "company_files_owner_modify_policy" ON company_files
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_files.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "company_files_owner_update_policy" ON company_files
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_files.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "company_files_owner_delete_policy" ON company_files
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = company_files.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- 2. contact_history テーブルのポリシー統合
-- ----------------------------------------------------
-- 既存の複数SELECTポリシーを削除
DROP POLICY IF EXISTS "Users can view own contact history" ON contact_history;
DROP POLICY IF EXISTS "Vendors can view contacts for their companies" ON contact_history;

-- 統合されたSELECTポリシー
CREATE POLICY "contact_history_unified_select_policy" ON contact_history
  FOR SELECT
  USING (
    -- 購入者本人または会社のベンダー
    (SELECT auth.uid()) = buyer_id OR
    EXISTS (
      SELECT 1 FROM companies c
      WHERE c.id = contact_history.company_id
      AND c.user_id = (SELECT auth.uid())
    )
  );

-- INSERT/UPDATEポリシーは既存のものを維持（最適化済み）

-- 3. reviews テーブルのポリシー統合
-- ----------------------------------------------------
-- 既存の複数ポリシーを削除
DROP POLICY IF EXISTS "reviews_public_read" ON reviews;
DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
DROP POLICY IF EXISTS "reviews_authenticated_create" ON reviews;
DROP POLICY IF EXISTS "reviews_author_update" ON reviews;

-- 統合されたSELECTポリシー
CREATE POLICY "reviews_unified_select_policy" ON reviews
  FOR SELECT
  USING (
    -- 公開レビューまたは管理者
    is_approved = true OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 統合されたINSERTポリシー
CREATE POLICY "reviews_unified_insert_policy" ON reviews
  FOR INSERT
  WITH CHECK (
    -- 管理者または自分のレビュー（自社レビューは不可）
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR (
      (SELECT auth.uid()) = reviewer_id AND
      NOT EXISTS (
        SELECT 1 FROM companies
        WHERE id = company_id AND user_id = (SELECT auth.uid())
      )
    )
  );

-- 統合されたUPDATEポリシー
CREATE POLICY "reviews_unified_update_policy" ON reviews
  FOR UPDATE
  USING (
    -- 管理者または作成者本人
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR
    (SELECT auth.uid()) = reviewer_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR
    (SELECT auth.uid()) = reviewer_id
  );

-- 管理者のみDELETE可能
CREATE POLICY "reviews_admin_delete_policy" ON reviews
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 4. review_responses テーブルのポリシー統合
-- ----------------------------------------------------
-- 既存の複数ポリシーを削除
DROP POLICY IF EXISTS "review_responses_public_read" ON review_responses;
DROP POLICY IF EXISTS "review_responses_admin_all" ON review_responses;
DROP POLICY IF EXISTS "review_responses_company_create" ON review_responses;
DROP POLICY IF EXISTS "review_responses_author_update" ON review_responses;

-- 統合されたSELECTポリシー
CREATE POLICY "review_responses_unified_select_policy" ON review_responses
  FOR SELECT
  USING (
    -- すべて公開または管理者
    true -- レスポンスは全て公開
  );

-- 統合されたINSERTポリシー
CREATE POLICY "review_responses_unified_insert_policy" ON review_responses
  FOR INSERT
  WITH CHECK (
    -- 管理者または会社の代表者
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR (
      (SELECT auth.uid()) = responder_id AND
      EXISTS (
        SELECT 1 FROM reviews r
        JOIN companies c ON c.id = r.company_id
        WHERE r.id = review_id AND c.user_id = (SELECT auth.uid())
      )
    )
  );

-- 統合されたUPDATEポリシー
CREATE POLICY "review_responses_unified_update_policy" ON review_responses
  FOR UPDATE
  USING (
    -- 管理者または作成者本人
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR
    (SELECT auth.uid()) = responder_id
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR
    (SELECT auth.uid()) = responder_id
  );

-- 5. review_helpful_votes テーブルのポリシー統合
-- ----------------------------------------------------
-- 既存の複数ポリシーを削除
DROP POLICY IF EXISTS "review_helpful_votes_public_read" ON review_helpful_votes;
DROP POLICY IF EXISTS "review_helpful_votes_admin_all" ON review_helpful_votes;
DROP POLICY IF EXISTS "review_helpful_votes_authenticated_create" ON review_helpful_votes;
DROP POLICY IF EXISTS "review_helpful_votes_user_delete" ON review_helpful_votes;

-- 統合されたSELECTポリシー
CREATE POLICY "review_helpful_votes_unified_select_policy" ON review_helpful_votes
  FOR SELECT
  USING (
    -- すべて公開
    true
  );

-- 統合されたINSERTポリシー
CREATE POLICY "review_helpful_votes_unified_insert_policy" ON review_helpful_votes
  FOR INSERT
  WITH CHECK (
    -- 管理者または認証済みユーザー（自分のレビューには投票不可）
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR (
      (SELECT auth.uid()) = user_id AND
      NOT EXISTS (
        SELECT 1 FROM reviews
        WHERE id = review_id AND reviewer_id = (SELECT auth.uid())
      )
    )
  );

-- 統合されたDELETEポリシー
CREATE POLICY "review_helpful_votes_unified_delete_policy" ON review_helpful_votes
  FOR DELETE
  USING (
    -- 管理者または投票者本人
    EXISTS (
      SELECT 1 FROM users
      WHERE id = (SELECT auth.uid()) AND role = 'admin'
    ) OR
    (SELECT auth.uid()) = user_id
  );

-- =====================================================
-- パフォーマンス改善の検証
-- =====================================================

-- 統合前後のポリシー数を確認
-- SELECT schemaname, tablename, policyname 
-- FROM pg_policies 
-- WHERE tablename IN ('company_files', 'contact_history', 'reviews', 'review_responses', 'review_helpful_votes')
-- ORDER BY tablename, policyname;

-- =====================================================
-- ロールバックスクリプト
-- =====================================================
-- 元のポリシーに戻すには、以下のファイルを再実行：
-- 003_create_favorites_tables.sql (contact_history, company_files)
-- 005_reviews_rls_policies.sql (reviews, review_responses, review_helpful_votes)