"use client";

type CartLineItemHeaderProps = {
  title: string;
  unitPrice: number;
  locale: string;
};

export function CartLineItemHeader({
  title,
  unitPrice,
  locale,
}: CartLineItemHeaderProps) {
  const align = locale === "en" ? "text-left" : "text-right";

  return (
    <div className={`flex flex-col ${align}`}>
      <h3 className="mb-0 text-sm font-body-bold leading-tight text-dark-gray md:text-base">
        {title}
      </h3>
      <p
        className="-mt-1 text-sm font-body-bold leading-tight text-dark-gray md:text-base"
        dir="ltr"
      >
        ₪ {Math.round(unitPrice)}
      </p>
    </div>
  );
}
