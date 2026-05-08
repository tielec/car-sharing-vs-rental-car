# 再訪者データの分析対応プラン

## ゴール
URLにクエリパラメータ（`?v=...&h=...`等）が付いた状態でのアクセスを「URL経由訪問（共有URL/再訪の可能性あり）」として識別し、新規訪問と分けて分析できるようにする。

## 方針
- 識別は **URLパラメータの有無** のみで判定（追加のCookie/localStorageは導入しない）
- 過去データも `landing_path` に既に記録されているクエリ文字列から遡及的に分類可能
- 分析画面に「全体 / 新規流入のみ / URL経由訪問のみ」を切り替えるセグメントフィルタを追加

## 実装内容

### 1. データベース変更（マイグレーション）
`comparison_logs` テーブルに次のカラムを追加:
- `has_url_params` (boolean, default false) — 着地時にURLパラメータが付いていたか

加えて、既存データの遡及更新を1回だけ実施:
```text
UPDATE comparison_logs
SET has_url_params = (landing_path LIKE '%?%')
```
※ 現状 `landing_path` は `window.location.pathname` のみを記録しており、クエリは含まれていない。そのため遡及分類のため `landing_path` の記録方法も変更（下記2参照）し、過去データは「不明 = 新規扱い」とする。

### 2. ロギング側変更（`src/hooks/useComparisonLogger.ts`）
- `collectAccessInfo()` で着地時の `window.location.search` の有無を判定し、`has_url_params` として送信
- 併せて `landing_path` を `pathname + search` に変更（今後の詳細分析のため）
- RPC `upsert_comparison_log` に `p_has_url_params` パラメータを追加

### 3. RPC関数更新（マイグレーション内）
`upsert_comparison_log` に `p_has_url_params boolean default false` 引数を追加。INSERT時のみ書き込み（流入元と同様、UPDATEでは上書きしない）。

### 4. 分析画面（`src/components/admin/ComparisonAnalytics.tsx`）
セグメント切替UIを追加:

```text
[セグメント] (●全体) (○新規流入) (○URL経由訪問)
```

- 既存の「操作ありのみ」フィルタの隣にトグルグループとして配置
- 全集計（CVR、推移グラフ4種、流入元、デバイス、最近のログ等）を選択セグメントに応じて再計算
- KPIカード上部に小さく「URL経由訪問: N件 / 全体の X%」を表示し、再訪規模を一目で把握できるようにする

### 5. メモリー更新
`mem://architecture/analytics-logging-strategy` に「URLパラメータ有無で新規/再訪を判別」のルールを追記。

## 影響範囲
- DB: `comparison_logs` に1カラム追加、RPC関数1つ更新
- フロント: ロガー1ファイル + 分析コンポーネント1ファイル
- 既存データ: 遡及分類はできないが、新規データ以降は正確に判別可能
- 計算ロジック・他画面には影響なし
