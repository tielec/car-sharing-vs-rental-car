import { 
  settings, 
  getCarShareVehicle, 
  getRentalCarVehicle,
  getInsurancePrice,
  type VehicleType,
  type CarShareVehicle,
  type InsuranceType
} from "@/config";

export type { VehicleType, InsuranceType };

export interface CarShareResult {
  timeCharge: number;
  distanceCharge: number;
  serviceDiscount: number;
  insuranceCharge: number;
  total: number;
}

export interface RentalCarResult {
  baseCharge: number;
  fuelCharge: number;
  insuranceCharge: number;
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
 * Calculate car share time charge using tiered max rate system
 * 
 * Logic: For each tier, accumulate 15-min charges on top of previous tier's max,
 * but cap at current tier's max. Then move to next tier.
 * 
 * Example (Basic):
 * - 0-6h: min(15min累積, 4290) → 最大4290円
 * - 6-12h: 4290 + min(追加15min累積, 5500-4290) → 最大5500円
 * - 12-24h: 5500 + min(追加15min累積, 6600-5500) → 最大6600円
 * - etc.
 */
function calculateCarShareTimeCharge(vehicle: CarShareVehicle, hours: number): number {
  if (hours <= 0) return 0;
  
  const maxRates = vehicle.maxRates;
  const rate15min = vehicle.rate15min;
  
  // For durations over 72 hours
  if (hours > 72) {
    const base72h = maxRates.find(r => r.maxHours === 72)?.maxPrice ?? 0;
    const extraDays = Math.ceil((hours - 72) / 24);
    return base72h + extraDays * vehicle.dailyRateAfter72h;
  }
  
  // For durations up to 72 hours - calculate tier by tier
  let totalCharge = 0;
  let previousTierMaxHours = 0;
  let previousTierMaxPrice = 0;
  
  for (const tier of maxRates) {
    if (hours <= previousTierMaxHours) break;
    
    // Hours in this tier
    const hoursInTier = Math.min(hours, tier.maxHours) - previousTierMaxHours;
    if (hoursInTier <= 0) break;
    
    // Calculate 15-min charge for hours in this tier
    const units15min = Math.ceil(hoursInTier * 4);
    const tierCharge = units15min * rate15min;
    
    // Cap at this tier's max (relative to previous tier)
    const tierMaxDelta = tier.maxPrice - previousTierMaxPrice;
    const cappedTierCharge = Math.min(tierCharge, tierMaxDelta);
    
    totalCharge = previousTierMaxPrice + cappedTierCharge;
    
    // If we've hit the max for this tier, update for next iteration
    if (tierCharge >= tierMaxDelta) {
      previousTierMaxPrice = tier.maxPrice;
    }
    previousTierMaxHours = tier.maxHours;
    
    if (hours <= tier.maxHours) break;
  }
  
  return totalCharge;
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
  hasWash: boolean,
  hasInsurance: boolean
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
  
  // Insurance charge (per use, not per day)
  const insuranceCharge = hasInsurance ? settings.carShare.insurancePerUse : 0;
  
  const total = Math.max(0, timeCharge + distanceCharge - serviceDiscount + insuranceCharge);
  
  return {
    timeCharge,
    distanceCharge,
    serviceDiscount,
    insuranceCharge,
    total,
  };
}

export function calculateRentalCarPrice(
  vehicleType: VehicleType,
  hours: number,
  distance: number,
  fuelPrice: number,
  fuelEfficiency: number,
  isMember: boolean,
  insuranceType: InsuranceType
): RentalCarResult {
  const vehicle = getRentalCarVehicle(vehicleType);
  
  // Select rates based on membership
  const rates = isMember ? vehicle.memberRates : vehicle.regularRates;
  const extraDayRate = isMember ? vehicle.memberExtraDayRate : vehicle.regularExtraDayRate;
  const extraHourRate = isMember ? vehicle.memberExtraHourRate : vehicle.regularExtraHourRate;
  
  // Calculate base charge using tiered rates
  const baseCharge = calculateRentalCarBaseCharge(rates, extraDayRate, extraHourRate, hours);
  
  // Calculate fuel cost
  const fuelNeeded = distance / fuelEfficiency;
  const fuelCharge = Math.round(fuelNeeded * fuelPrice);
  
  // Calculate insurance charge
  const days = Math.max(1, Math.ceil(hours / 24));
  const insuranceCharge = getInsurancePrice(vehicleType, insuranceType, days);
  
  const total = baseCharge + fuelCharge + insuranceCharge;
  
  return {
    baseCharge,
    fuelCharge,
    insuranceCharge,
    total,
  };
}

/**
 * Calculate rental car base charge using tiered rates
 * 6h, 12h, 24h tiers, then hourly rate accumulates until reaching extraDayRate
 * 
 * Logic: After 24h, each extra hour adds extraHourRate, but caps at extraDayRate per 24h period
 * Example: 26h = 24h rate + 2 * hourlyRate (if 2*hourlyRate < extraDayRate)
 * Example: 48h = 24h rate + extraDayRate (hit the 1-day cap)
 */
function calculateRentalCarBaseCharge(
  rates: { maxHours: number; price: number }[],
  extraDayRate: number,
  extraHourRate: number,
  hours: number
): number {
  if (hours <= 0) return 0;
  
  // Find the applicable rate for hours up to 24
  const sortedRates = [...rates].sort((a, b) => a.maxHours - b.maxHours);
  
  if (hours <= 24) {
    // Find the first tier that covers the duration
    for (const rate of sortedRates) {
      if (hours <= rate.maxHours) {
        return rate.price;
      }
    }
    // If no tier found (shouldn't happen), use 24h rate
    return sortedRates[sortedRates.length - 1]?.price ?? 0;
  }
  
  // For hours > 24: 24h rate + tiered extra charges
  const rate24h = sortedRates.find(r => r.maxHours === 24)?.price ?? 0;
  const extraHours = hours - 24;
  
  // Calculate how many full 24h periods and remaining hours
  const fullExtraDays = Math.floor(extraHours / 24);
  const remainingHours = extraHours % 24;
  
  // Full extra days are charged at extraDayRate
  let extraCharge = fullExtraDays * extraDayRate;
  
  // Remaining hours: charge hourly but cap at extraDayRate
  const remainingHourCharge = Math.ceil(remainingHours) * extraHourRate;
  extraCharge += Math.min(remainingHourCharge, extraDayRate);
  
  return rate24h + extraCharge;
}

export function compareServices(
  vehicleType: VehicleType,
  hours: number,
  distance: number,
  hasRefuel: boolean,
  hasWash: boolean,
  hasCarShareInsurance: boolean,
  fuelPrice: number,
  fuelEfficiency: number,
  isMember: boolean,
  insuranceType: InsuranceType
): ComparisonResult {
  const carShareResult = calculateCarSharePrice(
    vehicleType,
    hours,
    distance,
    hasRefuel,
    hasWash,
    hasCarShareInsurance
  );

  const rentalCarResult = calculateRentalCarPrice(
    vehicleType,
    hours,
    distance,
    fuelPrice,
    fuelEfficiency,
    isMember,
    insuranceType
  );

  const difference = Math.abs(carShareResult.total - rentalCarResult.total);
  const cheaper = carShareResult.total < rentalCarResult.total ? 'carShare' 
    : carShareResult.total > rentalCarResult.total ? 'rentalCar' 
    : 'same';
  const moreExpensivePrice = Math.max(carShareResult.total, rentalCarResult.total);
  const savingsRate = moreExpensivePrice > 0 ? (difference / moreExpensivePrice) * 100 : 0;

  // Calculate break-even distance
  let breakEvenDistance: number | null = null;
  
  // Binary search for break-even point
  const maxSearchDistance = 1000;
  let low = 0;
  let high = maxSearchDistance;
  
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2);
    const csPrice = calculateCarSharePrice(vehicleType, hours, mid, hasRefuel, hasWash, hasCarShareInsurance).total;
    const rcPrice = calculateRentalCarPrice(vehicleType, hours, mid, fuelPrice, fuelEfficiency, isMember, insuranceType).total;
    
    if (csPrice <= rcPrice) {
      low = mid;
    } else {
      high = mid;
    }
  }
  
  // Verify break-even exists
  const lowCsPrice = calculateCarSharePrice(vehicleType, hours, low, hasRefuel, hasWash, hasCarShareInsurance).total;
  const lowRcPrice = calculateRentalCarPrice(vehicleType, hours, low, fuelPrice, fuelEfficiency, isMember, insuranceType).total;
  const highCsPrice = calculateCarSharePrice(vehicleType, hours, high, hasRefuel, hasWash, hasCarShareInsurance).total;
  const highRcPrice = calculateRentalCarPrice(vehicleType, hours, high, fuelPrice, fuelEfficiency, isMember, insuranceType).total;
  
  if ((lowCsPrice <= lowRcPrice) !== (highCsPrice <= highRcPrice)) {
    breakEvenDistance = high;
  }

  return {
    carShare: carShareResult,
    rentalCar: rentalCarResult,
    cheaper,
    difference,
    savingsRate,
    breakEvenDistance,
  };
}

export interface PriceProgressionDataPoint {
  distance: number;
  carShare: number;
  rentalCar: number;
}

export interface TimeProgressionDataPoint {
  hours: number;
  carShare: number;
  rentalCar: number;
}

export function generatePriceProgressionData(
  vehicleType: VehicleType,
  hours: number,
  hasRefuel: boolean,
  hasWash: boolean,
  hasCarShareInsurance: boolean,
  fuelPrice: number,
  fuelEfficiency: number,
  isMember: boolean,
  insuranceType: InsuranceType,
  currentDistance: number
): PriceProgressionDataPoint[] {
  // Determine distance range for the chart (currentDistance ± 250km)
  const minDistance = Math.max(0, currentDistance - 250);
  const maxDistance = currentDistance + 250;
  const range = maxDistance - minDistance;
  const step = Math.max(Math.floor(range / 25), 10);
  
  const data: PriceProgressionDataPoint[] = [];
  
  for (let distance = minDistance; distance <= maxDistance; distance += step) {
    const carShareResult = calculateCarSharePrice(
      vehicleType,
      hours,
      distance,
      hasRefuel,
      hasWash,
      hasCarShareInsurance
    );
    
    const rentalCarResult = calculateRentalCarPrice(
      vehicleType,
      hours,
      distance,
      fuelPrice,
      fuelEfficiency,
      isMember,
      insuranceType
    );
    
    data.push({
      distance,
      carShare: carShareResult.total,
      rentalCar: rentalCarResult.total,
    });
  }
  
  // Ensure current distance is included
  if (!data.some(d => d.distance === currentDistance) && currentDistance <= maxDistance) {
    const carShareResult = calculateCarSharePrice(
      vehicleType,
      hours,
      currentDistance,
      hasRefuel,
      hasWash,
      hasCarShareInsurance
    );
    
    const rentalCarResult = calculateRentalCarPrice(
      vehicleType,
      hours,
      currentDistance,
      fuelPrice,
      fuelEfficiency,
      isMember,
      insuranceType
    );
    
    data.push({
      distance: currentDistance,
      carShare: carShareResult.total,
      rentalCar: rentalCarResult.total,
    });
    
    data.sort((a, b) => a.distance - b.distance);
  }
  
  return data;
}

export function generateTimeProgressionData(
  vehicleType: VehicleType,
  distance: number,
  hasRefuel: boolean,
  hasWash: boolean,
  hasCarShareInsurance: boolean,
  fuelPrice: number,
  fuelEfficiency: number,
  isMember: boolean,
  insuranceType: InsuranceType,
  currentHours: number
): TimeProgressionDataPoint[] {
  // Determine hours range for the chart (currentHours ± 24 hours)
  const minHours = Math.max(1, currentHours - 24);
  const maxHours = currentHours + 24;
  const range = maxHours - minHours;
  const step = range <= 24 ? 1 : range <= 48 ? 2 : 3;
  
  const data: TimeProgressionDataPoint[] = [];
  
  for (let hours = minHours; hours <= maxHours; hours += step) {
    const carShareResult = calculateCarSharePrice(
      vehicleType,
      hours,
      distance,
      hasRefuel,
      hasWash,
      hasCarShareInsurance
    );
    
    const rentalCarResult = calculateRentalCarPrice(
      vehicleType,
      hours,
      distance,
      fuelPrice,
      fuelEfficiency,
      isMember,
      insuranceType
    );
    
    data.push({
      hours,
      carShare: carShareResult.total,
      rentalCar: rentalCarResult.total,
    });
  }
  
  // Ensure current hours is included
  if (!data.some(d => d.hours === currentHours) && currentHours <= maxHours && currentHours >= 1) {
    const carShareResult = calculateCarSharePrice(
      vehicleType,
      currentHours,
      distance,
      hasRefuel,
      hasWash,
      hasCarShareInsurance
    );
    
    const rentalCarResult = calculateRentalCarPrice(
      vehicleType,
      currentHours,
      distance,
      fuelPrice,
      fuelEfficiency,
      isMember,
      insuranceType
    );
    
    data.push({
      hours: currentHours,
      carShare: carShareResult.total,
      rentalCar: rentalCarResult.total,
    });
    
    data.sort((a, b) => a.hours - b.hours);
  }
  
  return data;
}