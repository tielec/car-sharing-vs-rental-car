

## ガソリン価格自動取得機能

### 概要
メインページ読み込み時にAPIから全国平均ガソリン価格を自動取得し、`fuelPrice`の初期値として反映する。ボタンや管理画面は不要。

### 実装内容

#### 1. `src/hooks/useGasolinePrice.ts`（新規）
- `useEffect`でページ読み込み時に `https://ichioak.com/stat/gasoline_prices.json` をfetch
- 全都道府県の価格から全国平均を計算（小数点以下四捨五入）
- localStorageにキャッシュ（価格＋取得日時）し、7日以内なら再取得しない
- API取得失敗時はlocalStorageのキャッシュ → YAML設定値の順にフォールバック
- 返り値: `{ price: number, isLoading: boolean, updatedAt: string | null }`

#### 2. `src/pages/Index.tsx`（修正）
- `useGasolinePrice`フックを呼び出し、取得した価格で`fuelPrice`を初期化/更新
- ガソリン価格入力欄の近くに「全国平均価格（自動取得）」と最終更新日を小さく表示
- 出典元（ichioak.com）へのクレジットリンクを表示

### 変更ファイル
| ファイル | 内容 |
|---|---|
| `src/hooks/useGasolinePrice.ts` | 新規: API取得・キャッシュフック |
| `src/pages/Index.tsx` | 修正: フック利用、fuelPrice自動設定 |

