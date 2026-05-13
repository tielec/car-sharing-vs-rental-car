import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, Sparkles } from "lucide-react";

interface DonationConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number | null;
  stripeUrl: string | null;
  onConfirm: () => void;
}

export const DonationConfirmDialog = ({
  open,
  onOpenChange,
  amount,
  stripeUrl,
  onConfirm,
}: DonationConfirmDialogProps) => {
  const handleConfirm = () => {
    if (!stripeUrl || amount === null) return;
    onConfirm();
    window.open(stripeUrl, "_blank", "noopener,noreferrer");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>☕</span> 開発を応援する
          </DialogTitle>
          <DialogDescription className="sr-only">
            投げ銭の確認
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-2">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {amount?.toLocaleString()}円
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              で応援します
            </div>
          </div>

          <div className="w-full rounded-lg bg-muted/50 p-4 space-y-2.5 text-sm">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 shrink-0" />
              <span>次の画面で安全な決済サービス（Stripe）にてお支払いいただきます</span>
            </div>
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>カード / Apple Pay / Google Pay 対応</span>
            </div>
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 mt-0.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>登録不要・1回限りの決済</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
          >
            決済画面へ進む
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
