import { settings } from "@/config";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const vehicleKeys = ["compact", "compactMinivan", "minivan"] as const;

export function CarSharePriceTable() {
  const vehicles = vehicleKeys.map((key) => ({
    key,
    ...settings.carShare.vehicles[key],
  }));

  const formatPrice = (price: number) => `¥${price.toLocaleString("ja-JP")}`;

  return (
    <div className="space-y-6">
      {/* 時間料金表 */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">時間料金</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">クラス</TableHead>
                <TableHead className="text-right">15分</TableHead>
                <TableHead className="text-right">6時間</TableHead>
                <TableHead className="text-right">12時間</TableHead>
                <TableHead className="text-right">24時間</TableHead>
                <TableHead className="text-right">36時間</TableHead>
                <TableHead className="text-right">48時間</TableHead>
                <TableHead className="text-right">72時間</TableHead>
                <TableHead className="text-right">追加1日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.key}>
                  <TableCell className="font-medium">
                    <div>{vehicle.name}</div>
                    <div className="text-xs text-muted-foreground">{vehicle.description}</div>
                  </TableCell>
                  <TableCell className="text-right">{formatPrice(vehicle.rate15min)}</TableCell>
                  {vehicle.maxRates.map((rate) => (
                    <TableCell key={rate.maxHours} className="text-right">
                      {formatPrice(rate.maxPrice)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">{formatPrice(vehicle.dailyRateAfter72h)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          ※ 15分単位で課金され、各時間帯の最大料金を超えません
        </p>
      </div>

      {/* 距離料金 */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">距離料金</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[100px]">クラス</TableHead>
                <TableHead className="text-right">距離料金</TableHead>
                <TableHead>備考</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.key}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell className="text-right">{formatPrice(vehicle.distanceRate)}/km</TableCell>
                  <TableCell className="text-muted-foreground">
                    {settings.carShare.distanceChargeThresholdKm}km超過分から課金
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 割引・オプション */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">割引・オプション</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">給油・洗車割引</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>サービス</TableHead>
                    <TableHead className="text-right">割引時間</TableHead>
                    <TableHead>割引目安（15分料金×分数）</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">給油のみ（20L以上）</TableCell>
                    <TableCell className="text-right">{settings.carShare.discountMinutes.refuelOnly}分</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicles.map((v) => `${v.name}: ${formatPrice((v.rate15min / 15) * settings.carShare.discountMinutes.refuelOnly)}`).join(" / ")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">洗車のみ</TableCell>
                    <TableCell className="text-right">{settings.carShare.discountMinutes.washOnly}分</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicles.map((v) => `${v.name}: ${formatPrice((v.rate15min / 15) * settings.carShare.discountMinutes.washOnly)}`).join(" / ")}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">給油＋洗車</TableCell>
                    <TableCell className="text-right">{settings.carShare.discountMinutes.refuelAndWash}分</TableCell>
                    <TableCell className="text-muted-foreground">
                      {vehicles.map((v) => `${v.name}: ${formatPrice((v.rate15min / 15) * settings.carShare.discountMinutes.refuelAndWash)}`).join(" / ")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-2">安心補償サービス</h4>
            <p className="text-base text-foreground">
              {formatPrice(settings.carShare.insurancePerUse)} / 1利用
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              事故時の自己負担（NOC・免責）が免除されます
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
