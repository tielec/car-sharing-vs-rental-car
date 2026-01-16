import { useState, useMemo } from "react";
import { Car, Clock, MapPin, Fuel, Banknote } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { VehicleSelector } from "@/components/VehicleSelector";
import { InputField } from "@/components/InputField";
import { PriceCard } from "@/components/PriceCard";
import { ComparisonResult } from "@/components/ComparisonResult";
import { 
  compareServices, 
  type VehicleType,
  carSharePricing,
  rentalCarPricing 
} from "@/lib/pricing";

const Index = () => {
  const [vehicleType, setVehicleType] = useState<VehicleType>("compact");
  const [hours, setHours] = useState(24);
  const [distance, setDistance] = useState(100);
  const [hasRefuel, setHasRefuel] = useState(false);
  const [tollFee, setTollFee] = useState(0);

  const result = useMemo(() => {
    return compareServices(vehicleType, hours, distance, hasRefuel);
  }, [vehicleType, hours, distance, hasRefuel]);

  const carShareItems = [
    { label: "時間料金", value: result.carShare.timeCharge },
    ...(result.carShare.distanceCharge > 0 
      ? [{ label: `距離料金（${distance}km）`, value: result.carShare.distanceCharge }] 
      : []),
    ...(result.carShare.refuelDiscount > 0 
      ? [{ label: "給油・洗車割引", value: result.carShare.refuelDiscount, isDiscount: true }] 
      : []),
    ...(tollFee > 0 
      ? [{ label: "高速料金", value: tollFee }] 
      : []),
    { label: "合計", value: result.carShare.total + tollFee, isTotal: true },
  ];

  const rentalItems = [
    { label: `基本料金（${Math.ceil(hours / 24)}日間）`, value: result.rentalCar.baseCharge },
    { label: `ガソリン代（${distance}km）`, value: result.rentalCar.fuelCharge },
    ...(tollFee > 0 
      ? [{ label: "高速料金", value: tollFee }] 
      : []),
    { label: "合計", value: result.rentalCar.total + tollFee, isTotal: true },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 card-shadow">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">カーシェア vs レンタカー</h1>
              <p className="text-xs text-muted-foreground">料金比較ツール</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Input Section */}
        <section className="bg-card rounded-xl p-5 card-shadow border border-border animate-fade-in">
          <h2 className="text-base font-bold text-foreground mb-5">利用条件を入力</h2>
          
          <div className="space-y-5">
            <VehicleSelector value={vehicleType} onChange={setVehicleType} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="利用時間"
                value={hours}
                onChange={setHours}
                min={1}
                max={240}
                unit="時間"
                icon={Clock}
              />
              <InputField
                label="走行距離"
                value={distance}
                onChange={setDistance}
                min={0}
                max={3000}
                unit="km"
                icon={MapPin}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-4 rounded-lg bg-muted/50 border border-border">
                <Checkbox
                  id="refuel"
                  checked={hasRefuel}
                  onCheckedChange={(checked) => setHasRefuel(checked === true)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label 
                  htmlFor="refuel" 
                  className="text-sm font-medium text-foreground cursor-pointer flex items-center gap-2"
                >
                  <Fuel className="w-4 h-4 text-primary" />
                  給油・洗車をする
                </label>
              </div>
              
              <InputField
                label="高速料金"
                value={tollFee}
                onChange={setTollFee}
                min={0}
                max={100000}
                unit="円"
                icon={Banknote}
                optional
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="space-y-4">
          <h2 className="text-base font-bold text-foreground">料金比較</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PriceCard
              title="タイムズカーシェア"
              variant="carshare"
              items={carShareItems}
              isCheaper={result.cheaper === "carShare"}
            />
            <PriceCard
              title="タイムズレンタカー"
              variant="rental"
              items={rentalItems}
              isCheaper={result.cheaper === "rentalCar"}
            />
          </div>

          <ComparisonResult result={result} />
        </section>

        {/* Info Section */}
        <section className="bg-muted/50 rounded-xl p-5 border border-border text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">料金について</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>カーシェアは6時間超で距離料金（¥{carSharePricing[vehicleType].distanceRate}/km）が発生</li>
            <li>レンタカーのガソリン代は燃費{rentalCarPricing[vehicleType].fuelEfficiency}km/L、¥{rentalCarPricing[vehicleType].fuelPrice}/Lで計算</li>
            <li>実際の料金は時期やプランにより異なる場合があります</li>
          </ul>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 mt-8">
        <div className="container text-center text-xs text-muted-foreground">
          ※ 料金は目安です。正確な料金は各サービスでご確認ください。
        </div>
      </footer>
    </div>
  );
};

export default Index;
