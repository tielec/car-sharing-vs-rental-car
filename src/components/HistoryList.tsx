import { History, RotateCcw, X, Trash2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import type { HistoryEntry } from "@/hooks/useComparisonHistory";
import { getCarShareVehicle } from "@/config";

interface Props {
  items: HistoryEntry[];
  onRestore: (e: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatHours(h: number) {
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  const r = h % 24;
  return r === 0 ? `${d}日` : `${d}日${r}h`;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${m}/${day} ${hh}:${mm}`;
}

export function HistoryList({ items, onRestore, onRemove, onClear }: Props) {
  if (items.length === 0) return null;

  return (
    <Collapsible className="bg-card rounded-xl border border-border card-shadow animate-fade-in">
      <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors rounded-xl">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">最近の比較条件（{items.length}件）</span>
        </div>
        <span className="text-xs text-muted-foreground">タップで開く</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4 pb-4 space-y-2">
        {items.map((e) => {
          const cs = getCarShareVehicle(e.vehicleType);
          const cheaperLabel =
            e.cheaper === "carShare"
              ? "カーシェア得"
              : e.cheaper === "rentalCar"
                ? "レンタカー得"
                : e.cheaper === "same"
                  ? "同額"
                  : "-";
          return (
            <div
              key={e.id}
              className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">
                  {cs.name} / {formatHours(e.totalHours)} / {e.distance}km
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatTime(e.ts)} ・ {cheaperLabel}
                  {e.cheaper && e.cheaper !== "same" && ` ¥${e.difference.toLocaleString("ja-JP")}`}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRestore(e)}
                className="h-8 px-2"
                aria-label="復元"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(e.id)}
                className="h-8 px-2 text-muted-foreground"
                aria-label="削除"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          );
        })}
        <Button variant="ghost" size="sm" onClick={onClear} className="w-full text-xs text-muted-foreground">
          <Trash2 className="w-3.5 h-3.5" />
          履歴をすべて削除
        </Button>
      </CollapsibleContent>
    </Collapsible>
  );
}
