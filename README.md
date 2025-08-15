# Vietnam Offshore Development Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/bonginkan-projects/v0-vietnam-offshore-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/projects/cNHwNTJw0rW)

## 概要

ベトナムオフショア開発会社の検索・マッチングプラットフォームです。企業様はベトナムの優秀な開発会社を検索し、レビューを確認し、直接コンタクトを取ることができます。

## 主な機能

### 🔍 企業検索
- 技術スタック（React, Vue, Node.js等）での絞り込み
- 都市（ハノイ、ホーチミン、ダナン等）での絞り込み
- 価格帯での絞り込み
- キーワード検索

### 💬 コミュニケーション
- リアルタイムチャット機能
- 問い合わせフォーム
- AIチャットボット（Gemini AI）によるサポート

### ⭐ レビュー・評価
- 5段階評価システム
- 詳細なレビュー投稿
- 評価カテゴリー（技術力、コミュニケーション、納期等）

### 👤 ユーザー管理
- バイヤー（発注側）アカウント
- ベンダー（開発会社）アカウント
- 管理者アカウント
- プロフィール管理

### 🔔 通知機能
- リアルタイム通知
- メッセージ通知
- システム通知

## 技術スタック

- **フレームワーク**: Next.js 15.2.4
- **UI**: React 19 + Tailwind CSS
- **認証・DB**: Supabase
- **AI**: Google Gemini AI (gemini-2.5-pro-preview-06-05)
- **UIコンポーネント**: Radix UI + shadcn/ui
- **フォーム**: React Hook Form + Zod
- **テスト**: Jest + React Testing Library
- **型チェック**: TypeScript (厳格モード)
- **コード品質**: ESLint, Prettier
- **パッケージ管理**: pnpm

## セットアップ

### 必要な環境
- Node.js 18以上
- pnpm

### インストール

```bash
# 依存関係のインストール
pnpm install

# 開発サーバーの起動
npm run dev
```

### 主要コマンド

```bash
# 開発
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動

# コード品質 ✅
pnpm lint            # ESLintでコードチェック（エラー・警告なし）
pnpm type-check      # TypeScript型チェック（全チェック成功）

# テスト ✅
pnpm test            # テスト実行（全テスト成功）
pnpm test:watch      # ウォッチモードでテスト
pnpm test:coverage   # カバレッジレポート付きテスト（24テスト成功）

# コントラクト検証 ✅
pnpm contract          # コントラクト検証実行（全コントラクト有効）
pnpm contract:extract  # コントラクト抽出
pnpm contract:validate # コントラクトテスト実行（6テスト成功）
```

### コマンドステータス

| コマンド | ステータス | 結果 |
|---------|-----------|------|
| `pnpm lint` | ✅ 成功 | ESLintエラー・警告なし |
| `pnpm type-check` | ✅ 成功 | TypeScriptエラーなし |
| `pnpm test:coverage` | ✅ 成功 | 24テスト全て成功 |
| `pnpm contract` | ✅ 成功 | UI-DBコントラクト全て有効 |

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

## プロジェクトの品質管理

### 自動化された品質チェック

1. **コード品質**: ESLintによる自動チェック
2. **型安全性**: TypeScriptの厳格な型チェック
3. **テスト**: Jestによる単体テスト・統合テスト
4. **コントラクト検証**: UI-DB間の整合性自動検証

### テストカバレッジ

- コンポーネントテスト: FloatingChatbot等の主要UIコンポーネント
- ライブラリテスト: Supabase, Gemini AI統合
- コントラクトテスト: UI型とDBスキーマの整合性

## プロジェクト構成

```
/app                # Next.js App Router
  /admin           # 管理者ページ
  /company         # 企業詳細・レビュー
  /contact         # お問い合わせ・チャット
  /login           # ログイン
  /messages        # メッセージ一覧
  /notifications   # 通知
  /profile         # プロフィール管理
  /search          # 企業検索
/components        # Reactコンポーネント
  /auth            # 認証関連
  /chat            # チャット機能
  /chatbot         # AIチャットボット
  /inquiry         # 問い合わせ
  /notifications   # 通知
  /profile         # プロフィール
  /reviews         # レビュー
  /search          # 検索
  /ui              # UIコンポーネント
/lib               # ユーティリティ・設定
/public            # 静的ファイル
```

## Supabase概要

### 使用している機能

#### 認証 (Authentication)
- メール/パスワードによるユーザー認証
- ロールベースアクセス制御（バイヤー/ベンダー/管理者）
- セッション管理

#### データベース (Database)
- PostgreSQLによるデータ管理
- リアルタイムサブスクリプション
- Row Level Security (RLS)による安全なデータアクセス

#### ストレージ (Storage)
- 企業ロゴのアップロード
- ファイル添付機能

### 主要テーブル

| テーブル名 | 説明 |
|------------|------|
| users | ユーザーアカウント（役割：buyer/vendor/admin） |
| companies | ベンダー企業情報（技術スタック、価格帯等） |
| conversations | チャット会話 |
| messages | チャットメッセージ |
| reviews | 企業レビューと評価 |
| notifications | 通知情報 |
| inquiries | 問い合わせフォーム送信データ |
| company_technologies | 企業の技術スキル |
| company_projects | 企業のポートフォリオ |

### データベースファイル構成

```
supabase/
├── migrations/
│   ├── 000_reset_database.sql        # DBリセット
│   ├── 001_create_schema.sql         # スキーマ作成
│   └── 002_enable_rls_policies.sql   # RLSポリシー
├── seeds/
│   └── 001_seed_data.sql            # サンプルデータ
└── README.md                         # DB仕様書
```

### Supabase設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. SQLエディタで以下の順序でファイルを実行：
   - `migrations/000_reset_database.sql`
   - `migrations/001_create_schema.sql`
   - `migrations/002_enable_rls_policies.sql`
   - `seeds/001_seed_data.sql`
3. 環境変数に接続情報を設定

## デプロイ

Vercelにデプロイ済み:
**[https://vercel.com/bonginkan-projects/v0-vietnam-offshore-app](https://vercel.com/bonginkan-projects/v0-vietnam-offshore-app)**

## 開発

v0.appでの開発を継続:
**[https://v0.app/chat/projects/cNHwNTJw0rW](https://v0.app/chat/projects/cNHwNTJw0rW)**

## トラブルシューティング

### Supabaseに接続できない場合
- 環境変数が正しく設定されているか確認
- Supabaseプロジェクトがアクティブか確認
- ネットワーク接続を確認
- アプリはSupabaseなしでも動作（モックデータ使用）

### 型エラーが発生する場合
- `pnpm type-check`で詳細を確認
- Supabase nullチェックに非nullアサーション（`!`）を使用
- ユニオン型には型アサーション（`as`）を使用

### テストが失敗する場合
- `pnpm install`で依存関係を再インストール
- `pnpm type-check`で型エラーを確認
- テストファイルのパスが正しいか確認

### コントラクト検証エラーの場合
- UIが正しい設計となるため、DBスキーマを修正
- `pnpm contract:extract`でコントラクトを再抽出
- `pnpm contract:validate`で検証
