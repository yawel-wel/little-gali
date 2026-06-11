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
import {
  QA_ACCORDION_CLASS,
  QA_ACCORDION_ITEM_CLASS,
  QA_TABS_ROW_CLASS,
  qaAccordionContentClass,
  qaAccordionTriggerClass,
  qaTabClass,
} from "@/components/qa-shared-styles";

type QaTab = "books" | "framed";

type QaItem = {
  id: string;
  questionKey: string;
  answerKey: string;
  hasContactLink?: boolean;
};

type QaTabsSectionProps = {
  /** Subset of book Q&A keys for home (shorter list). */
  bookItemIds?: string[];
  /** Subset of framed Q&A keys for home (shorter list). */
  framedItemIds?: string[];
  className?: string;
  /** Hide books/framed tabs and show book Q&A only. */
  hideTabs?: boolean;
};

const BOOK_ITEMS: QaItem[] = [
  { id: "preview", questionKey: "qa.questionPreview", answerKey: "qa.answerPreview" },
  { id: "safety", questionKey: "qa.questionSafety", answerKey: "qa.answerSafety" },
  { id: "photos", questionKey: "qa.questionPhotos", answerKey: "qa.answerPhotos" },
  { id: "fromBirth", questionKey: "qa.questionFromBirth", answerKey: "qa.answerFromBirth" },
  { id: "delivery", questionKey: "qa.questionDelivery", answerKey: "qa.answerDelivery" },
  { id: "special", questionKey: "qa.questionSpecial", answerKey: "qa.answerSpecial" },
  { id: "photoCount", questionKey: "qa.questionPhotoCount", answerKey: "qa.answerPhotoCount" },
  { id: "peopleCount", questionKey: "qa.questionPeopleCount", answerKey: "qa.answerPeopleCount" },
  { id: "gift", questionKey: "qa.questionGift", answerKey: "qa.answerGift" },
  { id: "similarity", questionKey: "qa.questionSimilarity", answerKey: "qa.answerSimilarity" },
  { id: "cleaning", questionKey: "qa.questionCleaning", answerKey: "qa.answerCleaning" },
  {
    id: "unsatisfied",
    questionKey: "qa.questionUnsatisfied",
    answerKey: "qa.answerUnsatisfied",
    hasContactLink: true,
  },
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

const HOME_BOOK_IDS = ["preview", "safety", "photos", "fromBirth", "delivery"];
const HOME_FRAMED_IDS = ["f1", "f4", "f5", "f8", "f9"];

function filterBookItems(items: QaItem[], bookItemIds: string[] | undefined) {
  return bookItemIds ? items.filter((item) => bookItemIds.includes(item.id)) : items;
}

function QaAnswerText({ text }: { text: string }) {
  const paragraphs = text.split("\n\n");

  return (
    <span className="block space-y-1">
      {paragraphs.map((paragraph, index) => (
        <span key={index} className="block whitespace-pre-line">
          {paragraph}
        </span>
      ))}
    </span>
  );
}

function renderAnswer(item: QaItem, t: (key: string) => string) {
  if (item.hasContactLink) {
    return (
      <span className="block space-y-1">
        <span className="block">{t("qa.answerUnsatisfied.line1")}</span>
        <span className="block">
          {t("qa.answerUnsatisfied.beforeLink")}
          <Link
            href="/contact"
            className="underline underline-offset-2 decoration-current hover:opacity-80"
          >
            {t("qa.answerUnsatisfied.linkText")}
          </Link>
        </span>
      </span>
    );
  }

  return <QaAnswerText text={t(item.answerKey)} />;
}

export function QaTabsSection({
  bookItemIds,
  framedItemIds,
  className,
  hideTabs = false,
}: QaTabsSectionProps) {
  const { t, locale } = useLanguage();
  const [tab, setTab] = useState<QaTab>("books");

  const bookItems = filterBookItems(BOOK_ITEMS, bookItemIds);

  const framedItems = framedItemIds
    ? FRAMED_ITEMS.filter((item) => framedItemIds.includes(item.id))
    : FRAMED_ITEMS;

  const items = hideTabs || tab === "books" ? bookItems : framedItems;

  return (
    <div className={className}>
      {!hideTabs && (
        <div className={QA_TABS_ROW_CLASS}>
          <button
            type="button"
            onClick={() => setTab("books")}
            className={qaTabClass(tab === "books")}
          >
            {t("qa.tabs.books")}
          </button>
          <button
            type="button"
            onClick={() => setTab("framed")}
            className={qaTabClass(tab === "framed")}
          >
            {t("qa.tabs.framed")}
          </button>
        </div>
      )}

      <Accordion
        type="single"
        collapsible
        className={cn(QA_ACCORDION_CLASS, !hideTabs && "mt-6")}
      >
        {items.map((item) => (
          <AccordionItem key={item.id} value={item.id} className={QA_ACCORDION_ITEM_CLASS}>
            <AccordionTrigger className={qaAccordionTriggerClass(locale)}>
              {t(item.questionKey)}
            </AccordionTrigger>
            <AccordionContent className={qaAccordionContentClass(locale, "pt-2")}>
              {renderAnswer(item, t)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

export { HOME_BOOK_IDS, HOME_FRAMED_IDS };
