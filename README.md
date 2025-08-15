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
- **AI**: Google Gemini AI
- **UIコンポーネント**: Radix UI + shadcn/ui
- **フォーム**: React Hook Form + Zod
- **その他**: TypeScript, pnpm

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

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

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

## デプロイ

Vercelにデプロイ済み:
**[https://vercel.com/bonginkan-projects/v0-vietnam-offshore-app](https://vercel.com/bonginkan-projects/v0-vietnam-offshore-app)**

## 開発

v0.appでの開発を継続:
**[https://v0.app/chat/projects/cNHwNTJw0rW](https://v0.app/chat/projects/cNHwNTJw0rW)**
