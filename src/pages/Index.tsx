import { useState, useMemo } from "react";
import { Car, MapPin, Fuel, Banknote, Settings as SettingsIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { VehicleSelector } from "@/components/VehicleSelector";
import { InputField } from "@/components/InputField";
import { DurationInput } from "@/components/DurationInput";
import { PriceCard } from "@/components/PriceCard";
import { ComparisonResult } from "@/components/ComparisonResult";
import { compareServices, type VehicleType } from "@/lib/pricing";
import { settings, getCarShareVehicle, getRentalCarVehicle } from "@/config";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const Index = () => {
  // Use defaults from YAML config
  const [vehicleType, setVehicleType] = useState<VehicleType>(settings.defaults.vehicleType);
  const [totalHours, setTotalHours] = useState(settings.defaults.days * 24 + settings.defaults.hours);
  const [distance, setDistance] = useState(settings.defaults.distance);
  const [hasRefuel, setHasRefuel] = useState(settings.defaults.hasRefuel);
  const [tollFee, setTollFee] = useState(settings.defaults.tollFee);
  
  // User-configurable fuel settings
  const rentalVehicle = getRentalCarVehicle(vehicleType);
  const [fuelPrice, setFuelPrice] = useState(settings.defaults.fuelPrice);
  const [fuelEfficiency, setFuelEfficiency] = useState(rentalVehicle.defaultFuelEfficiency);

  // Update fuel efficiency when vehicle type changes
  const handleVehicleChange = (type: VehicleType) => {
    setVehicleType(type);
    setFuelEfficiency(getRentalCarVehicle(type).defaultFuelEfficiency);
  };

  const result = useMemo(() => {
    return compareServices(vehicleType, totalHours, distance, hasRefuel, fuelPrice, fuelEfficiency);
  }, [vehicleType, totalHours, distance, hasRefuel, fuelPrice, fuelEfficiency]);

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
    { label: `基本料金（${Math.ceil(totalHours / 24)}日間）`, value: result.rentalCar.baseCharge },
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
            <VehicleSelector value={vehicleType} onChange={handleVehicleChange} />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DurationInput
                totalHours={totalHours}
                onChange={setTotalHours}
                maxDays={10}
              />
              <InputField
                label="走行距離"
                value={distance}
                onChange={setDistance}
                min={settings.limits.distance.min}
                max={settings.limits.distance.max}
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
                min={settings.limits.tollFee.min}
                max={settings.limits.tollFee.max}
                unit="円"
                icon={Banknote}
                optional
              />
            </div>

            {/* Fuel Settings */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <SettingsIcon className="w-4 h-4" />
                燃料設定を変更
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <InputField
                    label="ガソリン単価"
                    value={fuelPrice}
                    onChange={setFuelPrice}
                    min={100}
                    max={300}
                    unit="円/L"
                    icon={Fuel}
                  />
                  <InputField
                    label="想定燃費"
                    value={fuelEfficiency}
                    onChange={setFuelEfficiency}
                    min={5}
                    max={30}
                    unit="km/L"
                    icon={Car}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
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
            <li>カーシェアは{settings.carShare.distanceChargeThreshold}時間超で距離料金（¥{getCarShareVehicle(vehicleType).distanceRate}/km）が発生</li>
            <li>レンタカーのガソリン代は燃費{fuelEfficiency}km/L、¥{fuelPrice}/Lで計算</li>
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
