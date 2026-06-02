"use client";

import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import { Clock, Gift, Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type CartOrderSummaryProps = {
  totalQuantity: number;
  totalAmount: string | null | undefined;
  addGiftMessage: boolean;
  giftMessage: string;
  isCheckingOut: boolean;
  isLoading: boolean;
  isUpdatingGiftMessage: boolean;
  onGiftMessageCheckboxChange: (checked: boolean) => void;
  onGiftMessageChange: (message: string) => void;
  onCheckout: () => void;
  giftCheckboxId?: string;
};

export function CartOrderSummary({
  totalQuantity,
  totalAmount,
  addGiftMessage,
  giftMessage,
  isCheckingOut,
  isLoading,
  isUpdatingGiftMessage,
  onGiftMessageCheckboxChange,
  onGiftMessageChange,
  onCheckout,
  giftCheckboxId = "addGiftMessage",
}: CartOrderSummaryProps) {
  const { t, locale } = useLanguage();
  const isHe = locale === "he";
  const totalDisplay = totalAmount
    ? parseFloat(totalAmount).toFixed(0)
    : "0";

  const summaryRowClass = `flex justify-between items-center ${
    isHe ? "flex-row-reverse" : "flex-row"
  }`;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h2
        className={`text-xl font-body-bold text-dark-gray mb-4 ${
          isHe ? "text-right" : "text-left"
        }`}
      >
        {t("cart.orderSummary")}
      </h2>

      <div className="space-y-3">
        <div className={summaryRowClass}>
          {isHe ? (
            <>
              <span className="font-body-bold text-dark-gray">
                {totalQuantity}
              </span>
              <span className="text-medium-gray font-body">
                {t("cart.itemsCount")}
              </span>
            </>
          ) : (
            <>
              <span className="text-medium-gray font-body">
                {t("cart.itemsCount")}
              </span>
              <span className="font-body-bold text-dark-gray">
                {totalQuantity}
              </span>
            </>
          )}
        </div>

        <div className={summaryRowClass}>
          {isHe ? (
            <>
              <span className="text-xl font-body-bold text-dark-gray" dir="ltr">
                ₪{totalDisplay}
              </span>
              <span className="font-body-bold text-dark-gray">
                {t("cart.total")}
              </span>
            </>
          ) : (
            <>
              <span className="font-body-bold text-dark-gray">
                {t("cart.total")}
              </span>
              <span className="text-xl font-body-bold text-dark-gray" dir="ltr">
                ₪{totalDisplay}
              </span>
            </>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div
            className="flex items-center gap-1.5"
            dir={isHe ? "rtl" : "ltr"}
          >
            <Clock
              className="h-4 w-4 shrink-0 text-medium-gray"
              strokeWidth={1.75}
              aria-hidden
            />
            <p className="text-sm text-medium-gray font-body">
              {t("cart.deliveryTime")}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div
            className="flex items-center gap-2"
            dir={isHe ? "rtl" : "ltr"}
          >
            <Checkbox
              id={giftCheckboxId}
              size="small"
              checked={addGiftMessage}
              onChange={(e) => onGiftMessageCheckboxChange(e.target.checked)}
              disabled={isUpdatingGiftMessage}
              sx={{
                padding: 0,
                color: "#693430",
                "&.Mui-checked": { color: "#693430" },
                "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
              }}
            />
            <Gift
              className="h-4 w-4 shrink-0 text-accent-burgundy"
              strokeWidth={1.75}
              aria-hidden
            />
            <label
              htmlFor={giftCheckboxId}
              className="text-sm text-dark-gray font-body cursor-pointer"
            >
              {t("cart.addGiftMessage")}
            </label>
          </div>

          {addGiftMessage && (
            <div className="mt-3">
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder={t("cart.giftMessagePlaceholder")}
                value={giftMessage}
                onChange={(e) => onGiftMessageChange(e.target.value)}
                disabled={isUpdatingGiftMessage}
                inputProps={{
                  maxLength: 200,
                  dir: isHe ? "rtl" : "ltr",
                  style: { whiteSpace: "pre-wrap" },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    fontFamily: "inherit",
                    fontSize: "0.875rem",
                    "& fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(0, 0, 0, 0.4)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#693430",
                    },
                  },
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="contained"
          onClick={onCheckout}
          disabled={isCheckingOut || isLoading}
          className="w-full cursor-pointer"
          sx={{
            borderRadius: "9999px",
            textTransform: "none",
            fontSize: "0.95rem",
            fontWeight: 700,
            py: 1.25,
            minHeight: 48,
            backgroundColor: "#693430",
            color: "#fff",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#5a2c28",
              boxShadow: "none",
            },
            "&.Mui-disabled": {
              backgroundColor: "rgba(105, 52, 48, 0.5)",
              color: "#fff",
            },
          }}
        >
          {isCheckingOut ? (
            <>
              <Loader2
                className={`w-5 h-5 animate-spin ${
                  isHe ? "ml-2" : "mr-2"
                }`}
              />
              {t("cart.checkoutProgress")}
            </>
          ) : (
            t("cart.checkout")
          )}
        </Button>
      </div>
    </div>
  );
}
