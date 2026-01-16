import { cn } from "@/lib/utils";
import { Car } from "lucide-react";
import { settings, vehicleTypes, type VehicleType } from "@/config";

interface VehicleSelectorProps {
  value: VehicleType;
  onChange: (value: VehicleType) => void;
}

export function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Car className="w-4 h-4 text-primary" />
        車種を選択
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {vehicleTypes.map((vehicleType) => {
          const vehicle = settings.carShare.vehicles[vehicleType];
          return (
            <button
              key={vehicleType}
              type="button"
              onClick={() => onChange(vehicleType)}
              className={cn(
                "relative p-4 rounded-lg border-2 text-left transition-all duration-200",
                value === vehicleType
                  ? "border-primary bg-accent shadow-md"
                  : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
              )}
            >
              <div className="font-semibold text-foreground">{vehicle.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{vehicle.description}</div>
              {value === vehicleType && (
                <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse-soft" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
