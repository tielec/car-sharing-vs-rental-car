import YAML from "yaml";
import settingsYaml from "./settings.yaml?raw";

export interface HourlyRate {
  maxHours: number;
  rate: number;
}

export interface CarShareVehicle {
  name: string;
  description: string;
  hourlyRates: HourlyRate[];
  distanceRate: number;
  refuelDiscount: number;
}

export interface RentalCarVehicle {
  name: string;
  dailyRate: number;
  fuelEfficiency: number;
}

export interface Settings {
  defaults: {
    vehicleType: VehicleType;
    hours: number;
    distance: number;
    hasRefuel: boolean;
    tollFee: number;
  };
  limits: {
    hours: { min: number; max: number };
    distance: { min: number; max: number };
    tollFee: { min: number; max: number };
  };
  carShare: {
    distanceChargeThreshold: number;
    vehicles: Record<VehicleType, CarShareVehicle>;
  };
  rentalCar: {
    fuelPrice: number;
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
