import { cn } from "@/lib/utils";
import { Car } from "lucide-react";
import type { VehicleType } from "@/lib/pricing";

interface VehicleSelectorProps {
  value: VehicleType;
  onChange: (value: VehicleType) => void;
}

const vehicles = [
  { value: "compact" as const, label: "コンパクトカー", description: "2〜4名向け" },
  { value: "compactMinivan" as const, label: "コンパクトミニバン", description: "4〜6名向け" },
  { value: "minivan" as const, label: "ミニバン", description: "6〜8名向け" },
];

export function VehicleSelector({ value, onChange }: VehicleSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground flex items-center gap-2">
        <Car className="w-4 h-4 text-primary" />
        車種を選択
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {vehicles.map((vehicle) => (
          <button
            key={vehicle.value}
            type="button"
            onClick={() => onChange(vehicle.value)}
            className={cn(
              "relative p-4 rounded-lg border-2 text-left transition-all duration-200",
              value === vehicle.value
                ? "border-primary bg-accent shadow-md"
                : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
            )}
          >
            <div className="font-semibold text-foreground">{vehicle.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{vehicle.description}</div>
            {value === vehicle.value && (
              <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary animate-pulse-soft" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
