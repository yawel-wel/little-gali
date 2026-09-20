"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type BlogShareButtonProps = {
  title: string;
  text: string;
  url: string;
};

export function BlogShareButton({ title, text, url }: BlogShareButtonProps) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [failedUrl, setFailedUrl] = useState(url);

  const copyLink = async (pageUrl: string) => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setStatus("copied");
    } catch {
      setFailedUrl(pageUrl);
      setStatus("failed");
    }
  };

  const handleShare = async () => {
    const pageUrl = window.location.href || url;

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: pageUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyLink(pageUrl);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-dark-gray/20 px-4 py-2 font-body-bold text-sm text-dark-gray transition-colors duration-200 hover:border-primary-orange hover:text-primary-orange"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        {t("blog.share")}
      </button>
      {status === "copied" ? (
        <p className="mt-2 font-body text-sm text-medium-gray" role="status">
          {t("blog.copied")}
        </p>
      ) : null}
      {status === "failed" ? (
        <p className="mt-2 break-all font-body text-sm text-medium-gray" role="status">
          {t("blog.copyFailed")} {failedUrl}
        </p>
      ) : null}
    </div>
  );
}
