import { Lock, ExternalLink, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ComparisonResult } from "@/lib/pricing";

const RESERVATION_URLS = {
  carShare: "https://share.timescar.jp/",
  rentalCar: "https://rental.timescar.jp/",
};

interface Props {
  result: ComparisonResult;
  unlocked: boolean;
  onScrollToDonation: () => void;
  onSkip: () => void;
}

export function NextActionCTA({ result, unlocked, onScrollToDonation, onSkip }: Props) {
  const cheaper = result.cheaper;
  const primaryService = cheaper === "rentalCar" ? "rentalCar" : "carShare";
  const primaryLabel =
    primaryService === "carShare" ? "タイムズカーシェアで予約する" : "タイムズレンタカーで予約する";
  const secondaryService = primaryService === "carShare" ? "rentalCar" : "carShare";
  const secondaryLabel =
    secondaryService === "carShare" ? "カーシェアの公式ページ" : "レンタカーの公式ページ";

  if (!unlocked) {
    return (
      <section className="bg-muted/40 rounded-xl p-5 border border-dashed border-border animate-fade-in">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">次のアクション（予約リンク）</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            ☕ 開発を応援していただくと、お得なサービスの公式予約リンクが解放されます。
          </p>
          <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm">
            <Button onClick={onScrollToDonation} className="flex-1">
              応援して解放する
            </Button>
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
              スキップして表示
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-xl p-5 border border-border card-shadow animate-fade-in">
      <h3 className="text-base font-bold text-foreground mb-1">次のアクション</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {cheaper === "same"
          ? "どちらも同額です。お好みのサービスを選んでください。"
          : `${primaryService === "carShare" ? "カーシェア" : "レンタカー"}がお得です。公式ページで予約しましょう。`}
      </p>

      <a
        href={RESERVATION_URLS[primaryService]}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "flex items-center justify-between gap-2 px-4 py-3 rounded-lg",
          "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-bold",
          "card-shadow"
        )}
      >
        <span className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          {primaryLabel}
        </span>
        <ExternalLink className="w-4 h-4" />
      </a>

      <a
        href={RESERVATION_URLS[secondaryService]}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {secondaryLabel}
        <ExternalLink className="w-3 h-3" />
      </a>
    </section>
  );
}
