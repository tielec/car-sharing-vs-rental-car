import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { VehicleType } from "@/lib/pricing";

export interface PresetValues {
  vehicleType: VehicleType;
  totalHours: number;
  distance: number;
  tollFee: number;
}

interface Preset {
  label: string;
  emoji: string;
  values: PresetValues;
}

const PRESETS: Preset[] = [
  {
    label: "買い物・送迎",
    emoji: "🛒",
    values: { vehicleType: "compact", totalHours: 4, distance: 30, tollFee: 0 },
  },
  {
    label: "日帰りドライブ",
    emoji: "🗾",
    values: { vehicleType: "compact", totalHours: 8, distance: 150, tollFee: 2000 },
  },
  {
    label: "1泊2日旅行",
    emoji: "🏨",
    values: { vehicleType: "compact", totalHours: 36, distance: 400, tollFee: 4000 },
  },
  {
    label: "大人数おでかけ",
    emoji: "👨‍👩‍👧‍👦",
    values: { vehicleType: "compactMinivan", totalHours: 8, distance: 200, tollFee: 2000 },
  },
];

interface Props {
  onApply: (values: PresetValues) => void;
}

export function PresetButtons({ onApply }: Props) {
  return (
    <div className="bg-card rounded-xl p-4 card-shadow border border-border animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">よくある利用シーンから選ぶ</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            variant="outline"
            size="sm"
            onClick={() => {
              onApply(p.values);
              toast({ title: `「${p.label}」を適用しました`, duration: 1800 });
            }}
            className="h-auto py-2.5 flex flex-col gap-1 hover:bg-accent"
          >
            <span className="text-lg leading-none">{p.emoji}</span>
            <span className="text-xs">{p.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
