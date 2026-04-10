

## 定期実行によるガソリン価格自動更新の実装計画

### 概要
週1回、自動的にAPIからガソリン価格を取得し `gasoline_price_overrides` に保存するスケジュール機能を実装します。管理画面からオン/オフを切り替えられるようにします。

### 実装内容

#### 1. 新しいEdge Function: `gasoline-price-scheduled`
- サービスロールキーで認証し、APIから価格を取得
- 既存の `is_active` レコードを無効化し、新しいレコードを挿入
- メモに「定期自動取得（日付）」を記録
- `set_by` には専用のシステムユーザーIDまたは管理者IDを使用（サービスロールで直接DB操作）

#### 2. DB設定テーブル: `app_settings`
- `key (text, PK)` / `value (text)` のシンプルなKVテーブル
- `auto_fetch_gasoline_price` キーで定期実行のオン/オフを管理（値: `"true"` / `"false"`）
- RLS: 誰でもSELECT可、管理者のみUPDATE/INSERT

#### 3. pg_cron ジョブの設定
- `pg_cron` と `pg_net` 拡張を有効化（マイグレーション）
- 毎週月曜 9:00 JST にEdge Functionを呼び出すcronジョブを登録
- Edge Function側で `app_settings` を確認し、オフなら何もせず終了

#### 4. 管理画面UIの更新 (`Admin.tsx`)
- 「定期自動取得」セクションを追加
- Switch コンポーネントでオン/オフ切り替え
- 現在のステータス表示（有効/無効、次回実行予定）

### 変更ファイル一覧

| ファイル | 内容 |
|---|---|
| DBマイグレーション | `app_settings` テーブル作成、`pg_cron`/`pg_net` 拡張有効化 |
| SQLインサート | cronジョブ登録（`cron.schedule`） |
| `supabase/functions/gasoline-price-scheduled/index.ts` | 新規: 定期実行用Edge Function |
| `src/pages/Admin.tsx` | 修正: オン/オフ切り替えUI追加 |

### セキュリティ
- 定期実行Edge FunctionはサービスロールキーでDB操作
- `app_settings` テーブルは管理者のみ変更可能

