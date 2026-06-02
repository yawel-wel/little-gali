import type { CartItem } from "@/lib/CartContext";
import { cn } from "@/lib/utils";

export function resolveCartLinePrice(
  item: CartItem,
  fallback: { total: number; compare?: number },
) {
  if (item.lineTotalAmount != null) {
    return {
      total: item.lineTotalAmount,
      compare: item.lineCompareAmount,
    };
  }
  return fallback;
}

type CartLinePriceProps = {
  total: number;
  compare?: number;
  className?: string;
};

export function CartLinePrice({ total, compare, className }: CartLinePriceProps) {
  const onSale = compare != null && compare > total + 0.009;
  const displayTotal = Math.round(total);
  const displayCompare = compare != null ? Math.round(compare) : null;

  return (
    <p
      className={cn(
        "text-sm md:text-base font-body-bold text-dark-gray",
        className,
      )}
      dir="ltr"
    >
      {onSale && displayCompare != null ? (
        <>
          <span>₪ {displayTotal}</span>
          <span className="ml-2 font-body font-normal text-medium-gray line-through">
            ₪ {displayCompare}
          </span>
        </>
      ) : (
        <span>₪ {displayTotal}</span>
      )}
    </p>
  );
}
