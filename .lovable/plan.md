## 利用データ分析の拡充プラン

`src/components/admin/ComparisonAnalytics.tsx` に時系列の可視化セクションを追加します。Recharts（既に依存に含まれているはず）を使用して、3つのグラフをタブ切り替えで表示します。

### 追加するグラフ（タブ切替）

1. **日別推移（直近30日）** - 折れ線グラフ
   - X軸: 日付、Y軸: アクセス数
   - 「総アクセス数」と「操作あり」の2系列
   - トレンド把握用

2. **週別推移（直近12週）** - 棒グラフ
   - X軸: 週（YYYY-Www）、Y軸: アクセス数
   - 同じく2系列（総数 / 操作あり）

3. **曜日別** - 棒グラフ
   - X軸: 月〜日、Y軸: 平均/合計アクセス数
   - JST基準で曜日を判定
   - どの曜日が活発かを把握

4. **時間帯別（0-23時）** - 棒グラフ
   - X軸: 時刻（JST）、Y軸: アクセス数
   - 利用ピーク時間の把握

### 実装詳細

- **データソース**: 既存の `comparison_logs` テーブルの `created_at` を集計（追加クエリ不要、既に1000件取得済み）
- **時刻処理**: JST（Asia/Tokyo）に変換してから曜日/時間/日/週を計算
- **集計関数**: 既存の `fetchStats` 内で `dailyCounts` / `weeklyCounts` / `weekdayCounts` / `hourlyCounts` を構築
- **UI配置**: 「ファネル分析」と「サマリーカード」の間、または「アクセス元分析」直前に新セクション「📊 アクセス推移」として配置
- **タブUI**: 既存の `@/components/ui/tabs` を使用（4タブ: 日別 / 週別 / 曜日別 / 時間帯別）
- **グラフライブラリ**: `recharts`（shadcn の Chart コンポーネントが既にあるので `@/components/ui/chart` のラッパーを利用）

### 変更ファイル

- `src/components/admin/ComparisonAnalytics.tsx` のみ
  - `LogStats` interface に `dailyCounts` / `weeklyCounts` / `weekdayCounts` / `hourlyCounts` を追加
  - 集計ロジックを `fetchStats` に追加
  - 新セクションのJSX追加（Tabs + Recharts の LineChart / BarChart）

### 補足

- 「操作あり」系列も合わせて表示することで、単なるアクセス数でなくコンバージョン傾向も見えるようにします
- 1000件上限のため、十分なデータが溜まれば後で `select count` ベースのSQL集計（RPC）に切り替える余地あり。今回はクライアント集計で開始します。
