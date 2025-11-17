"use client";

import { Plus, Minus, Trash, Loader2 } from "lucide-react";

interface QuantityControlsProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onDelete: () => void;
  isLoading?: boolean;
  isDeleting?: boolean;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

export function QuantityControls({
  quantity,
  onIncrease,
  onDecrease,
  onDelete,
  isLoading = false,
  isDeleting = false,
  disabled = false,
  size = "md",
}: QuantityControlsProps) {
  const isQuantityOne = quantity === 1;

  // Size variants
  const sizeClasses = {
    sm: {
      button: "px-2.5 py-1.5",
      icon: "w-3.5 h-3.5",
      quantity: "px-3 py-1.5 text-sm",
    },
    md: {
      button: "px-3 md:px-4 py-2",
      icon: "w-4 h-4 md:w-5 md:h-5",
      quantity: "px-4 md:px-6 py-2 text-base md:text-lg",
    },
    lg: {
      button: "px-4 py-2.5",
      icon: "w-5 h-5",
      quantity: "px-6 py-2.5 text-lg",
    },
  };

  const classes = sizeClasses[size];

  return (
    <div className="inline-flex items-center border border-gray-300 rounded overflow-hidden">
      {/* Left Button: Trash (if qty=1) or Minus (if qty>1) */}
      <button
        onClick={isQuantityOne ? onDelete : onDecrease}
        disabled={disabled || isLoading || (isQuantityOne && isDeleting)}
        className={`${classes.button} disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer hover:bg-gray-50 text-dark-gray`}
        aria-label={isQuantityOne ? "Delete item" : "Decrease quantity"}
      >
        {isQuantityOne && isDeleting ? (
          <Loader2 className={`${classes.icon} animate-spin`} />
        ) : isQuantityOne ? (
          <Trash className={classes.icon} />
        ) : (
          <Minus className={classes.icon} />
        )}
      </button>

      {/* Quantity Number */}
      <span
        className={`${
          classes.quantity
        } font-body text-dark-gray border-x border-gray-300 ${
          size === "sm" ? "min-w-[2rem]" : "min-w-[3rem]"
        } text-center`}
      >
        {quantity}
      </span>

      {/* Plus Button */}
      <button
        onClick={onIncrease}
        disabled={disabled || isLoading}
        className={`${classes.button} disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer hover:bg-gray-50`}
        aria-label="Increase quantity"
      >
        <Plus className={classes.icon} />
      </button>
    </div>
  );
}
