import { cn } from "@/lib/utils";
import { TrendingDown, ArrowRight } from "lucide-react";
import type { ComparisonResult as ComparisonResultType } from "@/lib/pricing";

interface ComparisonResultProps {
  result: ComparisonResultType;
}

export function ComparisonResult({ result }: ComparisonResultProps) {
  const formatPrice = (value: number) => {
    return value.toLocaleString("ja-JP");
  };

  const cheaperLabel = result.cheaper === "carShare" 
    ? "カーシェア" 
    : result.cheaper === "rentalCar" 
      ? "レンタカー" 
      : "同額";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Main comparison result */}
      <div
        className={cn(
          "rounded-xl p-6 text-center card-shadow",
          result.cheaper !== "same" 
            ? "bg-savings-light border-2 border-savings/30" 
            : "bg-secondary border-2 border-muted"
        )}
      >
        {result.cheaper !== "same" ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-savings" />
              <span className="text-savings font-bold text-lg">
                {cheaperLabel}がお得！
              </span>
            </div>
            <div className="price-text text-savings">
              ¥{formatPrice(result.difference)}
            </div>
            <div className="text-muted-foreground text-sm mt-1">
              節約（{result.savingsRate.toFixed(1)}%）
            </div>
          </>
        ) : (
          <div className="text-muted-foreground font-medium">
            両サービスとも同額です
          </div>
        )}
      </div>

      {/* Break-even point */}
      {result.breakEvenDistance !== null && result.breakEvenDistance > 0 && (
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">損益分岐点</div>
              <div className="font-bold text-foreground">
                あと{formatPrice(result.breakEvenDistance - (result.carShare.distanceCharge / 20))}km走ると逆転
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
