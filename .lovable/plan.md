## comparison_logs にアクセス元データを追加

### 概要
現状の `comparison_logs` には「どこから来たユーザーか」を示すデータが一切なく、ファネル分析や流入元分析ができません。クライアント側で取得可能な情報を追加し、流入元・デバイス・地域などの分析を可能にします。

### 取得方法の比較

| 種類 | 取得元 | 実装コスト | 注意点 |
|---|---|---|---|
| **リファラー（referrer）** | `document.referrer` | 低 | 検索エンジン・SNS・直接アクセスを判別可能 |
| **UTMパラメータ** | `URLSearchParams` | 低 | キャンペーン計測（utm_source/medium/campaign） |
| **ランディングパス** | `location.pathname` | 低 | 入口ページの把握 |
| **ユーザーエージェント** | `navigator.userAgent` | 低 | デバイス/ブラウザ判別（PC/スマホ） |
| **画面サイズ** | `window.innerWidth` | 低 | レスポンシブ利用実態 |
| **言語/タイムゾーン** | `navigator.language`, `Intl` | 低 | 海外/国内、地域の傾向 |
| **国/都市（IPベース）** | サーバー側で取得 | 中 | エッジ関数化が必要、プライバシー配慮 |

### 推奨スコープ（プライバシー配慮 & 実装コスト最小）

DBに以下のカラムを追加：
- `referrer` (text) - 流入元URL（`document.referrer`）
- `referrer_domain` (text) - ドメインのみ抽出（集計しやすく）
- `utm_source` (text) - キャンペーン流入元
- `utm_medium` (text) - 媒体
- `utm_campaign` (text) - キャンペーン名
- `landing_path` (text) - 着地ページのパス
- `device_type` (text) - `mobile` / `tablet` / `desktop`
- `browser` (text) - 簡易判別（Chrome/Safari/Firefox/Edge/Other）
- `screen_width` (integer) - 初回ロード時の画面幅
- `language` (text) - `navigator.language`（例: `ja`, `en-US`）
- `timezone` (text) - `Intl.DateTimeFormat().resolvedOptions().timeZone`

**国/IPは含めない方針**：
- IPはエッジ関数経由が必要で実装コスト増
- プライバシーポリシーへの追記負担も発生
- timezone+languageで国はある程度推定可能

### 変更内容

#### 1. DBマイグレーション
- `comparison_logs` に上記11カラムを追加（すべてnullable）
- `upsert_comparison_log` 関数のシグネチャを拡張（初回INSERT時のみ流入情報をセットし、UPDATEでは上書きしない）

```sql
-- INSERT時のみ設定、ON CONFLICTでは更新しない
ON CONFLICT (session_id) DO UPDATE SET
  ... (既存フィールドのみ更新)
```

#### 2. `src/hooks/useComparisonLogger.ts`
- 初回マウント時に1回だけアクセス元情報を収集してrefに保持
- `device_type` 判別: `window.matchMedia` + UA
- `browser` 判別: UAから簡易抽出
- UTMは `URLSearchParams(location.search)` から
- referrerドメインは `new URL(document.referrer).hostname`
- RPC呼び出し時にこれらを渡す

#### 3. `src/components/admin/ComparisonAnalytics.tsx`
分析セクションを追加：
- **流入元分析**: referrer_domain TOP / direct（空referrer）/ 検索エンジン / SNS の分類カウント
- **キャンペーン**: utm_source × utm_campaign 集計
- **デバイス内訳**: device_type 円グラフ風カード（mobile/tablet/desktop）
- **ブラウザ内訳**: browser 上位
- **言語/タイムゾーン**: 上位5件
- ログテーブルに「流入元」「デバイス」列を追加

### 変更ファイル

| ファイル | 内容 |
|---|---|
| DBマイグレーション | 11カラム追加 + `upsert_comparison_log` 関数更新 |
| `src/hooks/useComparisonLogger.ts` | アクセス元情報の収集・送信 |
| `src/components/admin/ComparisonAnalytics.tsx` | 流入元・デバイス分析セクション追加 |

### プライバシーへの配慮
- IPアドレスは保存しない
- referrerは標準ブラウザが提供する範囲のみ
- これらは個人特定に直接つながらない情報のみ
- 必要であればプライバシーポリシーへの追記を後続で検討
