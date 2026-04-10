

## `comparison_logs` に投げ銭クリック追跡を追加

### 概要
比較検討 → 役に立つ → 投げ銭、という流れを分析できるよう、同一セッションのログに投げ銭クリック情報を記録する。

### 変更内容

#### 1. DBマイグレーション
- `comparison_logs` に `donation_clicked` (boolean, default false) と `donation_amount` (integer, nullable) カラムを追加

#### 2. `src/hooks/useComparisonLogger.ts`
- `ComparisonLogData` に `donationClicked` と `donationAmount` を追加
- upsert 時にこれらを含める

#### 3. `src/pages/Index.tsx`
- `donationClicked` / `donationAmount` state を追加
- 各投げ銭リンクの `onClick` で state を更新（300/500/1000）
- `useComparisonLogger` に渡す

#### 4. `src/components/admin/ComparisonAnalytics.tsx`
- サマリーカードに投げ銭クリック数・金額別内訳を表示
- ログテーブルに投げ銭列を追加

### 変更ファイル
| ファイル | 内容 |
|---|---|
| DBマイグレーション | `donation_clicked`, `donation_amount` カラム追加 |
| `src/hooks/useComparisonLogger.ts` | 投げ銭データ送信対応 |
| `src/pages/Index.tsx` | クリック検知 + state管理 |
| `src/components/admin/ComparisonAnalytics.tsx` | 投げ銭分析表示 |

