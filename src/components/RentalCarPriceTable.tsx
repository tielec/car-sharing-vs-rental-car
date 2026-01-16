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

export function RentalCarPriceTable() {
  const vehicles = vehicleKeys.map((key) => ({
    key,
    ...settings.rentalCar.vehicles[key],
  }));

  const formatPrice = (price: number) => `¥${price.toLocaleString("ja-JP")}`;

  return (
    <div className="space-y-6">
      {/* 会員料金表 */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">会員料金</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">クラス</TableHead>
                <TableHead className="text-right">6時間</TableHead>
                <TableHead className="text-right">12時間</TableHead>
                <TableHead className="text-right">24時間</TableHead>
                <TableHead className="text-right">追加1時間</TableHead>
                <TableHead className="text-right">追加1日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.key}>
                  <TableCell className="font-medium">
                    <div>{vehicle.name}</div>
                    <div className="text-xs text-muted-foreground">燃費 {vehicle.defaultFuelEfficiency}km/L</div>
                  </TableCell>
                  {vehicle.memberRates.map((rate) => (
                    <TableCell key={rate.maxHours} className="text-right">
                      {formatPrice(rate.price)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">{formatPrice(vehicle.memberExtraHourRate)}</TableCell>
                  <TableCell className="text-right">{formatPrice(vehicle.memberExtraDayRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-sm text-muted-foreground mt-3">
          ※ タイムズクラブ会員・カーシェア会員は会員料金が適用されます
        </p>
      </div>

      {/* 通常料金表 */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">通常料金</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">クラス</TableHead>
                <TableHead className="text-right">6時間</TableHead>
                <TableHead className="text-right">12時間</TableHead>
                <TableHead className="text-right">24時間</TableHead>
                <TableHead className="text-right">追加1時間</TableHead>
                <TableHead className="text-right">追加1日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.key}>
                  <TableCell className="font-medium">
                    <div>{vehicle.name}</div>
                    <div className="text-xs text-muted-foreground">燃費 {vehicle.defaultFuelEfficiency}km/L</div>
                  </TableCell>
                  {vehicle.regularRates.map((rate) => (
                    <TableCell key={rate.maxHours} className="text-right">
                      {formatPrice(rate.price)}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">{formatPrice(vehicle.regularExtraHourRate)}</TableCell>
                  <TableCell className="text-right">{formatPrice(vehicle.regularExtraDayRate)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* 補償オプション */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">補償オプション（1日あたり）</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">クラス</TableHead>
                <TableHead className="text-right">免責補償（CDW）</TableHead>
                <TableHead className="text-right">安心補償（CDW+NOC）</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.key}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell className="text-right">{formatPrice(vehicle.insuranceBasicPerDay)}</TableCell>
                  <TableCell className="text-right">{formatPrice(vehicle.insurancePremiumPerDay)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="text-sm text-muted-foreground mt-3 space-y-1">
          <p>・免責補償（CDW）: 事故時の車両・対物免責額が免除</p>
          <p>・安心補償（CDW+NOC）: 免責補償＋休業補償（NOC）が免除</p>
        </div>
      </div>

      {/* 燃料について */}
      <div className="bg-card rounded-xl p-5 card-shadow border border-border">
        <h3 className="text-lg font-bold text-foreground mb-4">燃料について</h3>
        <p className="text-base text-muted-foreground">
          レンタカーは返却時に満タン返しが基本です。上記料金にガソリン代は含まれていません。
        </p>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[140px]">クラス</TableHead>
                <TableHead className="text-right">想定燃費</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((vehicle) => (
                <TableRow key={vehicle.key}>
                  <TableCell className="font-medium">{vehicle.name}</TableCell>
                  <TableCell className="text-right">{vehicle.defaultFuelEfficiency} km/L</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
