

## 管理画面の実装計画

### 概要
管理者ユーザーのみがアクセスできる管理画面を作成し、ガソリン価格の確認・手動上書き機能を提供します。認証システムとロール管理も合わせて実装します。

### 実装内容

#### 1. データベース（マイグレーション）
- **`profiles`テーブル**: `id (FK → auth.users)`, `email`, `created_at` — ユーザー登録時に自動作成（トリガー）
- **`user_roles`テーブル**: `user_id`, `role (enum: admin/user)` — RLS付き、`has_role()` セキュリティ定義関数で判定
- **`gasoline_price_overrides`テーブル**: `id`, `price`, `note`, `set_by (FK → auth.users)`, `created_at` — 管理者が手動設定した価格を保存。最新レコードが有効

#### 2. 認証システム
- **ログイン/サインアップページ** (`/auth`): メール+パスワード認証、Google OAuth対応
- **パスワードリセットページ** (`/reset-password`)
- **`AuthProvider`コンテキスト**: セッション管理、`onAuthStateChange`リスナー
- **`ProtectedRoute`コンポーネント**: 管理者ロール必須のルートガード

#### 3. 管理画面 (`/admin`)
- 現在のガソリン価格（自動取得値）の表示
- 手動価格の上書き入力フォーム（メモ欄付き）
- 過去の設定履歴一覧
- 手動上書きのクリア（自動取得に戻す）ボタン

#### 4. ガソリン価格フックの更新 (`useGasolinePrice.ts`)
- 取得ロジック: まず`gasoline_price_overrides`の最新レコードを確認 → 存在すれば手動価格を優先 → なければ従来のAPI自動取得

### 変更ファイル一覧

| ファイル | 内容 |
|---|---|
| DB マイグレーション | profiles, user_roles, gasoline_price_overrides テーブル + RLS + トリガー |
| `src/contexts/AuthContext.tsx` | 新規: 認証コンテキスト |
| `src/components/ProtectedRoute.tsx` | 新規: 管理者ルートガード |
| `src/pages/Auth.tsx` | 新規: ログイン/サインアップ |
| `src/pages/ResetPassword.tsx` | 新規: パスワードリセット |
| `src/pages/Admin.tsx` | 新規: 管理画面 |
| `src/hooks/useGasolinePrice.ts` | 修正: 手動価格優先ロジック追加 |
| `src/App.tsx` | 修正: ルート追加、AuthProvider |

### セキュリティ
- RLSで全テーブルを保護
- `has_role()` SECURITY DEFINER関数で再帰回避
- 管理画面は`user_roles`テーブルでadminロールを持つユーザーのみアクセス可能
- 初期管理者は最初にサインアップしたユーザーをDBで手動設定（または初回のみ自動付与）

