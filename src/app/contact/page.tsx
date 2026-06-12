"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Clock,
  Mail,
  Package,
  Paperclip,
  X,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { HomeCtaButton } from "@/components/home-cta-button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/LanguageContext";
import { UPLOAD_IMAGE_ACCEPT } from "@/lib/allowed-image-types";
import {
  CONTACT_ATTACHMENT_MAX_FILES,
  validateContactAttachments,
} from "@/lib/contact-attachment-rules";
import { trackContact } from "@/lib/meta-pixel-events";
import { getPersistedLgSessionId } from "@/lib/session-id";
import { cn } from "@/lib/utils";

const SIDEBAR_LINKS = [
  { labelKey: "contact.sidebarReturns", href: "/returns" },
  { labelKey: "contact.sidebarFaq", href: "/qa" },
] as const;

function ContactPageContent() {
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const previewSessionIdFromUrl = searchParams.get("previewSessionId");
  const secondaryPreviewSessionIdFromUrl = searchParams.get(
    "secondaryPreviewSessionId",
  );
  const [previewSessionId, setPreviewSessionId] = useState<string | null>(
    previewSessionIdFromUrl,
  );
  const [secondaryPreviewSessionId, setSecondaryPreviewSessionId] = useState<
    string | null
  >(secondaryPreviewSessionIdFromUrl);

  useEffect(() => {
    if (previewSessionIdFromUrl) {
      setPreviewSessionId(previewSessionIdFromUrl);
    } else {
      setPreviewSessionId(getPersistedLgSessionId());
    }
    setSecondaryPreviewSessionId(secondaryPreviewSessionIdFromUrl);
  }, [previewSessionIdFromUrl, secondaryPreviewSessionIdFromUrl]);

  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const textAlign = locale === "en" ? "text-left" : "text-right";
  const labelClass = cn(
    "mb-1.5 block text-xs font-body-bold text-dark-gray lg:mb-2 lg:text-sm",
    textAlign,
  );
  const inputClass = cn(
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm font-body text-dark-gray placeholder:text-sm placeholder:text-medium-gray focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 lg:h-12 lg:px-4 lg:text-base lg:placeholder:text-base",
    textAlign,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      if (attachedFiles.length > 0) {
        const validation = validateContactAttachments(attachedFiles);
        if (!validation.ok) {
          setSubmitStatus({
            type: "error",
            message: t(validation.errorKey),
          });
          setIsSubmitting(false);
          return;
        }
      }

      let response: Response;
      const hasAttachments = attachedFiles.length > 0;
      if (hasAttachments) {
        const body = new FormData();
        body.append("name", formData.name);
        body.append("email", formData.email);
        body.append("subject", formData.subject);
        body.append("message", formData.message);
        if (previewSessionId) {
          body.append("previewSessionId", previewSessionId);
        }
        if (secondaryPreviewSessionId) {
          body.append("secondaryPreviewSessionId", secondaryPreviewSessionId);
        }
        attachedFiles.forEach((file) => body.append("images", file));
        response = await fetch("/api/contact", {
          method: "POST",
          body,
        });
      } else {
        response = await fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...formData,
            ...(previewSessionId ? { previewSessionId } : {}),
            ...(secondaryPreviewSessionId
              ? { secondaryPreviewSessionId }
              : {}),
          }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || t("contact.success"),
        });

        try {
          trackContact();
        } catch (err) {
          console.error("Error tracking Contact:", err);
        }

        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
        setAttachedFiles([]);
        if (attachmentInputRef.current) {
          attachmentInputRef.current.value = "";
        }
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || t("contact.error"),
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: t("contact.serverError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const remaining = CONTACT_ATTACHMENT_MAX_FILES - attachedFiles.length;
    if (remaining <= 0) {
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }
      return;
    }

    const selected = Array.from(event.target.files ?? []).slice(0, remaining);
    if (selected.length === 0) {
      return;
    }

    const merged = [...attachedFiles, ...selected];
    const validation = validateContactAttachments(merged);
    if (!validation.ok) {
      setSubmitStatus({
        type: "error",
        message: t(validation.errorKey),
      });
      if (attachmentInputRef.current) {
        attachmentInputRef.current.value = "";
      }
      return;
    }

    setAttachedFiles(merged);
    setSubmitStatus({ type: null, message: "" });
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles((current) => current.filter((_, i) => i !== index));
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  const isRtl = locale === "he";

  const contactInfoRow = (icon: ReactNode, content: ReactNode) => (
    <li
      dir={isRtl ? "ltr" : undefined}
      className={cn("flex w-full", isRtl ? "justify-end" : "justify-start")}
    >
      <span className="inline-flex items-center gap-3 font-body text-sm text-dark-gray">
        {isRtl ? (
          <>
            <span dir="rtl">{content}</span>
            {icon}
          </>
        ) : (
          <>
            {icon}
            <span>{content}</span>
          </>
        )}
      </span>
    </li>
  );

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#F0E8DE] lg:bg-white">
      <Header />

      <main id="main-content" className="flex flex-1 flex-col">
        <section className="flex flex-1 flex-col pt-[calc(72px+var(--banner-height,0px)+20px)] lg:pt-28">
          {/* Mobile header */}
          <div className="px-4 pb-6 text-center lg:hidden">
            <span className="inline-block rounded-full bg-[#E8DFD4] px-4 py-1.5 font-body text-sm text-dark-gray">
              {t("contact.badge")}
            </span>
            <h1 className="mt-3 font-heading text-2xl font-bold leading-tight text-dark-gray">
              {t("contact.sidebarTitle")}
            </h1>
            <p className="mt-2 font-body text-sm leading-relaxed text-medium-gray">
              {t("contact.mobileSubtitle")}
            </p>
          </div>

          <div
            className="grid min-h-0 flex-1 lg:grid-cols-[2fr_1fr] lg:items-stretch"
            dir="ltr"
          >
            {/* Form column */}
            <div className="flex justify-center px-4 pb-10 sm:px-6 lg:col-start-1 lg:justify-end lg:bg-white lg:px-12 lg:py-14 xl:px-16">
              <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-sm sm:p-6 lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none">
                <form
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  dir={isRtl ? "rtl" : "ltr"}
                >
                {previewSessionId && (
                  <input
                    type="hidden"
                    name="previewSessionId"
                    value={previewSessionId}
                  />
                )}
                {secondaryPreviewSessionId && (
                  <input
                    type="hidden"
                    name="secondaryPreviewSessionId"
                    value={secondaryPreviewSessionId}
                  />
                )}

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  <div>
                    <label htmlFor="name" className={labelClass}>
                      {t("contact.name")}{" "}
                      <span className="text-primary-orange">*</span>
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder={t("contact.namePlaceholder")}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className={labelClass}>
                      {t("contact.email")}{" "}
                      <span className="text-primary-orange">*</span>
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={cn(inputClass, "dir-ltr")}
                      placeholder={t("contact.emailPlaceholder")}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className={labelClass}>
                    {t("contact.subject")}
                  </label>
                  <Input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder={t("contact.subjectPlaceholder")}
                    dir={isRtl ? "rtl" : undefined}
                  />
                </div>

                <div>
                  <label htmlFor="message" className={labelClass}>
                    {t("contact.message")}{" "}
                    <span className="text-primary-orange">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={cn(
                      "min-h-[120px] w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm font-body text-dark-gray placeholder:text-sm placeholder:text-medium-gray focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 lg:min-h-[220px] lg:px-4 lg:py-3 lg:text-base lg:placeholder:text-base",
                      textAlign,
                    )}
                    placeholder={t("contact.messagePlaceholder")}
                  />
                </div>

                <div>
                  <input
                    ref={attachmentInputRef}
                    type="file"
                    accept={UPLOAD_IMAGE_ACCEPT}
                    multiple
                    className="hidden"
                    onChange={handleAttachmentChange}
                    disabled={
                      isSubmitting ||
                      attachedFiles.length >= CONTACT_ATTACHMENT_MAX_FILES
                    }
                  />
                  <button
                    type="button"
                    disabled={
                      isSubmitting ||
                      attachedFiles.length >= CONTACT_ATTACHMENT_MAX_FILES
                    }
                    onClick={() => attachmentInputRef.current?.click()}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-gray-300 bg-[#F7F5F2] px-3 py-2.5 text-sm transition-colors hover:bg-[#F0EBE5] disabled:cursor-not-allowed disabled:opacity-50 lg:px-4 lg:py-3.5",
                      locale === "he" ? "flex-row-reverse" : "flex-row",
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center gap-2 font-body text-sm text-dark-gray",
                        locale === "he" ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <Paperclip className="h-4 w-4 shrink-0 text-medium-gray" />
                      {t("contact.attachments")}
                    </span>
                    <span className="shrink-0 font-body text-xs text-medium-gray lg:hidden">
                      {t("contact.attachmentsLimitHintShort")}
                    </span>
                    <span className="hidden shrink-0 font-body text-xs text-medium-gray lg:inline">
                      {t("contact.attachmentsLimitHint")}
                    </span>
                  </button>

                  {attachedFiles.length > 0 && (
                    <ul className="mt-3 space-y-2">
                      {attachedFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${file.size}-${index}`}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2",
                            locale === "en" ? "flex-row" : "flex-row-reverse",
                          )}
                        >
                          <span className="min-w-0 flex-1 truncate font-body text-sm text-dark-gray">
                            {file.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            disabled={isSubmitting}
                            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label={t("contact.attachmentsRemove")}
                          >
                            <X className="h-4 w-4" strokeWidth={2.25} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {previewSessionId && (
                  <>
                    <p
                      className={cn(
                        "text-center font-body text-xs leading-relaxed text-medium-gray lg:hidden",
                      )}
                    >
                      {t("contact.previewLinkedMobile")}
                    </p>
                    <p
                      className={cn(
                        "hidden font-body text-sm text-medium-gray lg:block",
                        textAlign,
                      )}
                    >
                      {t("contact.previewLinked")}
                    </p>
                  </>
                )}

                {submitStatus.type && (
                  <div
                    className={cn(
                      "rounded-lg p-4",
                      submitStatus.type === "success"
                        ? "border border-warm-tan bg-warm-cream text-accent-burgundy"
                        : "border border-red-200 bg-red-50 text-red-800",
                    )}
                  >
                    <p className="font-body text-sm">{submitStatus.message}</p>
                  </div>
                )}

                <HomeCtaButton
                  type="submit"
                  fullWidth
                  disabled={isSubmitting}
                  sx={{ py: { xs: 1.25, lg: 1.75 } }}
                >
                  {isSubmitting ? t("contact.submitting") : t("contact.submit")}
                </HomeCtaButton>
              </form>
              </div>
            </div>

            {/* Desktop sidebar */}
            <aside
              className="hidden bg-[#F0E8DE] px-4 py-10 sm:px-6 lg:col-start-2 lg:block lg:h-full lg:min-h-full lg:px-12 lg:py-14 xl:px-16"
              dir={isRtl ? "rtl" : "ltr"}
            >
              <div
                className={cn(
                  "mx-auto w-full max-w-md lg:max-w-lg lg:mx-0",
                  isRtl ? "text-right" : "text-left",
                )}
              >
                <span className="inline-block rounded-full bg-[#E8DFD4] px-4 py-1.5 font-body text-sm text-dark-gray">
                  {t("contact.badge")}
                </span>

                <h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-dark-gray lg:text-4xl">
                  {t("contact.sidebarTitle")}
                </h1>

                <p className="mt-3 font-body text-base leading-relaxed text-medium-gray">
                  {t("contact.sidebarSubtitle")}
                </p>

                <ul
                  dir={isRtl ? "ltr" : undefined}
                  className={cn("mt-8 space-y-5", isRtl && "text-right")}
                >
                  {contactInfoRow(
                    <Clock className="h-5 w-5 shrink-0 text-dark-gray" strokeWidth={1.75} />,
                    t("contact.responseTime"),
                  )}
                  {contactInfoRow(
                    <Mail className="h-5 w-5 shrink-0 text-dark-gray" strokeWidth={1.75} />,
                    <a
                      href={`mailto:${t("contact.supportEmail")}`}
                      className="font-body text-sm text-dark-gray underline-offset-2 hover:underline"
                      dir="ltr"
                    >
                      {t("contact.supportEmail")}
                    </a>,
                  )}
                  {contactInfoRow(
                    <Package className="h-5 w-5 shrink-0 text-dark-gray" strokeWidth={1.75} />,
                    t("contact.deliveryTime"),
                  )}
                </ul>

                <div className="mt-10 border-t border-[#D9CEC4] pt-8">
                  <div
                    dir="ltr"
                    className={cn(
                      "flex flex-col gap-3",
                      isRtl ? "items-end" : "items-start",
                    )}
                  >
                    {SIDEBAR_LINKS.map((link) => (
                      <Link
                        key={link.labelKey}
                        href={link.href}
                        className="inline-flex w-fit rounded-full bg-white px-5 py-2.5 font-body-bold text-sm text-dark-gray transition-colors hover:bg-white/80"
                      >
                        {t(link.labelKey)}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={null}>
      <ContactPageContent />
    </Suspense>
  );
}
