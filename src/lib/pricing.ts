import { 
  settings, 
  getCarShareVehicle, 
  getRentalCarVehicle,
  type VehicleType 
} from "@/config";

export type { VehicleType };

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
  const vehicle = getCarShareVehicle(vehicleType);
  const threshold = settings.carShare.distanceChargeThreshold;
  
  // Calculate time charge using tiered rates
  let timeCharge = 0;
  let remainingHours = hours;
  let previousMaxHours = 0;
  
  for (const tier of vehicle.hourlyRates) {
    const maxH = tier.maxHours === 9999 ? Infinity : tier.maxHours;
    const hoursInThisTier = Math.min(remainingHours, maxH - previousMaxHours);
    if (hoursInThisTier <= 0) break;
    
    timeCharge += hoursInThisTier * tier.rate;
    remainingHours -= hoursInThisTier;
    previousMaxHours = maxH;
    
    if (remainingHours <= 0) break;
  }
  
  // Distance charge only applies after threshold hours
  const distanceCharge = hours > threshold ? distance * vehicle.distanceRate : 0;
  
  // Refuel discount (assume 10L refuel = discount, based on distance)
  const estimatedFuel = distance / 12;
  const refuelDiscount = hasRefuel ? Math.floor(estimatedFuel / 10) * vehicle.refuelDiscount : 0;
  
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
  const vehicle = getRentalCarVehicle(vehicleType);
  const fuelPrice = settings.rentalCar.fuelPrice;
  
  // Calculate days (round up)
  const days = Math.ceil(hours / 24);
  const baseCharge = days * vehicle.dailyRate;
  
  // Calculate fuel cost
  const fuelNeeded = distance / vehicle.fuelEfficiency;
  const fuelCharge = Math.round(fuelNeeded * fuelPrice);
  
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
  const threshold = settings.carShare.distanceChargeThreshold;
  
  if (hours > threshold) {
    const carShareVehicle = getCarShareVehicle(vehicleType);
    const rentalVehicle = getRentalCarVehicle(vehicleType);
    
    const carShareFixed = carShare.timeCharge - (hasRefuel ? carShare.refuelDiscount : 0);
    const rentalFixed = rentalCar.baseCharge;
    
    const carShareDistanceRate = carShareVehicle.distanceRate;
    const rentalDistanceRate = settings.rentalCar.fuelPrice / rentalVehicle.fuelEfficiency;
    
    if (cheaper === "carShare" && carShareDistanceRate > rentalDistanceRate) {
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
