import { 
  settings, 
  getCarShareVehicle, 
  getRentalCarVehicle,
  type VehicleType,
  type CarShareVehicle
} from "@/config";

export type { VehicleType };

export interface CarShareResult {
  timeCharge: number;
  distanceCharge: number;
  serviceDiscount: number;
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

/**
 * Calculate car share time charge using 15-min rate with max rate caps
 */
function calculateCarShareTimeCharge(vehicle: CarShareVehicle, hours: number): number {
  if (hours <= 0) return 0;
  
  // For durations up to 72 hours
  if (hours <= 72) {
    // Calculate 15-min unit charge
    const units15min = Math.ceil(hours * 4); // Convert hours to 15-min units
    const rate15minTotal = units15min * vehicle.rate15min;
    
    // Find applicable max rate
    const applicableMaxRate = vehicle.maxRates.find(r => hours <= r.maxHours);
    const maxPrice = applicableMaxRate?.maxPrice ?? Infinity;
    
    // Return the cheaper of the two
    return Math.min(rate15minTotal, maxPrice);
  }
  
  // For durations over 72 hours
  const base72h = vehicle.maxRates.find(r => r.maxHours === 72)?.maxPrice ?? 0;
  const extraDays = Math.ceil((hours - 72) / 24);
  return base72h + extraDays * vehicle.dailyRateAfter72h;
}

/**
 * Calculate service discount (refuel/wash) in yen
 * Discount is based on time (minutes) * rate per 15min
 */
function calculateServiceDiscount(
  vehicle: CarShareVehicle,
  hasRefuel: boolean,
  hasWash: boolean
): number {
  const { discountMinutes } = settings.carShare;
  
  let discountMins = 0;
  if (hasRefuel && hasWash) {
    discountMins = discountMinutes.refuelAndWash;
  } else if (hasRefuel) {
    discountMins = discountMinutes.refuelOnly;
  } else if (hasWash) {
    discountMins = discountMinutes.washOnly;
  }
  
  // Convert minutes to 15-min units and multiply by rate
  const units15min = discountMins / 15;
  return units15min * vehicle.rate15min;
}

export function calculateCarSharePrice(
  vehicleType: VehicleType,
  hours: number,
  distance: number,
  hasRefuel: boolean,
  hasWash: boolean
): CarShareResult {
  const vehicle = getCarShareVehicle(vehicleType);
  const thresholdKm = settings.carShare.distanceChargeThresholdKm;
  
  // Calculate time charge
  const timeCharge = calculateCarShareTimeCharge(vehicle, hours);
  
  // Distance charge: only for km exceeding threshold
  const chargeableDistance = Math.max(0, distance - thresholdKm);
  const distanceCharge = chargeableDistance * vehicle.distanceRate;
  
  // Service discount (refuel/wash)
  const serviceDiscount = calculateServiceDiscount(vehicle, hasRefuel, hasWash);
  
  const total = Math.max(0, timeCharge + distanceCharge - serviceDiscount);
  
  return {
    timeCharge,
    distanceCharge,
    serviceDiscount,
    total,
  };
}

export function calculateRentalCarPrice(
  vehicleType: VehicleType,
  hours: number,
  distance: number,
  fuelPrice: number,
  fuelEfficiency: number
): RentalCarResult {
  const vehicle = getRentalCarVehicle(vehicleType);
  
  // Calculate days (round up)
  const days = Math.ceil(hours / 24);
  const baseCharge = days * vehicle.dailyRate;
  
  // Calculate fuel cost
  const fuelNeeded = distance / fuelEfficiency;
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
  hasRefuel: boolean,
  hasWash: boolean,
  fuelPrice: number,
  fuelEfficiency: number
): ComparisonResult {
  const carShare = calculateCarSharePrice(vehicleType, hours, distance, hasRefuel, hasWash);
  const rentalCar = calculateRentalCarPrice(vehicleType, hours, distance, fuelPrice, fuelEfficiency);
  
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
  const thresholdKm = settings.carShare.distanceChargeThresholdKm;
  
  const carShareVehicle = getCarShareVehicle(vehicleType);
  
  const carShareFixed = carShare.timeCharge - carShare.serviceDiscount;
  const rentalFixed = rentalCar.baseCharge;
  
  const carShareDistanceRate = carShareVehicle.distanceRate;
  const rentalDistanceRate = fuelPrice / fuelEfficiency;
  
  // Only calculate break-even if distance rates differ
  if (Math.abs(carShareDistanceRate - rentalDistanceRate) > 0.01) {
    const adjustedCarShareFixed = carShareFixed - thresholdKm * carShareDistanceRate;
    
    if (cheaper === "carShare" && carShareDistanceRate > rentalDistanceRate) {
      breakEvenDistance = Math.round((rentalFixed - adjustedCarShareFixed) / (carShareDistanceRate - rentalDistanceRate));
      if (breakEvenDistance <= distance || breakEvenDistance <= 0) breakEvenDistance = null;
    } else if (cheaper === "rentalCar" && rentalDistanceRate > carShareDistanceRate) {
      breakEvenDistance = Math.round((adjustedCarShareFixed - rentalFixed) / (rentalDistanceRate - carShareDistanceRate));
      if (breakEvenDistance <= distance || breakEvenDistance <= 0) breakEvenDistance = null;
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
