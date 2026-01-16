// Times Car Share pricing data
export const carSharePricing = {
  compact: {
    name: "コンパクトカー",
    hourlyRates: [
      { maxHours: 6, rate: 220 },
      { maxHours: 12, rate: 170 },
      { maxHours: 24, rate: 155 },
      { maxHours: 36, rate: 145 },
      { maxHours: 48, rate: 135 },
      { maxHours: 72, rate: 125 },
      { maxHours: Infinity, rate: 115 },
    ],
    distanceRate: 20, // per km after 6 hours
    refuelDiscount: 330, // per 10L
  },
  compactMinivan: {
    name: "コンパクトミニバン",
    hourlyRates: [
      { maxHours: 6, rate: 330 },
      { maxHours: 12, rate: 260 },
      { maxHours: 24, rate: 240 },
      { maxHours: 36, rate: 230 },
      { maxHours: 48, rate: 215 },
      { maxHours: 72, rate: 195 },
      { maxHours: Infinity, rate: 175 },
    ],
    distanceRate: 20,
    refuelDiscount: 330,
  },
  minivan: {
    name: "ミニバン",
    hourlyRates: [
      { maxHours: 6, rate: 440 },
      { maxHours: 12, rate: 350 },
      { maxHours: 24, rate: 320 },
      { maxHours: 36, rate: 305 },
      { maxHours: 48, rate: 290 },
      { maxHours: 72, rate: 265 },
      { maxHours: Infinity, rate: 235 },
    ],
    distanceRate: 20,
    refuelDiscount: 330,
  },
};

// Times Rental Car pricing data (per 24 hours)
export const rentalCarPricing = {
  compact: {
    name: "コンパクトカー",
    dailyRate: 5390,
    fuelEfficiency: 15, // km/L
    fuelPrice: 160, // yen/L
  },
  compactMinivan: {
    name: "コンパクトミニバン",
    dailyRate: 6820,
    fuelEfficiency: 12,
    fuelPrice: 160,
  },
  minivan: {
    name: "ミニバン",
    dailyRate: 8250,
    fuelEfficiency: 10,
    fuelPrice: 160,
  },
};

export type VehicleType = "compact" | "compactMinivan" | "minivan";

export interface CarShareResult {
  timeCharge: number;
  distanceCharge: number;
  refuelDiscount: number;
  total: number;
}

export interface RentalCarResult {
  baseCharge: number;
  fuelCharge: number;
  total: number;
}

export interface ComparisonResult {
  carShare: CarShareResult;
  rentalCar: RentalCarResult;
  cheaper: "carShare" | "rentalCar" | "same";
  difference: number;
  savingsRate: number;
  breakEvenDistance: number | null;
}

export function calculateCarSharePrice(
  vehicleType: VehicleType,
  hours: number,
  distance: number,
  hasRefuel: boolean
): CarShareResult {
  const pricing = carSharePricing[vehicleType];
  
  // Calculate time charge using tiered rates
  let timeCharge = 0;
  let remainingHours = hours;
  let previousMaxHours = 0;
  
  for (const tier of pricing.hourlyRates) {
    const hoursInThisTier = Math.min(remainingHours, tier.maxHours - previousMaxHours);
    if (hoursInThisTier <= 0) break;
    
    timeCharge += hoursInThisTier * tier.rate;
    remainingHours -= hoursInThisTier;
    previousMaxHours = tier.maxHours;
    
    if (remainingHours <= 0) break;
  }
  
  // Distance charge only applies after 6 hours
  const distanceCharge = hours > 6 ? distance * pricing.distanceRate : 0;
  
  // Refuel discount (assume 10L refuel = 330 yen discount, max based on distance)
  const estimatedFuel = distance / 12; // rough estimate
  const refuelDiscount = hasRefuel ? Math.floor(estimatedFuel / 10) * pricing.refuelDiscount : 0;
  
  const total = Math.max(0, timeCharge + distanceCharge - refuelDiscount);
  
  return {
    timeCharge,
    distanceCharge,
    refuelDiscount,
    total,
  };
}

export function calculateRentalCarPrice(
  vehicleType: VehicleType,
  hours: number,
  distance: number
): RentalCarResult {
  const pricing = rentalCarPricing[vehicleType];
  
  // Calculate days (round up)
  const days = Math.ceil(hours / 24);
  const baseCharge = days * pricing.dailyRate;
  
  // Calculate fuel cost
  const fuelNeeded = distance / pricing.fuelEfficiency;
  const fuelCharge = Math.round(fuelNeeded * pricing.fuelPrice);
  
  const total = baseCharge + fuelCharge;
  
  return {
    baseCharge,
    fuelCharge,
    total,
  };
}

export function compareServices(
  vehicleType: VehicleType,
  hours: number,
  distance: number,
  hasRefuel: boolean
): ComparisonResult {
  const carShare = calculateCarSharePrice(vehicleType, hours, distance, hasRefuel);
  const rentalCar = calculateRentalCarPrice(vehicleType, hours, distance);
  
  const difference = Math.abs(carShare.total - rentalCar.total);
  const cheaper = carShare.total < rentalCar.total 
    ? "carShare" 
    : carShare.total > rentalCar.total 
      ? "rentalCar" 
      : "same";
  
  const moreExpensive = Math.max(carShare.total, rentalCar.total);
  const savingsRate = moreExpensive > 0 ? (difference / moreExpensive) * 100 : 0;
  
  // Calculate break-even distance
  let breakEvenDistance: number | null = null;
  
  if (hours > 6) {
    // Car share has distance charge, rental doesn't change with distance the same way
    const carShareFixed = carShare.timeCharge - (hasRefuel ? carShare.refuelDiscount : 0);
    const rentalFixed = rentalCar.baseCharge;
    
    const carShareDistanceRate = carSharePricing[vehicleType].distanceRate;
    const rentalDistanceRate = rentalCarPricing[vehicleType].fuelPrice / rentalCarPricing[vehicleType].fuelEfficiency;
    
    if (cheaper === "carShare" && carShareDistanceRate > rentalDistanceRate) {
      // Car share gets more expensive per km
      breakEvenDistance = Math.round((rentalFixed - carShareFixed) / (carShareDistanceRate - rentalDistanceRate));
      if (breakEvenDistance <= distance) breakEvenDistance = null;
    } else if (cheaper === "rentalCar" && rentalDistanceRate > carShareDistanceRate) {
      breakEvenDistance = Math.round((carShareFixed - rentalFixed) / (rentalDistanceRate - carShareDistanceRate));
      if (breakEvenDistance <= distance) breakEvenDistance = null;
    }
  }
  
  return {
    carShare,
    rentalCar,
    cheaper,
    difference,
    savingsRate,
    breakEvenDistance,
  };
}
