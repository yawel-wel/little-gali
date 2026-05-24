"use client";

import Button from "@mui/material/Button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

type PreviewPhaseFooterProps = {
  headline: string;
  buttonLabel: string;
  buttonDisabled?: boolean;
  isSubmitting?: boolean;
  submittingLabel?: string;
  onButtonClick: () => void;
  contactBefore: string;
  contactLinkLabel: string;
  onContactClick: () => void;
  contactAfter?: string;
  variant?: "inline" | "fixedMobile";
};

function PreviewPhaseContactLine({
  contactBefore,
  contactLinkLabel,
  onContactClick,
  contactAfter,
  className,
}: {
  contactBefore: string;
  contactLinkLabel: string;
  onContactClick: () => void;
  contactAfter?: string;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-center font-body text-xs text-dark-gray/55",
        className,
      )}
    >
      {contactBefore}
      <button
        type="button"
        onClick={onContactClick}
        className="cursor-pointer border-0 bg-transparent p-0 font-body text-xs text-dark-gray/55 underline decoration-dark-gray/30 underline-offset-2 transition-opacity hover:text-dark-gray/70"
      >
        {contactLinkLabel}
      </button>
      {contactAfter ?? null}
    </p>
  );
}

export function PreviewPhaseFooter({
  headline,
  buttonLabel,
  buttonDisabled = false,
  isSubmitting = false,
  submittingLabel,
  onButtonClick,
  contactBefore,
  contactLinkLabel,
  onContactClick,
  contactAfter,
  variant = "inline",
}: PreviewPhaseFooterProps) {
  const label = isSubmitting && submittingLabel ? submittingLabel : buttonLabel;

  const ctaButton = (
    <Button
      variant="contained"
      disabled={buttonDisabled || isSubmitting}
      onClick={onButtonClick}
      className="!rounded-full !bg-accent-burgundy !px-10 !py-2.5 !text-base !normal-case !text-white hover:!bg-[#5a2b28]"
      sx={{
        "& .MuiButton-endIcon": {
          marginInlineStart: "4px",
          marginInlineEnd: 0,
        },
        boxShadow: "none",
      }}
      endIcon={
        <ArrowLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
      }
    >
      {label}
    </Button>
  );

  if (variant === "fixedMobile") {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E0E0E0] bg-white px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
        dir="rtl"
      >
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-2">
          <p className="text-center font-body text-sm text-dark-gray">{headline}</p>
          {ctaButton}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 hidden border-t border-[#E5DDD4] pt-8 md:block">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full flex-col items-center gap-2">
          <p className="mt-4 text-center font-body text-base text-dark-gray">
            {headline}
          </p>
          {ctaButton}
        </div>
        <PreviewPhaseContactLine
          contactBefore={contactBefore}
          contactLinkLabel={contactLinkLabel}
          onContactClick={onContactClick}
          contactAfter={contactAfter}
          className="-mt-2"
        />
      </div>
    </div>
  );
}

export type PreviewPhaseMobileContactProps = {
  contactBefore: string;
  contactLinkLabel: string;
  onContactClick: () => void;
  contactAfter?: string;
};

export function PreviewPhaseMobileContact({
  contactBefore,
  contactLinkLabel,
  onContactClick,
  contactAfter,
}: PreviewPhaseMobileContactProps) {
  return (
    <div className="mt-2 border-t border-[#E5DDD4] pt-4 max-md:pb-9 md:hidden">
      <PreviewPhaseContactLine
        contactBefore={contactBefore}
        contactLinkLabel={contactLinkLabel}
        onContactClick={onContactClick}
        contactAfter={contactAfter}
      />
    </div>
  );
}

PreviewPhaseFooter.MobileContact = PreviewPhaseMobileContact;
