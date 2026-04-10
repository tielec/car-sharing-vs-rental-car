

## 比較データ分析機能の実装計画

### 課題
ログイン不要・リアルタイム自動計算のため、「いつ」データを記録するかが難しい。

### 解決策: デバウンス方式
ユーザーが入力を変更し、**3秒間操作が止まった時点**で1レコード記録する。ページロードごとにランダムなセッションIDを生成し、同一セッション内では最新の入力で上書き（UPSERT）することで重複を防ぐ。

```text
入力変更 → 3秒待機（変更があればリセット）→ DB記録（UPSERT by session_id）
```

### 実装内容

#### 1. DBテーブル: `comparison_logs`
| カラム | 型 | 説明 |
|---|---|---|
| id | uuid PK | |
| session_id | text UNIQUE | ページロードごとのランダムID |
| vehicle_type | text | 車種 |
| total_hours | int | 利用時間 |
| distance | int | 走行距離 |
| toll_fee | int | 高速料金 |
| has_refuel | bool | 給油 |
| has_wash | bool | 洗車 |
| has_car_share_insurance | bool | カーシェア補償 |
| is_member | bool | レンタカー会員 |
| insurance_type | text | レンタカー補償 |
| cheaper_service | text | 結果（carShare/rentalCar） |
| created_at | timestamptz | 初回記録時刻 |
| updated_at | timestamptz | 最終更新時刻 |

- RLS: 匿名（anon）でINSERT/UPDATE可、SELECTは管理者のみ
- ログインなしで書き込めるようにする

#### 2. `src/hooks/useComparisonLogger.ts`（新規）
- ページロード時に `crypto.randomUUID()` でセッションID生成
- 入力値と比較結果をdeps にした `useEffect` + `setTimeout(3000)` でデバウンス
- Supabase の `upsert` で `session_id` をキーに記録

#### 3. `src/pages/Index.tsx`（修正）
- `useComparisonLogger` フックを呼び出すだけ（1行追加）

#### 4. 管理画面 `src/pages/Admin.tsx`（修正）
- 「利用データ分析」セクションを追加
- 直近のログ件数、人気の車種・時間帯・距離帯の集計表示

### 変更ファイル一覧
| ファイル | 内容 |
|---|---|
| DBマイグレーション | `comparison_logs` テーブル作成 + RLSポリシー |
| `src/hooks/useComparisonLogger.ts` | 新規: デバウンス記録フック |
| `src/pages/Index.tsx` | フック呼び出し追加 |
| `src/pages/Admin.tsx` | データ分析UIセクション追加 |

### セキュリティ
- 個人情報は一切記録しない（IPアドレスも取得しない）
- 書き込みは匿名可だが、閲覧は管理者のみ

