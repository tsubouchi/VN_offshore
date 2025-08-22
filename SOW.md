# SOW: Vietnam Offshore Development Platform Enhancement

## プロジェクト概要

### 目的
ベトナムオフショア開発プラットフォームのUI/UX改善および機能拡張により、日本企業とベトナム開発会社のマッチング効率を向上させ、ユーザーエクスペリエンスを大幅に改善する。

### スコープ
- 現在の単調なデザインの改善（モダンで視覚的に魅力的なUIへの刷新）
- 未実装機能の完全実装（Contact Company、Save to Favorites等）
- データベーススキーマの最適化と拡張
- リアルタイム機能の強化
- パフォーマンスと可用性の向上

## 1. 機能要件

### 1.1 UI/UX改善要件

#### 1.1.1 デザインシステムの刷新
- **現在の課題**: 単調で視覚的インパクトに欠けるデザイン
- **改善内容**:
  - モダンなカラーパレットとタイポグラフィの導入
  - 視覚的階層の明確化
  - インタラクティブな要素の追加（アニメーション、ホバー効果）
  - レスポンシブデザインの最適化

#### 1.1.2 コンポーネントライブラリの拡張
- **新規コンポーネント**:
  - `FavoriteButton`: お気に入り機能用
  - `ContactModal`: 企業コンタクト用
  - `NotificationToast`: リアルタイム通知用
  - `LoadingSpinner`: 動的ローディング表示用

### 1.2 未実装機能の完全実装

#### 1.2.1 Contact Company機能
- **現在の状態**: 実装待ち（`app/company/[id]/page.tsx:135`）
- **実装内容**:
  - 企業詳細ページからの直接コンタクト機能
  - リアルタイムメッセージング統合
  - コンタクト履歴の管理

#### 1.2.2 Save to Favorites機能
- **現在の状態**: ボタンのみ存在、機能未実装（`app/company/[id]/page.tsx:229`）
- **実装内容**:
  - ユーザー別お気に入り企業リスト
  - お気に入り企業の通知設定
  - お気に入り企業の一括管理機能

#### 1.2.3 その他未実装機能
- **レビュー機能の完全実装**: 現在実装待ち状態（`app/company/[id]/reviews/page.tsx`）
- **プロフィール管理機能**: 保存機能未実装（`components/profile/profile-management.tsx:170`）
- **チャット翻訳機能**: 現在実装待ち状態（`components/chat/chat-interface.tsx:259`）

### 1.3 動的フェッチ機能

#### 1.3.1 リアルタイム検索
- インクリメンタル検索の実装
- 検索結果のリアルタイム更新
- 検索フィルターの動的適用

#### 1.3.2 無限スクロール
- 企業リストの段階的ロード
- パフォーマンス最適化

### 1.4 リアルタイム機能

#### 1.4.1 通知システム
- 新着メッセージ通知
- お気に入り企業の更新通知
- システム通知

#### 1.4.2 チャット機能強化
- リアルタイムメッセージング
- オンライン状態表示
- 未読メッセージカウント

## 2. 非機能要件

### 2.1 パフォーマンス要件
- **ページロード時間**: 初回ロード3秒以内、以降1秒以内
- **リアルタイム応答**: メッセージ送信後500ms以内での表示
- **同時接続**: 1000ユーザーの同時接続をサポート

### 2.2 可用性要件
- **稼働率**: 99.9%以上
- **データバックアップ**: 日次自動バックアップ
- **障害復旧**: RTO 4時間、RPO 1時間

### 2.3 セキュリティ要件
- **認証**: JWT + Row Level Security (RLS)
- **データ暗号化**: 保存時・転送時の暗号化
- **アクセス制御**: ロールベースアクセス制御（RBAC）

### 2.4 スケーラビリティ要件
- **データベース**: 100万企業、1000万メッセージまでスケール可能
- **ストレージ**: 企業ロゴ・ファイル用に10TB容量確保
- **CDN**: 画像・静的ファイルの高速配信

## 3. アーキテクチャ設計

### 3.1 システム構成

```
Frontend (Next.js 15 + React 19)
├── App Router (/app)
├── Components Library (/components)
├── UI Components (shadcn/ui + Radix UI)
└── State Management (React Context + localStorage)

Backend Services
├── Supabase (PostgreSQL + Auth + Storage)
├── Real-time Subscriptions
└── Row Level Security (RLS)

External Services
├── Vercel (Hosting + CDN)
├── Gemini AI (Chatbot)
└── Email Service (通知)
```

### 3.2 データベーススキーマ拡張

#### 3.2.1 新規テーブル

```sql
-- お気に入り機能用
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, company_id)
);

-- 通知設定
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  favorite_updates BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- コンタクト履歴
CREATE TABLE contact_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('chat', 'inquiry', 'email')),
  subject TEXT,
  initial_message TEXT,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'responded', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 企業画像・ファイル管理
CREATE TABLE company_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('logo', 'cover', 'portfolio', 'certificate', 'document')),
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 3.2.2 既存テーブルの拡張

```sql
-- companiesテーブルの拡張
ALTER TABLE companies ADD COLUMN IF NOT EXISTS
  business_hours JSONB, -- 営業時間
  languages TEXT[], -- 対応言語
  certifications TEXT[], -- 認定資格
  social_links JSONB, -- SNSリンク
  founded_date DATE, -- 設立日
  legal_name TEXT, -- 正式会社名
  tax_id TEXT, -- 税務登録番号
  is_featured BOOLEAN DEFAULT false, -- 注目企業フラグ
  last_activity_at TIMESTAMPTZ DEFAULT NOW(); -- 最終活動日時

-- usersテーブルの拡張
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  timezone TEXT DEFAULT 'Asia/Tokyo',
  preferred_language TEXT DEFAULT 'ja',
  last_login_at TIMESTAMPTZ,
  profile_completion_rate INTEGER DEFAULT 0;

-- messagesテーブルの拡張
ALTER TABLE messages ADD COLUMN IF NOT EXISTS
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'system')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  is_system_message BOOLEAN DEFAULT false,
  parent_message_id UUID REFERENCES messages(id);
```

### 3.3 リアルタイム機能アーキテクチャ

#### 3.3.1 Supabase Real-time設定

```typescript
// Real-time subscriptions
const setupRealtimeSubscriptions = () => {
  // メッセージのリアルタイム更新
  const messagesSubscription = supabase
    .channel('messages')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages'
    }, handleNewMessage)
    .subscribe();

  // 通知のリアルタイム更新
  const notificationsSubscription = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications'
    }, handleNewNotification)
    .subscribe();

  // 企業情報の更新
  const companiesSubscription = supabase
    .channel('companies')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'companies'
    }, handleCompanyUpdate)
    .subscribe();
};
```

### 3.4 コンポーネントアーキテクチャ

#### 3.4.1 状態管理構造

```typescript
// Context Provider構造
interface AppContextType {
  user: User | null;
  favorites: string[];
  notifications: Notification[];
  unreadCount: number;
  addToFavorites: (companyId: string) => Promise<void>;
  removeFromFavorites: (companyId: string) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
}

// Global State
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Real-time subscriptions setup
  useEffect(() => {
    setupRealtimeSubscriptions();
  }, [user]);
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
```

## 4. 実装計画・チェックリスト

### Phase 1: UI/UX改善 (Week 1-2) **[PHASE 1 COMPLETED]**

#### デザインシステムの刷新
- [x] レスポンシブナビゲーションヘッダーとモバイルハンバーガーメニューの実装
- [x] 全データフェッチ操作のローディング状態追加
- [x] エラー境界の実装によるエラーハンドリング強化
- [x] 企業カードとリストのスケルトンローディング追加
- [x] 検索フィルターUIの改善と視覚的フィードバック強化
- [x] ホバー効果とマイクロインタラクションの追加
- [ ] トースト通知の実装（Phase 2に移行）
- [ ] フォーム検証の視覚的フィードバック追加（Phase 2に移行）
- [ ] 企業プロフィールレイアウトと情報階層の改善（Phase 2に移行）
- [ ] パンくずナビゲーションの追加（Phase 2に移行）
- [ ] ダーク/ライトテーマトグルの実装（Phase 2に移行）
- [ ] アクセシビリティ改善（ARIAラベル、キーボードナビゲーション）（Phase 2に移行）
- [ ] 画像最適化と遅延読み込みの実装（Phase 2に移行）

#### 完了したコンポーネント拡張
- [x] `Spinner`コンポーネントの作成・実装
- [x] `Skeleton`コンポーネントの作成・実装
- [x] `CompanyCardSkeleton`コンポーネントの作成・実装
- [x] `CompanyProfileSkeleton`コンポーネントの作成・実装
- [x] `ErrorBoundary`コンポーネントの作成・実装
- [x] `PageErrorBoundary`コンポーネントの作成・実装
- [x] 検索フィルターの視覚的改善（アイコン、アニメーション、状態表示）

#### 完了したレスポンシブ対応
- [x] モバイルナビゲーションの最適化（ハンバーガーメニュー）
- [x] 検索フィルターのモバイル対応
- [x] 企業カードのレスポンシブ改善
- [x] ホバー効果の統一実装
- [x] トランジション・アニメーションの追加

**Phase 1 完了基準**: ✅ **COMPLETED** - レスポンシブナビゲーション、ローディング状態、エラー境界、スケルトンローディング、検索フィルター改善、ホバー効果の実装完了

**Phase 1 実装完了項目:**
- ✅ レスポンシブナビゲーションヘッダーとモバイルハンバーガーメニュー
- ✅ 全データフェッチ操作のローディング状態（Spinner、Skeleton実装）
- ✅ エラー境界による包括的エラーハンドリング
- ✅ 企業カードとプロフィールのスケルトンローディング
- ✅ 検索フィルターUIの大幅改善（アイコン、アニメーション、視覚的フィードバック）
- ✅ ホバー効果とマイクロインタラクション（カード、ボタン、ナビゲーション）
- ✅ TypeScript型チェック・ESLint完全通過

---

### Phase 2: 未実装機能の実装 (Week 3-4) **[NEXT PHASE]**

#### Save to Favorites機能
- [ ] `user_favorites`テーブルのマイグレーション作成
- [ ] お気に入り追加APIの実装
- [ ] お気に入り削除APIの実装
- [ ] `FavoriteButton`コンポーネントの機能実装
- [ ] お気に入りリストページの作成
- [ ] お気に入り状態の動的更新実装

#### Phase 1からの継続タスク
- [ ] トースト通知コンポーネントの実装
- [ ] フォーム検証の視覚的フィードバック追加
- [ ] 企業プロフィールレイアウトと情報階層の改善
- [ ] パンくずナビゲーションの追加
- [ ] ダーク/ライトテーマトグルの実装
- [ ] アクセシビリティ改善（ARIAラベル、キーボードナビゲーション）
- [ ] 画像最適化と遅延読み込みの実装

#### Contact Company機能
- [ ] `contact_history`テーブルのマイグレーション作成
- [ ] コンタクトフォームの実装
- [ ] `ContactModal`コンポーネントの機能実装
- [ ] リアルタイムメッセージング統合
- [ ] コンタクト履歴の管理機能
- [ ] 企業詳細ページからの直接コンタクト機能

#### レビュー機能の完全実装
- [ ] レビュー投稿機能の実装（`app/company/[id]/reviews/page.tsx`）
- [ ] レビューの役立つ機能の実装
- [ ] レビュー報告機能の実装
- [ ] レビューへの返信機能の実装
- [ ] レビュー統計の動的更新

#### その他未実装機能
- [ ] プロフィール管理の保存機能実装（`components/profile/profile-management.tsx`）
- [ ] チャット翻訳機能の実装（`components/chat/chat-interface.tsx`）

**Phase 2 完了基準**: 全未実装機能の動作確認完了、ユーザビリティテスト合格

---

### Phase 3: データベース拡張 (Week 5)

#### 新規テーブルの作成
- [ ] `user_favorites`テーブル作成・テスト
- [ ] `notification_settings`テーブル作成・テスト
- [ ] `contact_history`テーブル作成・テスト
- [ ] `company_files`テーブル作成・テスト

#### 既存テーブルの拡張
- [ ] `companies`テーブルの拡張（営業時間、言語、認定資格等）
- [ ] `users`テーブルの拡張（タイムゾーン、言語設定等）
- [ ] `messages`テーブルの拡張（ファイル対応、システムメッセージ等）

#### インデックス最適化
- [ ] 新規テーブルのインデックス設定
- [ ] 既存テーブルのインデックス最適化
- [ ] クエリパフォーマンスの検証・改善
- [ ] データベース容量・パフォーマンス監視設定

#### Row Level Security (RLS)の設定
- [ ] 新規テーブルのRLSポリシー作成
- [ ] 既存ポリシーの見直し・更新
- [ ] セキュリティテストの実施

**Phase 3 完了基準**: 全データベース変更の本番反映完了、セキュリティ監査合格

---

### Phase 4: リアルタイム機能 (Week 6-7)

#### リアルタイム通知システム
- [ ] Supabase Real-time設定の実装
- [ ] メッセージのリアルタイム更新機能
- [ ] 通知のリアルタイム更新機能
- [ ] 企業情報の更新通知機能
- [ ] `NotificationToast`の統合・表示

#### チャット機能の強化
- [ ] リアルタイムメッセージング機能
- [ ] オンライン状態表示機能
- [ ] 未読メッセージカウント機能
- [ ] メッセージファイル添付機能
- [ ] チャット履歴の無限スクロール実装

#### 動的検索の実装
- [ ] インクリメンタル検索の実装
- [ ] 検索結果のリアルタイム更新
- [ ] 検索フィルターの動的適用
- [ ] 無限スクロールでの企業リスト表示

#### 状態管理の実装
- [ ] グローバル状態管理（React Context）の実装
- [ ] リアルタイムサブスクリプションの設定
- [ ] ローカルストレージとの同期機能

**Phase 4 完了基準**: 全リアルタイム機能の動作確認完了、負荷テスト合格

---

### Phase 5: テスト・最適化 (Week 8)

#### 統合テスト
- [ ] E2Eテストシナリオの作成・実行
- [ ] ユーザーフローテストの実施
- [ ] クロスブラウザテストの実施
- [ ] モバイル・タブレット実機テスト

#### パフォーマンス最適化
- [ ] ページロード時間の最適化（目標: 1秒以内）
- [ ] 画像・ファイルの最適化・CDN設定
- [ ] バンドルサイズの最適化
- [ ] Lighthouse CI設定・スコア改善

#### セキュリティ監査
- [ ] OWASP準拠のセキュリティテスト
- [ ] 脆弱性スキャンの実施・修正
- [ ] 認証・認可機能の検証
- [ ] データ暗号化の確認

#### 品質保証
- [ ] TypeScript型チェックの完全通過
- [ ] ESLintエラー・警告の完全解消
- [ ] テストカバレッジ90%以上の達成
- [ ] Contract Validation（UI-DB整合性）の確認

#### デプロイメント準備
- [ ] 本番環境での動作確認
- [ ] 監視・ログシステムの設定
- [ ] バックアップ・復旧手順の確認
- [ ] ユーザーマニュアル・ドキュメント完成

**Phase 5 完了基準**: 全品質基準の達成、本番リリース準備完了

---

## 進捗管理

### 週次チェックポイント **[UPDATED]**
- **Week 1終了時**: ✅ Phase 1の80%完了（当初予定50%を大幅超過達成）
- **Week 2終了時**: ✅ **Phase 1完了**、Phase 2開始準備完了
- **Week 3終了時**: Phase 2の50%完了
- **Week 4終了時**: Phase 2完了、Phase 3開始
- **Week 5終了時**: Phase 3完了、Phase 4開始
- **Week 6終了時**: Phase 4の50%完了
- **Week 7終了時**: Phase 4完了、Phase 5開始
- **Week 8終了時**: 全Phase完了、リリース準備完了

### 成功指標の追跡
- [ ] ページロード時間: 3秒 → 1秒達成
- [ ] エラー率: 0.1%以下達成
- [ ] テストカバレッジ: 90%以上達成
- [ ] ユーザビリティテスト: 4.5/5.0以上達成

## 5. 成果物

### 5.1 技術成果物
- 刷新されたUIコンポーネントライブラリ
- 完全実装された機能セット
- 最適化されたデータベーススキーマ
- リアルタイム機能の実装

### 5.2 ドキュメント
- API仕様書
- コンポーネントドキュメント
- デプロイメントガイド
- ユーザーマニュアル

## 6. 品質保証

### 6.1 テスト戦略
- **単体テスト**: Jest + React Testing Library (90%カバレッジ)
- **統合テスト**: Cypress E2E テスト
- **パフォーマンステスト**: Lighthouse CI
- **セキュリティテスト**: OWASP準拠

### 6.2 コード品質
- **TypeScript**: 厳格モード維持
- **ESLint**: エラー・警告ゼロ
- **Contract Validation**: UI-DB整合性保証
- **コードレビュー**: プルリクエストベース

## 7. 運用・保守

### 7.1 監視体制
- **アプリケーション監視**: Vercel Analytics
- **データベース監視**: Supabase Dashboard
- **エラー追跡**: Sentry統合
- **パフォーマンス監視**: Web Vitals

### 7.2 保守計画
- **定期メンテナンス**: 月次
- **セキュリティアップデート**: 即時対応
- **機能拡張**: 四半期ごと
- **データベース最適化**: 半期ごと

## 8. リスク管理

### 8.1 技術リスク
- **Supabase依存**: バックアップ戦略とマイグレーション計画
- **リアルタイム性能**: WebSocket接続の安定性監視
- **データ整合性**: トランザクション管理の強化

### 8.2 ビジネスリスク
- **ユーザー受容**: 段階的リリースとフィードバック収集
- **スケーラビリティ**: 負荷テストと容量計画
- **セキュリティ**: 定期的な脆弱性スキャン

## 9. 成功指標

### 9.1 技術指標
- ページロード時間: 3秒 → 1秒
- エラー率: 0.1%以下
- 稼働率: 99.9%以上
- テストカバレッジ: 90%以上

### 9.2 ビジネス指標
- ユーザーエンゲージメント: 30%向上
- 企業マッチング成功率: 25%向上
- ユーザー満足度: 4.5/5.0以上
- コンバージョン率: 20%向上

---

**プロジェクト期間**: 8週間  
**チーム構成**: フルスタック開発者1名  
**技術スタック**: Next.js 15, React 19, TypeScript, Supabase, Vercel  
**開発環境**: Vercel (本番), Supabase (DB), GitHub (バージョン管理)