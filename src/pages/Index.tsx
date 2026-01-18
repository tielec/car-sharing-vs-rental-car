import { useState, useMemo } from "react";
import { Car, MapPin, Fuel, Banknote, Settings as SettingsIcon, Droplets, Shield, Users } from "lucide-react";
import heroCover from "@/assets/hero-cover.png";
import { Checkbox } from "@/components/ui/checkbox";
import { VehicleSelector } from "@/components/VehicleSelector";
import { InputField } from "@/components/InputField";
import { DurationInput } from "@/components/DurationInput";
import { PriceCard } from "@/components/PriceCard";
import { ComparisonResult, BreakEvenMessage } from "@/components/ComparisonResult";
import { compareServices, generatePriceProgressionData, generateTimeProgressionData, type VehicleType, type InsuranceType } from "@/lib/pricing";
import { PriceComparisonChart } from "@/components/PriceComparisonChart";
import { settings, getCarShareVehicle, getRentalCarVehicle, getInsuranceName } from "@/config";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarSharePriceTable } from "@/components/CarSharePriceTable";
import { RentalCarPriceTable } from "@/components/RentalCarPriceTable";
import { CalculationGuide } from "@/components/CalculationGuide";

const Index = () => {
  // Use defaults from YAML config
  const [vehicleType, setVehicleType] = useState<VehicleType>(settings.defaults.vehicleType);
  const [totalHours, setTotalHours] = useState(settings.defaults.days * 24 + settings.defaults.hours);
  const [distance, setDistance] = useState(settings.defaults.distance);
  const [hasRefuel, setHasRefuel] = useState(settings.defaults.hasRefuel);
  const [hasWash, setHasWash] = useState(settings.defaults.hasWash);
  const [hasCarShareInsurance, setHasCarShareInsurance] = useState(false);
  const [tollFee, setTollFee] = useState(settings.defaults.tollFee);
  
  // Rental car specific settings
  const [isMember, setIsMember] = useState(settings.defaults.isMember);
  const [insuranceType, setInsuranceType] = useState<InsuranceType>(settings.defaults.insuranceType);
  
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
    return compareServices(vehicleType, totalHours, distance, hasRefuel, hasWash, hasCarShareInsurance, fuelPrice, fuelEfficiency, isMember, insuranceType);
  }, [vehicleType, totalHours, distance, hasRefuel, hasWash, hasCarShareInsurance, fuelPrice, fuelEfficiency, isMember, insuranceType]);

  const distanceChartData = useMemo(() => {
    return generatePriceProgressionData(
      vehicleType, totalHours, hasRefuel, hasWash, hasCarShareInsurance,
      fuelPrice, fuelEfficiency, isMember, insuranceType, distance
    );
  }, [vehicleType, totalHours, hasRefuel, hasWash, hasCarShareInsurance, fuelPrice, fuelEfficiency, isMember, insuranceType, distance]);

  const timeChartData = useMemo(() => {
    return generateTimeProgressionData(
      vehicleType, distance, hasRefuel, hasWash, hasCarShareInsurance,
      fuelPrice, fuelEfficiency, isMember, insuranceType, totalHours
    );
  }, [vehicleType, distance, hasRefuel, hasWash, hasCarShareInsurance, fuelPrice, fuelEfficiency, isMember, insuranceType, totalHours]);

  // Calculate discount label
  const getDiscountLabel = () => {
    if (hasRefuel && hasWash) return "給油・洗車割引（60分）";
    if (hasRefuel) return "給油割引（30分）";
    if (hasWash) return "洗車割引（30分）";
    return "";
  };

  // Calculate days for display
  const days = Math.max(1, Math.ceil(totalHours / 24));

  // Get time tier label for rental
  const getRentalTimeLabel = () => {
    if (totalHours <= 6) return "6時間";
    if (totalHours <= 12) return "12時間";
    if (totalHours <= 24) return "24時間";
    return `24時間 + ${days - 1}日`;
  };

  const carShareItems = [
    { label: "時間料金", value: result.carShare.timeCharge },
    ...(result.carShare.distanceCharge > 0 
      ? [{ label: `距離料金（${distance}km）`, value: result.carShare.distanceCharge }] 
      : []),
    ...(result.carShare.serviceDiscount > 0 
      ? [{ label: getDiscountLabel(), value: result.carShare.serviceDiscount, isDiscount: true }] 
      : []),
    ...(result.carShare.insuranceCharge > 0 
      ? [{ label: "安心補償サービス", value: result.carShare.insuranceCharge }] 
      : []),
    ...(tollFee > 0 
      ? [{ label: "高速料金", value: tollFee }] 
      : []),
    { label: "合計", value: result.carShare.total + tollFee, isTotal: true },
  ];

  const rentalItems = [
    { label: `基本料金（${getRentalTimeLabel()}）`, value: result.rentalCar.baseCharge },
    { label: `ガソリン代（${distance}km）`, value: result.rentalCar.fuelCharge },
    ...(result.rentalCar.insuranceCharge > 0 
      ? [{ label: `${getInsuranceName(insuranceType)}（${days}日）`, value: result.rentalCar.insuranceCharge }] 
      : []),
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
              <h1 className="text-xl font-bold text-foreground">タイムズカーシェア vs タイムズレンタカー</h1>
              <p className="text-sm text-muted-foreground">料金比較ツール</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        {/* Hero Cover Image */}
        <section className="animate-fade-in">
          <img 
            src={heroCover} 
            alt="カーシェア vs レンタカー比較" 
            className="w-full h-auto rounded-xl border border-border card-shadow"
          />
        </section>

        {/* Tool Description */}
        <section className="bg-muted/50 rounded-xl p-5 border border-border animate-fade-in">
          <h2 className="text-lg font-semibold text-foreground mb-2">このツールについて</h2>
          <p className="text-sm text-destructive font-medium mb-2">
            ※ 本ツールは非公式のサービスです。タイムズモビリティ株式会社とは一切関係ありません。
          </p>
          <p className="text-base text-muted-foreground leading-relaxed">
            タイムズカーシェアとタイムズレンタカーの料金を比較できるツールです。
            利用時間・走行距離・車種を入力すると、それぞれの概算料金と、どちらがお得かを自動計算します。
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>時間・距離に応じた料金を自動計算</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>ガソリン代・高速料金も考慮</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>損益分岐点の距離を表示</span>
            </li>
          </ul>
        </section>

        {/* Tabs for different views */}
        <Tabs defaultValue="compare" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1 mb-6">
            <TabsTrigger value="compare" className="text-xs sm:text-sm py-2">料金比較</TabsTrigger>
            <TabsTrigger value="carshare" className="text-xs sm:text-sm py-2">カーシェア料金表</TabsTrigger>
            <TabsTrigger value="rental" className="text-xs sm:text-sm py-2">レンタカー料金表</TabsTrigger>
            <TabsTrigger value="guide" className="text-xs sm:text-sm py-2">計算の仕組み</TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="compare" className="space-y-6">
            {/* Input Section */}
            <section className="bg-card rounded-xl p-5 card-shadow border border-border animate-fade-in">
              <h2 className="text-lg font-bold text-foreground mb-5">利用条件を入力</h2>
              
              <div className="space-y-5">
                <VehicleSelector value={vehicleType} onChange={handleVehicleChange} />
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <DurationInput
                    totalHours={totalHours}
                    onChange={setTotalHours}
                    maxDays={10}
                  />
                  <div className="space-y-1.5">
                    <InputField
                      label="走行距離"
                      value={distance}
                      onChange={setDistance}
                      min={settings.limits.distance.min}
                      max={settings.limits.distance.max}
                      unit="km"
                      icon={MapPin}
                    />
                    <p className="text-sm text-muted-foreground pl-1">
                      東京発の目安: 箱根往復 約180km / 軽井沢往復 約300km
                    </p>
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

                {/* Service-specific Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Car Share Settings */}
                  <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-base font-medium text-foreground">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      カーシェア設定
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="refuel"
                        checked={hasRefuel}
                        onCheckedChange={(checked) => setHasRefuel(checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label 
                        htmlFor="refuel" 
                        className="text-base font-medium text-foreground cursor-pointer flex items-center gap-2"
                      >
                        <Fuel className="w-4 h-4 text-primary" />
                        給油をする（20L以上）
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="wash"
                        checked={hasWash}
                        onCheckedChange={(checked) => setHasWash(checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label 
                        htmlFor="wash" 
                        className="text-base font-medium text-foreground cursor-pointer flex items-center gap-2"
                      >
                        <Droplets className="w-4 h-4 text-primary" />
                        水洗い洗車をする
                      </label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="carShareInsurance"
                        checked={hasCarShareInsurance}
                        onCheckedChange={(checked) => setHasCarShareInsurance(checked === true)}
                        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <label 
                        htmlFor="carShareInsurance" 
                        className="text-base font-medium text-foreground cursor-pointer flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4 text-primary" />
                        安心補償サービス（{settings.carShare.insurancePerUse.toLocaleString()}円）
                      </label>
                    </div>
                  </div>

                  {/* Rental Car Settings */}
                  <div className="flex flex-col gap-3 p-4 rounded-lg bg-muted/30 border border-border">
                    <div className="flex items-center gap-2 text-base font-medium text-foreground">
                      <Car className="w-4 h-4 text-muted-foreground" />
                      レンタカー設定
                    </div>
                    
                    {/* Membership Type */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        料金プラン
                      </div>
                      <RadioGroup 
                        value={isMember ? "member" : "regular"} 
                        onValueChange={(v) => setIsMember(v === "member")}
                        className="flex gap-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="member" id="member" />
                          <Label htmlFor="member" className="text-base cursor-pointer">会員料金</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="regular" id="regular" />
                          <Label htmlFor="regular" className="text-base cursor-pointer">通常料金</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Insurance Type */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Shield className="w-4 h-4" />
                        補償オプション
                      </div>
                      <RadioGroup 
                        value={insuranceType} 
                        onValueChange={(v) => setInsuranceType(v as InsuranceType)}
                        className="flex flex-wrap gap-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="none" id="ins-none" />
                          <Label htmlFor="ins-none" className="text-base cursor-pointer">なし</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="basic" id="ins-basic" />
                          <Label htmlFor="ins-basic" className="text-base cursor-pointer">免責補償</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="premium" id="ins-premium" />
                          <Label htmlFor="ins-premium" className="text-base cursor-pointer">安心補償</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>


                {/* Fuel Settings */}
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-base text-muted-foreground hover:text-foreground transition-colors">
                    <SettingsIcon className="w-5 h-5" />
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
              <h2 className="text-lg font-bold text-foreground">料金比較</h2>
              
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

              <PriceComparisonChart 
                distanceData={distanceChartData}
                timeData={timeChartData}
                currentDistance={distance}
                currentHours={totalHours}
                breakEvenDistance={result.breakEvenDistance}
              />

              <BreakEvenMessage result={result} currentDistance={distance} />
            </section>

            {/* 投げ銭セクション */}
            <section className="bg-muted/50 rounded-xl p-5 border border-border">
              <p className="font-medium text-foreground mb-4">開発者を応援する</p>

              {/* Stripe Pricing Table は親要素の横幅が狭いと縦並びになるため、十分な幅を確保（狭い画面では横スクロール） */}
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1120px]">
                  <stripe-pricing-table
                    pricing-table-id="prctbl_1SqmtxLidBSdNvbgP2AjMvzQ"
                    publishable-key="pk_live_51SqkxPLidBSdNvbgA9IlXb0Q025UBKWWwEKSZRi1fTDbQ6rerJm85Mus9Zaip3Ii8vMgEC4eIUzUdxaAQ8oTpzRC00KP37CGyy"
                    style={{ width: "1120px" }}
                  />
                </div>
              </div>
            </section>

            {/* Info Section */}
            <section className="bg-muted/50 rounded-xl p-5 border border-border text-base text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">料金について</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>カーシェアは{settings.carShare.distanceChargeThresholdKm}km超で距離料金（¥{getCarShareVehicle(vehicleType).distanceRate}/km）が発生</li>
                <li>給油割引は20L以上（または燃料計の半分以上）が対象</li>
                <li>レンタカーのガソリン代は燃費{fuelEfficiency}km/L、¥{fuelPrice}/Lで計算</li>
                <li>免責補償: ¥{rentalVehicle.insuranceBasicPerDay.toLocaleString()}/日、安心補償: ¥{rentalVehicle.insurancePremiumPerDay.toLocaleString()}/日</li>
                <li>実際の料金は時期やプランにより異なる場合があります</li>
              </ul>
            </section>
          </TabsContent>

          {/* Car Share Price Table Tab */}
          <TabsContent value="carshare">
            <CarSharePriceTable />
          </TabsContent>

          {/* Rental Car Price Table Tab */}
          <TabsContent value="rental">
            <RentalCarPriceTable />
          </TabsContent>

          {/* Calculation Guide Tab */}
          <TabsContent value="guide">
            <CalculationGuide />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-4 mt-8">
        <div className="container text-center text-sm text-muted-foreground space-y-3">
          <div className="space-y-1">
            <p>※ 本ツールの料金データは2026年1月16日時点の情報に基づいています。</p>
            <p>※ 料金は参考情報です。実際の料金は各サービスの公式サイトでご確認ください。</p>
            <p>※ 本ツールの利用により生じた損害について、一切の責任を負いかねます。</p>
          </div>
          <div className="pt-4 border-t border-border">
            <a 
              href="https://lovable.dev/invite/HN8QQET" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <span>💜</span>
              <span>Made with Lovable</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;