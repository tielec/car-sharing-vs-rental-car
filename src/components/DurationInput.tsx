import { Clock } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DurationInputProps {
  totalHours: number;
  onChange: (totalHours: number) => void;
  maxDays?: number;
}

export function DurationInput({ totalHours, onChange, maxDays = 10 }: DurationInputProps) {
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  const handleDaysChange = (newDays: number) => {
    const clampedDays = Math.min(Math.max(0, newDays), maxDays);
    const newTotal = clampedDays * 24 + hours;
    onChange(Math.max(1, newTotal));
  };

  const handleHoursChange = (newHours: number) => {
    const clampedHours = Math.min(Math.max(0, newHours), 23);
    const newTotal = days * 24 + clampedHours;
    onChange(Math.max(1, newTotal));
  };

  return (
    <div className="space-y-2">
      <label className="text-base font-medium text-foreground flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        利用時間
      </label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="number"
            value={days || ""}
            onChange={(e) => handleDaysChange(parseInt(e.target.value) || 0)}
            min={0}
            max={maxDays}
            className="pr-10 h-14 text-xl font-medium focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
            日
          </span>
        </div>
        <div className="relative flex-1">
          <Input
            type="number"
            value={hours || ""}
            onChange={(e) => handleHoursChange(parseInt(e.target.value) || 0)}
            min={0}
            max={23}
            className="pr-14 h-14 text-xl font-medium focus-visible:ring-primary focus-visible:ring-offset-0"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-base">
            時間
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        合計: {totalHours}時間
      </p>
    </div>
  );
}
