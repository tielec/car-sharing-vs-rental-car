# クリック前ミニ確認モーダル実装

## ゴール
投げ銭ボタン → 即 Stripe 遷移をやめ、間に確認モーダルを挟むことで「Stripeへの不信感」と「誤クリック離脱」を減らす。

## 仕様

### トリガー
`src/pages/Index.tsx` の300円/500円/1000円の `<a href="...">` ボタン3つを `<button>` 化し、クリックでモーダルを開く。

### モーダル内容（shadcn `Dialog` を流用）

```text
┌─────────────────────────────────┐
│  ☕ 開発を応援する               │
│                                 │
│  500円で応援します              │
│                                 │
│  次の画面で安全な決済（Stripe） │
│  にてお支払いいただきます。     │
│  ・カード / Apple Pay / Google Pay 対応 │
│  ・登録不要・1回限りの決済      │
│                                 │
│   [キャンセル]  [決済画面へ進む]│
└─────────────────────────────────┘
```

- タイトル: `☕ 開発を応援する`
- 金額表示: 大きめ太字で「{amount}円で応援します」
- 説明文（小さめ）: 「次の画面で安全な決済サービス（Stripe）にてお支払いいただきます」「カード / Apple Pay / Google Pay 対応」「登録不要 / 1回限り」
- ボタン:
  - 「キャンセル」(variant=outline) → モーダル閉じる
  - 「決済画面へ進む」(variant=default, primary色) → Stripe Payment Link を新規タブで開く + モーダル閉じる

### 既存挙動の維持
「決済画面へ進む」を押した時点で、現在の `onClick` と同じ処理を実行する：
- `setDonationClicked(true)`
- `setDonationAmount(amount)`
- `unlock()`（Next-Action CTA 解放）
- `window.open(stripeUrl, "_blank", "noopener,noreferrer")`

→ つまり「決済画面に進んだ」ことを既存の `donation_clicked` として記録（仕様変更なし）。キャンセル時は何も記録しない。

### コンポーネント設計
新規ファイル：`src/components/DonationConfirmDialog.tsx`

Props:
```text
- open: boolean
- onOpenChange: (open: boolean) => void
- amount: number | null     // 表示金額
- stripeUrl: string | null  // 進む先
- onConfirm: () => void     // 親側で donationClicked / unlock 等を実行
```

Index.tsx 側の状態:
```text
const [donationDialog, setDonationDialog] = useState<{
  open: boolean;
  amount: number | null;
  url: string | null;
}>({ open: false, amount: null, url: null });
```

各金額ボタンの onClick は `setDonationDialog({ open: true, amount, url })` のみを行う。

## 影響範囲
- 編集: `src/pages/Index.tsx`（投げ銭セクションのボタン3つを書き換え + ダイアログ呼び出し追加）
- 新規: `src/components/DonationConfirmDialog.tsx`
- 計測仕様・DB・他コンポーネント: 変更なし

## 範囲外（今回はやらない）
- Webhook による決済完了計測
- 100円ボタン / 任意金額
- Stripe Payment Link 側の設定変更（Apple Pay 有効化等は Stripe ダッシュボードで別途実施）
