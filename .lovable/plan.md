

## 定期自動取得オン時のAPI呼び出しスキップ

### 概要
`app_settings` の `auto_fetch_gasoline_price` が `"true"` の場合、`useGasolinePrice` フックでの直接API呼び出し（ステップ3）をスキップします。定期実行が価格を管理しているため、クライアントからの重複取得は不要です。

### 変更内容

**`src/hooks/useGasolinePrice.ts`** のみ修正:

1. `load()` 関数内で、オーバーライドが見つからなかった場合に `app_settings` テーブルから `auto_fetch_gasoline_price` の値を取得
2. 値が `"true"` の場合、キャッシュがあればキャッシュを使用、なければデフォルト値のままAPI呼び出しをスキップ
3. `"false"` の場合のみ従来通りEdge Function経由でAPIから価格を取得

### ロジックフロー（変更後）

```text
1. DB: active override あり → その価格を使用（終了）
2. DB: auto_fetch_gasoline_price == "true"
   → キャッシュあり → キャッシュ使用（終了）
   → キャッシュなし → デフォルト値のまま（終了）
3. auto_fetch == "false" かつ キャッシュ有効 → キャッシュ使用（終了）
4. auto_fetch == "false" かつ キャッシュ無効 → API取得
```

