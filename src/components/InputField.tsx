import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  unit: string;
  icon: LucideIcon;
  optional?: boolean;
}

export function InputField({
  label,
  value,
  onChange,
  min = 0,
  max,
  unit,
  icon: Icon,
  optional,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-base font-medium text-foreground flex items-center gap-2">
        <Icon className="w-5 h-5 text-primary" />
        {label}
        {optional && <span className="text-muted-foreground text-sm">(任意)</span>}
      </label>
      <div className="relative">
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 0;
            const clampedVal = max ? Math.min(val, max) : val;
            onChange(Math.max(min, clampedVal));
          }}
          min={min}
          max={max}
          className={cn(
            "pr-14 h-14 text-xl font-medium",
            "focus-visible:ring-primary focus-visible:ring-offset-0"
          )}
          placeholder="0"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
          {unit}
        </span>
      </div>
    </div>
  );
}
