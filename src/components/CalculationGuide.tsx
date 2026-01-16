import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { settings } from "@/config";

export function CalculationGuide() {
  const { carShare, rentalCar } = settings;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">計算の仕組み</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            このツールで使用している料金計算ロジックの詳細を解説します。
            実際の請求額とは異なる場合がありますので、正確な料金は公式サイトでご確認ください。
          </p>
        </CardContent>
      </Card>

      <Accordion type="multiple" defaultValue={["carshare", "rental", "breakeven"]} className="space-y-4">
        {/* カーシェア料金 */}
        <AccordionItem value="carshare" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            カーシェア料金の計算方法
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* 時間料金 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">1. 時間料金</h4>
              <p className="text-sm text-muted-foreground">
                15分単位で課金され、利用時間に応じて最大料金が適用されます。
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">計算ロジック（段階制）:</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>利用時間に対して15分ごとに料金を加算</li>
                  <li>各段階（6h/12h/24h/36h/48h/72h）の最大料金に達したら、その額で止まる</li>
                  <li>次の段階では、前の段階の最大料金に15分料金を積み上げていく</li>
                  <li>72時間を超えた場合は、72h最大料金 + 追加日数 × 1日料金</li>
                </ol>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>クラス</TableHead>
                      <TableHead className="text-right">15分料金</TableHead>
                      <TableHead className="text-right">6h最大</TableHead>
                      <TableHead className="text-right">12h最大</TableHead>
                      <TableHead className="text-right">24h最大</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(carShare.vehicles).map(([key, vehicle]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell className="text-right">{vehicle.rate15min}円</TableCell>
                        <TableCell className="text-right">{vehicle.maxRates.find(m => m.maxHours === 6)?.maxPrice.toLocaleString()}円</TableCell>
                        <TableCell className="text-right">{vehicle.maxRates.find(m => m.maxHours === 12)?.maxPrice.toLocaleString()}円</TableCell>
                        <TableCell className="text-right">{vehicle.maxRates.find(m => m.maxHours === 24)?.maxPrice.toLocaleString()}円</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">計算例: ベーシッククラス 8時間利用</p>
                <div className="text-sm font-mono space-y-1">
                  <p>• 6時間まで: 最大料金 4,490円 が適用</p>
                  <p>• 6〜8時間の2時間分: 220円 × 8コマ = 1,760円</p>
                  <p>• 合計: 4,490 + 1,760 = 6,250円</p>
                  <p>• ただし12h最大料金 6,490円 を超えないため → <strong>6,250円</strong></p>
                </div>
              </div>
            </section>

            {/* 距離料金 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">2. 距離料金</h4>
              <p className="text-sm text-muted-foreground">
                走行距離が{carShare.distanceChargeThresholdKm}kmを超えた場合、超過分に対して課金されます。
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  距離料金 = (走行距離 - {carShare.distanceChargeThresholdKm}km) × 20円/km
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  例: 100km走行 → (100 - 20) × 20 = 1,600円
                </p>
              </div>
            </section>

            {/* 給油・洗車割引 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">3. 給油・洗車割引</h4>
              <p className="text-sm text-muted-foreground">
                給油（20L以上）や洗車を行うと、時間料金から割引が適用されます。
              </p>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>サービス</TableHead>
                      <TableHead className="text-right">割引時間</TableHead>
                      <TableHead className="text-right">ベーシック</TableHead>
                      <TableHead className="text-right">ミドル</TableHead>
                      <TableHead className="text-right">プレミアム</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>給油のみ</TableCell>
                      <TableCell className="text-right">{carShare.discountMinutes.refuelOnly}分</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.compact.rate15min * 2}円</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.compactMinivan.rate15min * 2}円</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.minivan.rate15min * 2}円</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>洗車のみ</TableCell>
                      <TableCell className="text-right">{carShare.discountMinutes.washOnly}分</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.compact.rate15min * 2}円</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.compactMinivan.rate15min * 2}円</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.minivan.rate15min * 2}円</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>給油＋洗車</TableCell>
                      <TableCell className="text-right">{carShare.discountMinutes.refuelAndWash}分</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.compact.rate15min * 4}円</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.compactMinivan.rate15min * 4}円</TableCell>
                      <TableCell className="text-right">{carShare.vehicles.minivan.rate15min * 4}円</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* 安心補償 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">4. 安心補償サービス</h4>
              <p className="text-sm text-muted-foreground">
                任意加入の補償サービスです。1利用あたり固定料金が加算されます。
              </p>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  安心補償サービス = {carShare.insurancePerUse.toLocaleString()}円/利用
                </p>
              </div>
            </section>

            {/* 合計 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">5. 合計料金</h4>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  合計 = 時間料金 - 割引 + 距離料金 + 安心補償 + 高速代
                </p>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* レンタカー料金 */}
        <AccordionItem value="rental" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            レンタカー料金の計算方法
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-4">
            {/* 基本料金 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">1. 基本料金</h4>
              <p className="text-sm text-muted-foreground">
                利用時間に応じた段階制料金です。会員/非会員で料金が異なります。
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">計算ロジック:</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>6時間まで: 6h料金</li>
                  <li>12時間まで: 12h料金</li>
                  <li>24時間まで: 24h料金</li>
                  <li>24時間超: 24h料金 + 追加時間分</li>
                </ol>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">24時間超の計算（追加時間）:</p>
                <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                  <li>追加1時間ごとに追加時間料金を加算</li>
                  <li>追加時間料金の合計が追加日料金に達したら、追加日料金で止まる</li>
                  <li>次の24時間も同様に計算</li>
                </ol>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">計算例: C1クラス会員 30時間利用</p>
                <div className="text-sm font-mono space-y-1">
                  <p>• 24時間まで: 7,084円</p>
                  <p>• 追加6時間: 844円 × 6 = 5,064円</p>
                  <p>• 合計: 7,084 + 5,064 = <strong>12,148円</strong></p>
                </div>
              </div>

              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">計算例: C1クラス会員 48時間利用</p>
                <div className="text-sm font-mono space-y-1">
                  <p>• 24時間まで: 7,084円</p>
                  <p>• 追加24時間: 追加日料金 6,336円（上限適用）</p>
                  <p>• 合計: 7,084 + 6,336 = <strong>13,420円</strong></p>
                </div>
              </div>
            </section>

            {/* ガソリン代 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">2. ガソリン代</h4>
              <p className="text-sm text-muted-foreground">
                レンタカーは満タン返しが基本です。走行距離と燃費から推定ガソリン代を計算します。
              </p>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  ガソリン代 = 走行距離 ÷ 燃費(km/L) × ガソリン単価(円/L)
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  例: 100km ÷ 18km/L × 145円/L ≒ 806円
                </p>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>クラス</TableHead>
                      <TableHead className="text-right">デフォルト燃費</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(rentalCar.vehicles).map(([key, vehicle]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell className="text-right">{vehicle.defaultFuelEfficiency}km/L</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>

            {/* 補償オプション */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">3. 補償オプション</h4>
              <p className="text-sm text-muted-foreground">
                任意加入の補償プランです。利用日数分が加算されます。
              </p>
              
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>クラス</TableHead>
                      <TableHead className="text-right">免責補償（基本）</TableHead>
                      <TableHead className="text-right">安心補償（プレミアム）</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(rentalCar.vehicles).map(([key, vehicle]) => (
                      <TableRow key={key}>
                        <TableCell className="font-medium">{vehicle.name}</TableCell>
                        <TableCell className="text-right">{vehicle.insuranceBasicPerDay.toLocaleString()}円/日</TableCell>
                        <TableCell className="text-right">{vehicle.insurancePremiumPerDay.toLocaleString()}円/日</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  補償料金 = 1日あたり補償料金 × 利用日数（端数切り上げ）
                </p>
              </div>
            </section>

            {/* 合計 */}
            <section className="space-y-3">
              <h4 className="font-semibold text-base">4. 合計料金</h4>
              <div className="bg-primary/10 p-4 rounded-lg">
                <p className="text-sm font-mono">
                  合計 = 基本料金 + ガソリン代 + 補償料金 + 高速代
                </p>
              </div>
            </section>
          </AccordionContent>
        </AccordionItem>

        {/* 損益分岐点 */}
        <AccordionItem value="breakeven" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            損益分岐点の計算
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              損益分岐点とは、カーシェアとレンタカーの料金が等しくなる走行距離のことです。
            </p>
            
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">計算方法:</p>
              <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
                <li>0km〜1000kmの範囲で二分探索を実施</li>
                <li>各距離で両サービスの料金を計算して比較</li>
                <li>料金差が10円以内になる距離を損益分岐点とする</li>
                <li>分岐点が見つからない場合は「常にどちらかがお得」と判定</li>
              </ol>
            </div>

            <div className="bg-primary/10 p-4 rounded-lg space-y-2">
              <p className="text-sm font-medium">表示パターン:</p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li><strong>「あとXkm走ると逆転」</strong>: 現在の距離から損益分岐点までの距離</li>
                <li><strong>「Xkm前に逆転済み」</strong>: 損益分岐点を過ぎた距離</li>
                <li><strong>「常にカーシェア/レンタカーがお得」</strong>: 分岐点が存在しない</li>
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 注意事項 */}
        <AccordionItem value="notes" className="border rounded-lg px-4">
          <AccordionTrigger className="text-lg font-semibold">
            注意事項
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-4">
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-2">
              <li>本ツールの計算結果は参考値です。実際の料金は公式サイトでご確認ください。</li>
              <li>料金は予告なく変更される場合があります。</li>
              <li>キャンペーン割引、クーポン、ポイント利用等は考慮していません。</li>
              <li>延長料金、ペナルティ料金等は計算に含まれていません。</li>
              <li>ナイトパック等の特別プランは考慮していません。</li>
              <li>ガソリン代は燃費と単価から推定した概算値です。</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
