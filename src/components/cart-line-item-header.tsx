"use client";

type CartLineItemHeaderProps = {
  title: string;
  /** Optional line under the title (e.g. what a gift set contains). */
  subtitle?: string;
  unitPrice: number;
  locale: string;
};

export function CartLineItemHeader({
  title,
  subtitle,
  unitPrice,
  locale,
}: CartLineItemHeaderProps) {
  const align = locale === "en" ? "text-left" : "text-right";

  return (
    <div className={`flex flex-col ${align}`}>
      <h3 className="mb-0 text-sm font-body-bold leading-tight text-dark-gray md:text-base">
        {title}
      </h3>
      {subtitle ? (
        <p className="mb-1 font-body text-xs leading-tight text-medium-gray md:text-sm">
          {subtitle}
        </p>
      ) : null}
      <p
        className="-mt-1 text-sm font-body-bold leading-tight text-dark-gray md:text-base"
        dir="ltr"
      >
        ₪ {Math.round(unitPrice)}
      </p>
    </div>
  );
}
