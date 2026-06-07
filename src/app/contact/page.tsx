"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
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

const easeOwlet = [0.16, 1, 0.3, 1];

function ContactPageContent() {
  const prefersReducedMotion = useReducedMotion();
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

  const isPreviewContact = Boolean(previewSessionId);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      if (isPreviewContact && attachedFiles.length > 0) {
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
      const hasAttachments = isPreviewContact && attachedFiles.length > 0;
      if (hasAttachments) {
        const body = new FormData();
        body.append("name", formData.name);
        body.append("email", formData.email);
        body.append("message", formData.message);
        body.append("previewSessionId", previewSessionId!);
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
    } catch (error) {
      setSubmitStatus({
        type: "error",
        message: t("contact.serverError"),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

  const textAlign = locale === "en" ? "text-left" : "text-right";

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main id="main-content" className="flex-1">
        <motion.section
          className="relative py-16 lg:py-24 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-16">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
                {/* Left Side - Title and Image Placeholder */}
                <motion.div
                  className="order-1 lg:order-1"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 1.1, ease: easeOwlet, delay: 0.1 }}
                  viewport={{ once: true, amount: 0.25 }}
                >
                  <div className="space-y-4">
                    {/* Title */}
                    <div className="w-full">
                      <Title
                        highlightText={t("contact.titleHighlight")}
                        size="lg"
                        className="w-full m-0 text-center"
                      >
                        {t("contact.title")}
                      </Title>
                      <div className="mt-4 text-center">
                        <p className="text-base font-body text-medium-gray leading-relaxed">
                          {t("contact.subtitle1")}
                        </p>
                        <p className="text-base font-body text-medium-gray leading-relaxed">
                          {t("contact.subtitle2")}
                        </p>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden">
                      <img
                        src="/contact-us.png"
                        alt={t("contact.imageAlt")}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Right Side - Form */}
                <motion.div
                  className="order-2 lg:order-2"
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 1.1, ease: easeOwlet, delay: 0.2 }}
                  viewport={{ once: true, amount: 0.25 }}
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
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

                    {/* Name Field */}
                    <div>
                      <label
                        htmlFor="name"
                        className={`block text-sm font-body-bold text-dark-gray mb-2 ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                      >
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
                        className={`w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 bg-white ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                        placeholder={t("contact.namePlaceholder")}
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label
                        htmlFor="email"
                        className={`block text-sm font-body-bold text-dark-gray mb-2 ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                      >
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
                        className={`w-full h-12 px-4 border border-gray-300 rounded-lg focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 bg-white ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                        placeholder={t("contact.emailPlaceholder")}
                      />
                    </div>

                    {/* Message Field */}
                    <div>
                      <label
                        htmlFor="message"
                        className={`block text-sm font-body-bold text-dark-gray mb-2 ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                      >
                        {t("contact.message")}{" "}
                        <span className="text-primary-orange">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        rows={8}
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-orange focus:ring-2 focus:ring-primary-orange/20 bg-white resize-none font-body text-dark-gray ${
                          locale === "en" ? "text-left" : "text-right"
                        }`}
                        placeholder={t("contact.messagePlaceholder")}
                      />
                      {previewSessionId && (
                        <p
                          className={cn(
                            "mt-1 font-body text-sm text-medium-gray",
                            textAlign,
                          )}
                        >
                          {t("contact.previewLinked")}
                        </p>
                      )}
                    </div>

                    {isPreviewContact && (
                      <div>
                        <label
                          className={cn(
                            "mb-2 block text-sm font-body-bold text-dark-gray",
                            textAlign,
                          )}
                        >
                          {t("contact.attachments")}
                        </label>
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
                        <div
                          dir={locale === "en" ? "ltr" : "rtl"}
                          className="flex flex-wrap items-center justify-start gap-3"
                        >
                          <Button
                            type="button"
                            variant="outline"
                            disabled={
                              isSubmitting ||
                              attachedFiles.length >= CONTACT_ATTACHMENT_MAX_FILES
                            }
                            onClick={() => attachmentInputRef.current?.click()}
                            className="cursor-pointer gap-2 rounded-full border-gray-300 bg-white font-body text-dark-gray hover:bg-gray-50"
                          >
                            <ImagePlus
                              className="h-4 w-4"
                              strokeWidth={2.25}
                            />
                            {t("contact.attachmentsChoose")}
                          </Button>
                        </div>
                        <p
                          className={cn(
                            "mt-2 font-body text-xs text-medium-gray",
                            textAlign,
                          )}
                        >
                          {t("contact.attachmentsLimitHint")}
                        </p>
                        {attachedFiles.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {attachedFiles.map((file, index) => (
                              <li
                                key={`${file.name}-${file.size}-${index}`}
                                className={cn(
                                  "flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2",
                                  locale === "en"
                                    ? "flex-row"
                                    : "flex-row-reverse",
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
                    )}

                    {/* Status Messages */}
                    {submitStatus.type && (
                      <div
                        className={`p-4 rounded-lg ${
                          submitStatus.type === "success"
                            ? "bg-green-50 border border-green-200 text-green-800"
                            : "bg-red-50 border border-red-200 text-red-800"
                        }`}
                      >
                        <p className="font-body text-sm">
                          {submitStatus.message}
                        </p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div>
                      <motion.div
                        whileHover={{
                          scale: 1.01,
                          y: -1,
                          transition: { duration: 0.2, ease: easeOwlet },
                        }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-body-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting
                            ? t("contact.submitting")
                            : t("contact.submit")}
                        </Button>
                      </motion.div>
                    </div>
                  </form>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
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
