# アクセス推移グラフの複合化（CVR追加）

## 目的
4つのアクセス推移タブ（日別・週別・曜日別・時間帯別）すべてを「棒グラフ（総アクセス／操作あり）＋ 折れ線（CVR）」の複合グラフに統一し、右軸でコンバージョン率（操作あり ÷ 総アクセス × 100%）を可視化する。

## 変更箇所
`src/components/admin/ComparisonAnalytics.tsx` のみ。

## 実装内容

### 1. データ整形
各シリーズ（dailySeries / weeklySeries / weekdaySeries / hourlySeries）に `cvr` フィールドを追加。
- 計算: `total > 0 ? (interacted / total) * 100 : 0`
- 小数1桁で保持

### 2. グラフ構造
recharts の `ComposedChart` を使い、以下で統一:

```text
ComposedChart
├─ Bar (yAxisId="left")  総アクセス  primary
├─ Bar (yAxisId="left")  操作あり    foreground
└─ Line(yAxisId="right") CVR(%)     accent / muted-foreground
```

- 左Y軸: 件数（整数）
- 右Y軸: CVR % (0〜100、`unit="%"`)
- Tooltip で CVR は `%` 表記
- 日別タブも棒に統一済みのため、4タブとも同じ構造に揃う

### 3. 視認性
- CVR ラインは色を区別するため新しいトークンを使用（`hsl(var(--accent))` または既存 secondary 系）
- データ点が0/0のとき CVR=0 で表示

## 影響範囲
- 表示のみの変更。既存の集計ロジック・DB・他コンポーネントには影響なし。

