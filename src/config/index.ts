import YAML from "yaml";
import settingsYaml from "./settings.yaml?raw";

export interface MaxRate {
  maxHours: number;
  maxPrice: number;
}

export interface CarShareVehicle {
  name: string;
  description: string;
  rate15min: number;
  maxRates: MaxRate[];
  dailyRateAfter72h: number;
  distanceRate: number;
}

export interface RentalCarRate {
  maxHours: number;
  price: number;
}

export interface RentalCarVehicle {
  name: string;
  defaultFuelEfficiency: number;
  insuranceBasicPerDay: number;
  insurancePremiumPerDay: number;
  regularRates: RentalCarRate[];
  regularExtraDayRate: number;
  regularExtraHourRate: number;
  memberRates: RentalCarRate[];
  memberExtraDayRate: number;
  memberExtraHourRate: number;
}

export interface InsuranceNames {
  basic: string;
  premium: string;
}

export interface DiscountMinutes {
  refuelOnly: number;
  washOnly: number;
  refuelAndWash: number;
}

export type InsuranceType = "none" | "basic" | "premium";

export interface Settings {
  defaults: {
    vehicleType: VehicleType;
    days: number;
    hours: number;
    distance: number;
    hasRefuel: boolean;
    hasWash: boolean;
    tollFee: number;
    fuelPrice: number;
    isMember: boolean;
    insuranceType: InsuranceType;
  };
  limits: {
    hours: { min: number; max: number };
    distance: { min: number; max: number };
    tollFee: { min: number; max: number };
  };
  carShare: {
    distanceChargeThresholdKm: number;
    insurancePerUse: number;
    discountMinutes: DiscountMinutes;
    vehicles: Record<VehicleType, CarShareVehicle>;
  };
  rentalCar: {
    defaultFuelPrice: number;
    vehicles: Record<VehicleType, RentalCarVehicle>;
  };
}

export type VehicleType = "compact" | "compactMinivan" | "minivan";

// Parse YAML and export settings
export const settings: Settings = YAML.parse(settingsYaml);

// Helper to get vehicle types as array
export const vehicleTypes: VehicleType[] = ["compact", "compactMinivan", "minivan"];

// Helper to get vehicle info
export function getCarShareVehicle(type: VehicleType): CarShareVehicle {
  return settings.carShare.vehicles[type];
}

export function getRentalCarVehicle(type: VehicleType): RentalCarVehicle {
  return settings.rentalCar.vehicles[type];
}

// Helper to get insurance price per vehicle type
export function getInsurancePrice(vehicleType: VehicleType, insuranceType: InsuranceType, days: number): number {
  if (insuranceType === "none") return 0;
  const vehicle = getRentalCarVehicle(vehicleType);
  const pricePerDay = insuranceType === "basic" 
    ? vehicle.insuranceBasicPerDay 
    : vehicle.insurancePremiumPerDay;
  return pricePerDay * days;
}

export function getInsuranceName(type: InsuranceType): string {
  if (type === "none") return "";
  return type === "basic" ? "免責補償コース" : "安心補償コース";
}