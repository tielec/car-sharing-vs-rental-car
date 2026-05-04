# ユーザー価値拡張プラン（5施策 + 投げ銭ゲート）

A-1, A-2, B-1, B-2, C-1 を実装します。A-2 の「次のアクション」CTA は投げ銭を経由した後に解放する設計にします。

---

## 実装概要

### C-1. プリセット条件ボタン（入力セクション最上部）
利用条件入力の直上に「よくある利用シーン」プリセットを配置。タップ1回で `vehicleType / totalHours / distance / tollFee` を一括セット。

プリセット候補:
- 買い物・送迎: コンパクト / 4h / 30km / 高速0円
- 日帰りドライブ: コンパクト / 8h / 150km / 高速2,000円
- 1泊2日旅行: コンパクト / 36h / 400km / 高速4,000円
- 大人数おでかけ: ミニバン / 8h / 200km / 高速2,000円

ボタン押下時はトースト「プリセットを適用しました」を表示し、`hasInteracted=true` をセット。

### B-2. URL クエリパラメータでの条件共有
- ページロード時、`useSearchParams` で URL を読み取り、入力 state の初期値を上書き（valid な値のみ採用、不正値は default にフォールバック）。
- 入力が変わるたびに URL を debounce (500ms) で `replaceState` 更新。履歴汚染を防ぐため `replace` を使用。
- パラメータ: `v`(vehicle), `h`(totalHours), `d`(distance), `t`(toll), `r`(refuel 0/1), `w`(wash 0/1), `ci`(carShareInsurance 0/1), `m`(member 0/1), `i`(insuranceType)。

### B-1. 比較条件のローカル保存・履歴
- `localStorage` キー `comparisonHistory` に最新10件を保存（FIFO）。
- 保存タイミング: 入力が一定時間（3秒）変わらず、かつ `hasInteracted=true` の時に1件 push（直前と同条件ならスキップ）。
- 履歴UI: 結果セクション下部に「📚 最近の比較条件」アコーディオン。各エントリは「車種・時間・距離・お得側・節約額・日時」を表示し、タップで条件を復元。各行に「削除」「全削除」操作。

### A-1. 結果サマリーカード（シェア＆保存用）
比較結果の直下に新コンポーネント `ResultSummaryCard` を追加。
- 表示内容: 車種、利用時間、距離、カーシェア合計、レンタカー合計、お得側、差額、節約率、損益分岐距離、計算日時。
- アクション3種:
  - 「リンクをコピー」: 現在の URL（B-2 で同期済み）をクリップボードへ。
  - 「テキストをコピー」: 整形済みサマリー文字列をクリップボードへ（X/LINE 投稿想定）。
  - 「画像で保存」: `html-to-image` でカード DOM を PNG 化しダウンロード。
- いずれの操作でもトーストでフィードバック。`comparison_logs` への記録は将来拡張として `share_clicked` フラグを analytics に追加（今回は最低限ローカルで動作）。

### A-2. 「次のアクション」CTA（投げ銭ゲート方式）
比較結果に応じた予約 CTA を表示するが、**投げ銭リンクを1回踏むまではロック**する。

- 既存の Donation セクションを「次のアクション」より上に常設。投げ銭ボタン押下時に `localStorage.setItem("donationUnlocked","1")` をセット（既存 `donationClicked` state も活用）。`donationAmount=0`（スキップ）も用意し、「今は応援しない（CTAを開く）」というセカンダリリンクから解放可能にする（強制ではなくソフトゲート、UX上の体験を損なわない）。
- ロック中の表示:
  - グレーアウトされた CTA カード + 鍵アイコン + 「☕ 応援していただくとリンクが解放されます」メッセージ。投げ銭ボタンへスクロールするヘルパーリンク。
- アンロック後の表示:
  - お得側に応じて主 CTA を強調:
    - カーシェアがお得 → 「タイムズカーシェアで予約する」（公式予約ページへ）
    - レンタカーがお得 → 「タイムズレンタカーで予約する」（公式予約ページへ）
  - 副 CTA として反対側のサービスリンクも小さく表示。
  - 公式リンクは `https://share.timescar.jp/` / `https://rental.timescar.jp/` を想定（要最終確認のため定数化）。
- アンロック状態は `localStorage` で永続化。設定セクションに「ロック状態をリセット」リンクを目立たない場所に置く（任意）。

---

## ファイル構成（追加・編集）

新規:
- `src/components/PresetButtons.tsx` — C-1
- `src/components/ResultSummaryCard.tsx` — A-1
- `src/components/HistoryList.tsx` — B-1 表示
- `src/components/NextActionCTA.tsx` — A-2（ゲート含む）
- `src/hooks/useUrlSync.ts` — B-2 双方向同期
- `src/hooks/useComparisonHistory.ts` — B-1 localStorage CRUD
- `src/hooks/useDonationUnlock.ts` — A-2 アンロック state

編集:
- `src/pages/Index.tsx` — 上記コンポーネント配置・状態接続
- `src/hooks/useComparisonLogger.ts` — `share_clicked`, `cta_clicked` 任意追加（後続フェーズでも可）

依存追加:
- `html-to-image`（A-1 の PNG 出力用、軽量）

---

## 配置順（compare タブ内）

```text
[料金比較タブ]
 ├─ プリセットボタン (C-1)
 ├─ 利用条件入力（既存）
 ├─ 価格カード（既存）
 ├─ ComparisonResult（既存）
 ├─ ResultSummaryCard (A-1)  ← シェア/保存
 ├─ PriceComparisonChart（既存）
 ├─ BreakEvenMessage（既存）
 ├─ Donation（既存・文言を「CTA解放」に微調整）
 ├─ NextActionCTA (A-2)      ← 投げ銭ゲート
 ├─ HistoryList (B-1)
 └─ Info（既存）
```

---

## 注意点

- B-2 の URL 同期は初期ロード時 1 回 + 変更時 debounce で `history.replaceState` を使い、戻るボタンが暴走しないようにする。
- A-2 の公式予約 URL は実装時にユーザーに最終確認（仮置き定数 `RESERVATION_URLS` を1ファイルに集約）。
- ゲートはあくまで UX 上のソフトゲート（HTML 直接編集すれば回避可）であり、課金システムではない旨をコメントで明記。
- 既存の analytics/RPC 構造は破壊しない。新フラグ追加が必要な場合は別フェーズでマイグレーション。

承認いただければ、上記の順序で実装します。
