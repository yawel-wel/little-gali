import { cn } from "@/lib/utils";

export const QA_ACCORDION_CLASS = "space-y-2 md:space-y-3";

export const QA_ACCORDION_ITEM_CLASS =
  "cursor-pointer rounded-lg border border-soft-peach-light bg-white px-6 py-[2px] shadow-sm md:py-[10px]";

export const QA_TABS_ROW_CLASS = "mb-0 flex justify-center gap-2";

export function qaTabClass(isActive: boolean) {
  return cn(
    "cursor-pointer rounded-full border-2 px-5 py-2 text-sm font-body-bold transition-colors",
    isActive
      ? "border-primary-orange bg-white text-dark-gray"
      : "border-transparent bg-gray-100 text-gray-900",
  );
}

export function qaAccordionTriggerClass(locale: string) {
  return cn(
    "cursor-pointer font-body text-dark-gray data-[state=open]:font-body-bold data-[state=open]:font-bold",
    locale === "en" ? "text-left" : "text-right",
  );
}

export function qaAccordionContentClass(locale: string, extra?: string) {
  return cn(
    "font-body leading-normal text-medium-gray",
    locale === "en" ? "text-left" : "text-right",
    extra,
  );
}
