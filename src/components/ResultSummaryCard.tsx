import { useRef } from "react";
import { Link2, Copy, Image as ImageIcon, Share2 } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { ComparisonResult, VehicleType } from "@/lib/pricing";
import { getCarShareVehicle } from "@/config";

interface Props {
  result: ComparisonResult;
  vehicleType: VehicleType;
  totalHours: number;
  distance: number;
  tollFee: number;
}

function fmt(n: number) {
  return n.toLocaleString("ja-JP");
}

function formatHours(h: number) {
  if (h < 24) return `${h}時間`;
  const d = Math.floor(h / 24);
  const r = h % 24;
  return r === 0 ? `${d}日` : `${d}日${r}時間`;
}

export function ResultSummaryCard({ result, vehicleType, totalHours, distance, tollFee }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  const cs = getCarShareVehicle(vehicleType);
  const carShareTotal = result.carShare.total + tollFee;
  const rentalTotal = result.rentalCar.total + tollFee;

  const cheaperLabel =
    result.cheaper === "carShare" ? "カーシェア" : result.cheaper === "rentalCar" ? "レンタカー" : "同額";

  const buildText = () => {
    const lines = [
      `🚗 タイムズカーシェア vs レンタカー 比較結果`,
      ``,
      `車種: ${cs.name}`,
      `利用時間: ${formatHours(totalHours)}`,
      `走行距離: ${distance}km`,
      ``,
      `カーシェア: ¥${fmt(carShareTotal)}`,
      `レンタカー: ¥${fmt(rentalTotal)}`,
      ``,
      result.cheaper === "same"
        ? `→ 両者同額`
        : `→ ${cheaperLabel}が ¥${fmt(result.difference)} お得（${result.savingsRate.toFixed(1)}%）`,
      ``,
      window.location.href,
    ];
    return lines.join("\n");
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "リンクをコピーしました", duration: 1800 });
    } catch {
      toast({ title: "コピーに失敗しました", variant: "destructive" });
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(buildText());
      toast({ title: "サマリーをコピーしました", duration: 1800 });
    } catch {
      toast({ title: "コピーに失敗しました", variant: "destructive" });
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const link = document.createElement("a");
      link.download = `comparison-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast({ title: "画像を保存しました", duration: 1800 });
    } catch {
      toast({ title: "画像の保存に失敗しました", variant: "destructive" });
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border card-shadow animate-fade-in">
      <div ref={cardRef} className="p-5 bg-card rounded-t-xl">
        <div className="flex items-center gap-2 mb-3">
          <Share2 className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">この結果をシェア・保存</h3>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground mb-3">
          <div>
            <div>車種</div>
            <div className="font-medium text-foreground">{cs.name}</div>
          </div>
          <div>
            <div>利用時間</div>
            <div className="font-medium text-foreground">{formatHours(totalHours)}</div>
          </div>
          <div>
            <div>走行距離</div>
            <div className="font-medium text-foreground">{distance}km</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-carshare-light border border-carshare/20 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">カーシェア</div>
            <div className="text-lg font-bold text-carshare">¥{fmt(carShareTotal)}</div>
          </div>
          <div className="bg-rental-light border border-rental/20 rounded-lg p-3 text-center">
            <div className="text-xs text-muted-foreground">レンタカー</div>
            <div className="text-lg font-bold text-rental">¥{fmt(rentalTotal)}</div>
          </div>
        </div>

        {result.cheaper !== "same" && (
          <div className="text-center text-sm bg-savings-light border border-savings/30 rounded-lg py-2 px-3 text-foreground">
            <span className="font-bold text-savings">{cheaperLabel}</span> が
            <span className="font-bold"> ¥{fmt(result.difference)} </span>
            お得（{result.savingsRate.toFixed(1)}%）
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 border-t border-border">
        <Button variant="outline" size="sm" onClick={handleCopyLink} className="text-xs">
          <Link2 className="w-3.5 h-3.5" />
          リンク
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyText} className="text-xs">
          <Copy className="w-3.5 h-3.5" />
          テキスト
        </Button>
        <Button variant="outline" size="sm" onClick={handleSaveImage} className="text-xs">
          <ImageIcon className="w-3.5 h-3.5" />
          画像保存
        </Button>
      </div>
    </div>
  );
}
