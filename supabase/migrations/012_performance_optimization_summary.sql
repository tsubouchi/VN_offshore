-- =====================================================
-- パフォーマンス最適化サマリー
-- 全3フェーズの改善内容まとめ
-- =====================================================

-- このファイルは、パフォーマンス最適化の全体を実行するためのマスタースクリプトです
-- 各フェーズのスクリプトを順番に実行してください

-- =====================================================
-- 実行順序
-- =====================================================
-- 1. Phase 1: RLS初期化計画の最適化
--    実行ファイル: 009_performance_optimization_phase1_rls.sql
--    改善内容: auth.uid()を(SELECT auth.uid())に変更
--    影響: 19件のRLSポリシー

-- 2. Phase 2: 複数許可ポリシーの統合
--    実行ファイル: 010_performance_optimization_phase2_policy_consolidation.sql
--    改善内容: 同一テーブル・アクションの複数ポリシーを統合
--    影響: 18件のポリシー

-- 3. Phase 3: インデックス最適化
--    実行ファイル: 011_performance_optimization_phase3_indexes.sql
--    改善内容: 未使用インデックス削除と必要なインデックス追加
--    影響: 60件削除、3件追加、8件の最適化インデックス追加

-- =====================================================
-- 実行前のバックアップ（推奨）
-- =====================================================
-- pg_dump -h your-db-host -U your-username -d your-database > backup_before_optimization.sql

-- =====================================================
-- 実行コマンド
-- =====================================================
-- psql -h your-db-host -U your-username -d your-database -f 009_performance_optimization_phase1_rls.sql
-- psql -h your-db-host -U your-username -d your-database -f 010_performance_optimization_phase2_policy_consolidation.sql
-- psql -h your-db-host -U your-username -d your-database -f 011_performance_optimization_phase3_indexes.sql

-- =====================================================
-- パフォーマンス検証クエリ
-- =====================================================

-- 1. RLSポリシーの数を確認
SELECT 
  tablename,
  COUNT(*) as policy_count
FROM pg_catalog.pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC;

-- 2. インデックスの使用状況を確認
SELECT 
  schemaname,
  relname as tablename,
  indexrelname as indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read
FROM pg_catalog.pg_stat_user_indexes
WHERE schemaname = 'public' AND idx_scan > 0
ORDER BY idx_scan DESC
LIMIT 20;

-- 3. テーブルとインデックスのサイズ確認
SELECT
  t.tablename,
  pg_size_pretty(pg_total_relation_size((t.schemaname||'.'||t.tablename)::regclass)) AS total_size,
  pg_size_pretty(pg_relation_size((t.schemaname||'.'||t.tablename)::regclass)) AS table_size,
  pg_size_pretty(pg_total_relation_size((t.schemaname||'.'||t.tablename)::regclass) - pg_relation_size((t.schemaname||'.'||t.tablename)::regclass)) AS indexes_size
FROM pg_catalog.pg_tables t
WHERE t.schemaname = 'public'
ORDER BY pg_total_relation_size((t.schemaname||'.'||t.tablename)::regclass) DESC
LIMIT 10;

-- 4. クエリパフォーマンステスト例
-- user_favoritesテーブルでの改善効果測定
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM user_favorites 
WHERE user_id = (SELECT auth.uid())
LIMIT 10;

-- 5. 全体的なデータベース統計
SELECT 
  numbackends as active_connections,
  xact_commit as transactions_committed,
  xact_rollback as transactions_rolled_back,
  blks_read as disk_blocks_read,
  blks_hit as buffer_hits,
  tup_returned as rows_returned,
  tup_fetched as rows_fetched,
  tup_inserted as rows_inserted,
  tup_updated as rows_updated,
  tup_deleted as rows_deleted
FROM pg_catalog.pg_stat_database
WHERE datname = current_database();

-- =====================================================
-- ロールバック手順（必要な場合）
-- =====================================================
-- 1. バックアップから復元
--    psql -h your-db-host -U your-username -d your-database < backup_before_optimization.sql

-- 2. または個別にロールバック
--    - RLSポリシー: 003, 005, 008のマイグレーションファイルを再実行
--    - インデックス: 元のCREATE INDEX文を実行

-- =====================================================
-- 期待される改善効果
-- =====================================================
-- 1. RLS評価時間: 50%以上の削減
-- 2. クエリ応答時間: 30-50%の改善
-- 3. ストレージ使用量: 20-30%の削減
-- 4. 同時接続処理能力: 30%の向上
-- 5. INSERT/UPDATE/DELETE操作: 10-20%の高速化

-- =====================================================
-- モニタリング推奨事項
-- =====================================================
-- 1. 実行後24時間は重点的にモニタリング
-- 2. pg_stat_statementsでスロークエリを監視
-- 3. エラーログの確認
-- 4. アプリケーションのレスポンスタイム測定
-- 5. データベース接続プールの状態確認

-- =====================================================
-- 完了チェックリスト
-- =====================================================
-- [ ] バックアップ作成完了
-- [ ] Phase 1 (RLS最適化) 実行完了
-- [ ] Phase 2 (ポリシー統合) 実行完了
-- [ ] Phase 3 (インデックス最適化) 実行完了
-- [ ] パフォーマンステスト実施
-- [ ] アプリケーション動作確認
-- [ ] モニタリング設定完了