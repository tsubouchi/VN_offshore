-- =====================================================
-- Phase 3: インデックス最適化
-- 未使用インデックスの削除と必要なインデックスの追加
-- =====================================================

-- =====================================================
-- PART 1: 未使用インデックスの削除（60件）
-- =====================================================

-- messages テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_messages_conversation_created;
DROP INDEX IF EXISTS idx_messages_parent;
DROP INDEX IF EXISTS idx_messages_type;
DROP INDEX IF EXISTS idx_messages_is_deleted;
DROP INDEX IF EXISTS idx_messages_conversation_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_receiver_id;
DROP INDEX IF EXISTS idx_messages_created_at;
DROP INDEX IF EXISTS idx_messages_is_read;

-- user_favorites テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_user_favorites_user_id;
DROP INDEX IF EXISTS idx_user_favorites_company_id;
DROP INDEX IF EXISTS idx_user_favorites_created_at;

-- contact_history テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_contact_history_buyer_id;
DROP INDEX IF EXISTS idx_contact_history_company_id;
DROP INDEX IF EXISTS idx_contact_history_status;
DROP INDEX IF EXISTS idx_contact_history_created_at;

-- notification_settings テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_notification_settings_user_id;

-- company_files テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_company_files_company_id;
DROP INDEX IF EXISTS idx_company_files_file_type;

-- reviews テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_reviews_company_id;
DROP INDEX IF EXISTS idx_reviews_reviewer_id;
DROP INDEX IF EXISTS idx_reviews_rating;
DROP INDEX IF EXISTS idx_reviews_created_at;
DROP INDEX IF EXISTS idx_reviews_is_approved;

-- review_responses テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_review_responses_review_id;

-- review_helpful_votes テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_review_helpful_votes_review_id;

-- users テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_country;
DROP INDEX IF EXISTS idx_users_last_login;
DROP INDEX IF EXISTS idx_users_role_active;
DROP INDEX IF EXISTS idx_users_preferred_language;
DROP INDEX IF EXISTS idx_users_preferred_categories;

-- companies テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_companies_user_id;
DROP INDEX IF EXISTS idx_companies_status;
DROP INDEX IF EXISTS idx_companies_location;
DROP INDEX IF EXISTS idx_companies_rating;
DROP INDEX IF EXISTS idx_companies_is_featured;
DROP INDEX IF EXISTS idx_companies_status_featured;
DROP INDEX IF EXISTS idx_companies_languages;
DROP INDEX IF EXISTS idx_companies_certifications;
DROP INDEX IF EXISTS idx_companies_tags;
DROP INDEX IF EXISTS idx_companies_specializations;
DROP INDEX IF EXISTS idx_companies_service_categories;
DROP INDEX IF EXISTS idx_companies_last_activity;

-- conversations テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_conversations_buyer_id;
DROP INDEX IF EXISTS idx_conversations_vendor_id;
DROP INDEX IF EXISTS idx_conversations_company_id;
DROP INDEX IF EXISTS idx_conversations_last_message;

-- inquiries テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_inquiries_company_id;
DROP INDEX IF EXISTS idx_inquiries_inquirer_id;
DROP INDEX IF EXISTS idx_inquiries_status;

-- notifications テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_is_read;
DROP INDEX IF EXISTS idx_notifications_created_at;

-- company_technologies テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_company_technologies_company_id;
DROP INDEX IF EXISTS idx_company_technologies_technology;

-- company_projects テーブルの未使用インデックス削除
DROP INDEX IF EXISTS idx_company_projects_company_id;

-- =====================================================
-- PART 2: 必要なインデックスの追加（3件）
-- =====================================================

-- company_industries テーブルの外部キーインデックス
CREATE INDEX idx_company_industries_industry_id 
ON company_industries(industry_id);

-- review_helpful_votes テーブルの外部キーインデックス
CREATE INDEX idx_review_helpful_votes_user_id 
ON review_helpful_votes(user_id);

-- review_responses テーブルの外部キーインデックス
CREATE INDEX idx_review_responses_responder_id 
ON review_responses(responder_id);

-- =====================================================
-- PART 3: パフォーマンス向上のための最適化インデックス追加
-- =====================================================

-- よく使われるクエリパターンに基づいた複合インデックス

-- ユーザー認証とロール確認用
CREATE INDEX idx_users_auth_uid_role 
ON users(id, role) 
WHERE role IN ('admin', 'vendor', 'buyer');

-- 会社検索の最適化（ステータスと評価）
CREATE INDEX idx_companies_active_rating 
ON companies(status, average_rating DESC) 
WHERE status = 'approved';

-- レビューの表示用（承認済みのみ）
CREATE INDEX idx_reviews_approved_company 
ON reviews(company_id, created_at DESC) 
WHERE is_approved = true;

-- メッセージの未読確認用
CREATE INDEX idx_messages_unread 
ON messages(receiver_id, is_read) 
WHERE is_read = false;

-- 通知の未読確認用
CREATE INDEX idx_notifications_unread 
ON notifications(user_id, is_read) 
WHERE is_read = false;

-- お気に入りの高速アクセス
CREATE INDEX idx_user_favorites_lookup 
ON user_favorites(user_id, company_id);

-- コンタクト履歴の検索最適化
CREATE INDEX idx_contact_history_lookup 
ON contact_history(buyer_id, company_id, created_at DESC);

-- プロジェクト検索の最適化（アクティブプロジェクト）
CREATE INDEX idx_projects_active 
ON projects(status, client_id) 
WHERE status = 'active';

-- =====================================================
-- PART 4: インデックスの統計情報更新
-- =====================================================

-- テーブルの統計情報を更新してクエリプランナーを最適化
ANALYZE users;
ANALYZE companies;
ANALYZE reviews;
ANALYZE review_responses;
ANALYZE review_helpful_votes;
ANALYZE messages;
ANALYZE conversations;
ANALYZE notifications;
ANALYZE user_favorites;
ANALYZE contact_history;
ANALYZE company_files;
ANALYZE company_industries;
ANALYZE projects;

-- =====================================================
-- 検証クエリ
-- =====================================================

-- インデックス使用状況を確認
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_scan as index_scans,
--   idx_tup_read as tuples_read,
--   idx_tup_fetch as tuples_fetched
-- FROM pg_stat_user_indexes
-- WHERE schemaname = 'public'
-- ORDER BY idx_scan DESC;

-- テーブルサイズとインデックスサイズの確認
-- SELECT
--   tablename,
--   pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS total_size,
--   pg_size_pretty(pg_relation_size(tablename::regclass)) AS table_size,
--   pg_size_pretty(pg_total_relation_size(tablename::regclass) - pg_relation_size(tablename::regclass)) AS indexes_size
-- FROM pg_tables
-- WHERE schemaname = 'public'
-- ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- =====================================================
-- ロールバックスクリプト
-- =====================================================
-- 削除したインデックスを復元する必要がある場合は、
-- 元のマイグレーションファイルから該当するCREATE INDEX文を実行してください