import { cn } from "@/lib/utils";
import { TrendingDown, ArrowRight, Info } from "lucide-react";
import type { ComparisonResult as ComparisonResultType } from "@/lib/pricing";

interface ComparisonResultProps {
  result: ComparisonResultType;
  currentDistance: number;
}

export function ComparisonResult({ result, currentDistance }: ComparisonResultProps) {
  const formatPrice = (value: number) => {
    return value.toLocaleString("ja-JP");
  };

  const cheaperLabel = result.cheaper === "carShare" 
    ? "カーシェア" 
    : result.cheaper === "rentalCar" 
      ? "レンタカー" 
      : "同額";

  const otherServiceLabel = result.cheaper === "carShare" 
    ? "レンタカー" 
    : "カーシェア";

  // Calculate distance remaining to break-even
  const distanceToBreakEven = result.breakEvenDistance !== null 
    ? result.breakEvenDistance - currentDistance 
    : null;

  // Determine the break-even message
  const getBreakEvenMessage = () => {
    if (result.cheaper === "same") {
      return null;
    }

    if (result.breakEvenDistance === null || result.breakEvenDistance <= 0) {
      // No break-even point exists
      return {
        type: "always" as const,
        message: `この条件では${cheaperLabel}が常にお得です`
      };
    }

    if (distanceToBreakEven !== null && distanceToBreakEven > 0) {
      // Break-even point ahead
      return {
        type: "ahead" as const,
        message: `あと${formatPrice(Math.round(distanceToBreakEven))}km走ると${otherServiceLabel}の方が安くなります`
      };
    }

    if (distanceToBreakEven !== null && distanceToBreakEven <= 0) {
      // Already past break-even
      return {
        type: "passed" as const,
        message: `${formatPrice(Math.round(Math.abs(distanceToBreakEven)))}km手前なら${otherServiceLabel}の方が安かったです`
      };
    }

    return null;
  };

  const breakEvenInfo = getBreakEvenMessage();

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

      {/* Break-even message */}
      {breakEvenInfo && (
        <div className="bg-card rounded-xl p-4 card-shadow border border-border">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              breakEvenInfo.type === "always" ? "bg-savings/10" : "bg-accent"
            )}>
              {breakEvenInfo.type === "always" ? (
                <Info className="w-5 h-5 text-savings" />
              ) : (
                <ArrowRight className="w-5 h-5 text-accent-foreground" />
              )}
            </div>
            <div className="font-medium text-foreground">
              {breakEvenInfo.message}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
