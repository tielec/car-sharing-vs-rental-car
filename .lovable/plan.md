

## `comparison_logs` に `has_interacted` フラグを追加

### 概要
現在のログにはユーザーが入力を変更したかどうかの情報がない。`has_interacted` カラムを追加し、「閲覧のみ」と「実際に比較操作した」を区別できるようにする。両方のデータを記録し続けるが、管理画面で分けて分析可能にする。

### 変更内容

#### 1. DBマイグレーション
- `comparison_logs` テーブルに `has_interacted boolean DEFAULT false` カラムを追加

#### 2. `src/hooks/useComparisonLogger.ts`
- `ComparisonLogData` に `hasInteracted: boolean` を追加
- upsert時に `has_interacted` フィールドを含める

#### 3. `src/pages/Index.tsx`
- `hasInteracted` state を追加（初期値 `false`）
- 各入力の onChange で `setHasInteracted(true)` を呼ぶ
- `useComparisonLogger` に `hasInteracted` を渡す

#### 4. `src/components/admin/ComparisonAnalytics.tsx`
- サマリーカードに「閲覧のみ / 操作あり」の内訳を表示
- 直近ログのテーブルに操作有無の列を追加
- 「操作ありのみ表示」フィルタボタンを追加

### 変更ファイル
| ファイル | 内容 |
|---|---|
| DBマイグレーション | `has_interacted` カラム追加 |
| `src/hooks/useComparisonLogger.ts` | フラグ送信対応 |
| `src/pages/Index.tsx` | 操作検知 state + onChange連携 |
| `src/components/admin/ComparisonAnalytics.tsx` | フィルタ・内訳表示 |

