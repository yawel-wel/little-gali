"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/lib/LanguageContext";
import { cn } from "@/lib/utils";

type QaTab = "books" | "framed";

type QaItem = {
  id: string;
  questionKey: string;
  answerKey: string;
};

type QaTabsSectionProps = {
  /** Subset of book Q&A keys for home (shorter list). */
  bookItemIds?: string[];
  /** Subset of framed Q&A keys for home (shorter list). */
  framedItemIds?: string[];
  className?: string;
  previewOn?: boolean;
};

const BOOK_ITEMS: QaItem[] = [
  { id: "1", questionKey: "qa.question1", answerKey: "qa.answer1" },
  { id: "2", questionKey: "qa.question2", answerKey: "qa.answer2" },
  { id: "preview", questionKey: "qa.questionPreview", answerKey: "qa.answerPreview" },
  { id: "3", questionKey: "qa.question3", answerKey: "qa.answer3" },
  { id: "4", questionKey: "qa.question4", answerKey: "qa.answer4" },
  { id: "5", questionKey: "qa.question5", answerKey: "qa.answer5" },
  { id: "6", questionKey: "qa.question6", answerKey: "qa.answer6" },
  { id: "7", questionKey: "qa.question7", answerKey: "qa.answer7" },
  { id: "8", questionKey: "qa.question8", answerKey: "qa.answer8" },
  { id: "9", questionKey: "qa.question9", answerKey: "qa.answer9" },
];

const FRAMED_ITEMS: QaItem[] = [
  { id: "f1", questionKey: "qa.framed.q1", answerKey: "qa.framed.a1" },
  { id: "f2", questionKey: "qa.framed.q2", answerKey: "qa.framed.a2" },
  { id: "f3", questionKey: "qa.framed.q3", answerKey: "qa.framed.a3" },
  { id: "f4", questionKey: "qa.framed.q4", answerKey: "qa.framed.a4" },
  { id: "f5", questionKey: "qa.framed.q5", answerKey: "qa.framed.a5" },
  { id: "f6", questionKey: "qa.framed.q6", answerKey: "qa.framed.a6" },
  { id: "f7", questionKey: "qa.framed.q7", answerKey: "qa.framed.a7" },
  { id: "f8", questionKey: "qa.framed.q8", answerKey: "qa.framed.a8" },
  { id: "f9", questionKey: "qa.framed.q9", answerKey: "qa.framed.a9" },
  { id: "f10", questionKey: "qa.framed.q10", answerKey: "qa.framed.a10" },
];

const HOME_BOOK_IDS = ["1", "2", "preview", "4", "9"];
const HOME_FRAMED_IDS = ["f1", "f4", "f5", "f8", "f9"];

function filterBookItems(items: QaItem[], bookItemIds: string[] | undefined, previewOn: boolean) {
  const filtered = bookItemIds
    ? items.filter((item) => bookItemIds.includes(item.id))
    : items;
  return previewOn ? filtered : filtered.filter((item) => item.id !== "preview");
}

export function QaTabsSection({
  bookItemIds,
  framedItemIds,
  className,
  previewOn = false,
}: QaTabsSectionProps) {
  const { t, locale } = useLanguage();
  const [tab, setTab] = useState<QaTab>("books");

  const bookItems = filterBookItems(BOOK_ITEMS, bookItemIds, previewOn);

  const framedItems = framedItemIds
    ? FRAMED_ITEMS.filter((item) => framedItemIds.includes(item.id))
    : FRAMED_ITEMS;

  const items = tab === "books" ? bookItems : framedItems;

  return (
    <div className={className}>
      <div className="mb-8 flex justify-center gap-2">
        <button
          type="button"
          onClick={() => setTab("books")}
          className={cn(
            "cursor-pointer rounded-full px-5 py-2 text-sm font-body-bold transition-[colors,opacity] md:hover:opacity-80",
            tab === "books"
              ? "bg-primary-orange text-white"
              : "bg-gray-100 text-gray-900",
          )}
        >
          {t("qa.tabs.books")}
        </button>
        <button
          type="button"
          onClick={() => setTab("framed")}
          className={cn(
            "cursor-pointer rounded-full px-5 py-2 text-sm font-body-bold transition-[colors,opacity] md:hover:opacity-80",
            tab === "framed"
              ? "bg-primary-orange text-white"
              : "bg-gray-100 text-gray-900",
          )}
        >
          {t("qa.tabs.framed")}
        </button>
      </div>

      <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
        {items.map((item) => (
          <AccordionItem
            key={item.id}
            value={item.id}
            className="cursor-pointer rounded-lg border border-soft-peach-light bg-white px-6 py-1.5 shadow-sm md:py-4"
          >
            <AccordionTrigger
              className={cn(
                "cursor-pointer font-body-bold text-dark-gray transition-colors hover:text-primary-orange",
                locale === "en" ? "text-left" : "text-right",
              )}
            >
              {t(item.questionKey)}
            </AccordionTrigger>
            <AccordionContent
              className={cn(
                "whitespace-pre-line pt-4 font-body leading-relaxed text-medium-gray",
                locale === "en" ? "text-left" : "text-right",
              )}
            >
              {item.id === "9" ? (
                previewOn ? (
                  <span className="block space-y-4">
                    <span className="block">{t("qa.answer9.previewLine1")}</span>
                    <span className="block">
                      {t("qa.answer9.previewLine2Before")}
                      <Link
                        href="/contact"
                        className="underline underline-offset-2 decoration-current hover:opacity-80"
                      >
                        {t("qa.answer9.linkText")}
                      </Link>
                    </span>
                  </span>
                ) : (
                  <span>
                    {t("qa.answer9.beforeLink")}
                    <Link
                      href="/contact"
                      className="underline underline-offset-2 decoration-current hover:opacity-80"
                    >
                      {t("qa.answer9.linkText")}
                    </Link>
                  </span>
                )
              ) : (
                t(item.answerKey)
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export { HOME_BOOK_IDS, HOME_FRAMED_IDS };
