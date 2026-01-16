import { cn } from "@/lib/utils";

interface PriceLineItem {
  label: string;
  value: number;
  isDiscount?: boolean;
  isTotal?: boolean;
}

interface PriceCardProps {
  title: string;
  variant: "carshare" | "rental";
  items: PriceLineItem[];
  isCheaper?: boolean;
}

export function PriceCard({ title, variant, items, isCheaper }: PriceCardProps) {
  const formatPrice = (value: number) => {
    return value.toLocaleString("ja-JP");
  };

  return (
    <div
      className={cn(
        "relative rounded-xl p-5 card-shadow transition-all duration-300",
        variant === "carshare" 
          ? "bg-carshare-light border-2 border-carshare/20" 
          : "bg-rental-light border-2 border-rental/20",
        isCheaper && "ring-2 ring-savings ring-offset-2"
      )}
    >
      {isCheaper && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-savings text-savings-foreground text-xs font-bold px-3 py-1 rounded-full animate-scale-in">
          お得！
        </div>
      )}
      
      <h3
        className={cn(
          "text-lg font-bold mb-4 flex items-center gap-2",
          variant === "carshare" ? "text-carshare" : "text-rental"
        )}
      >
        <span
          className={cn(
            "w-3 h-3 rounded-full",
            variant === "carshare" ? "bg-carshare" : "bg-rental"
          )}
        />
        {title}
      </h3>

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex justify-between items-center py-1.5",
              item.isTotal && "border-t-2 border-current/20 pt-3 mt-2"
            )}
          >
            <span
              className={cn(
                "text-sm",
                item.isTotal ? "font-bold text-foreground" : "text-muted-foreground",
                item.isDiscount && "text-savings"
              )}
            >
              {item.label}
            </span>
            <span
              className={cn(
                item.isTotal && "price-text",
                item.isDiscount && "text-savings font-medium",
                !item.isTotal && !item.isDiscount && "font-medium text-foreground"
              )}
            >
              {item.isDiscount && "-"}
              ¥{formatPrice(item.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
