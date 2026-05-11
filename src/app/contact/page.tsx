"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/LanguageContext";
import { trackContact } from "@/lib/meta-pixel-events";

const easeOwlet = [0.16, 1, 0.3, 1];

function ContactPageContent() {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const searchParams = useSearchParams();
  const previewSessionId = searchParams.get("previewSessionId");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  useEffect(() => {
    if (!previewSessionId) return;

    const loadPreviewContext = async () => {
      try {
        const response = await fetch(`/api/preview-session/${previewSessionId}`);
        if (!response.ok) return;
        const data = await response.json();
        const session = data.session;
        if (!session) return;

        const lines = [
          `מזהה תצוגה מקדימה: ${session.id}`,
          "",
          "תמונות מקור:",
          ...session.slots.map(
            (slot: { index: number; originalUrl: string }) =>
              `${slot.index + 1}. ${slot.originalUrl}`,
          ),
          "",
          "תוצאות שחור-לבן שנבחרו:",
          ...session.slots.map(
            (slot: {
              index: number;
              activeCandidateId?: string;
              candidates: Array<{ id: string; previewUrl?: string }>;
            }) => {
              const active = slot.candidates.find(
                (candidate) => candidate.id === slot.activeCandidateId,
              );
              return `${slot.index + 1}. ${active?.previewUrl || "לא זמין"}`;
            },
          ),
          "",
          "הודעה:",
        ];

        setFormData((current) => ({
          ...current,
          message: current.message || lines.join("\n"),
        }));
      } catch {
        // Ignore prefill failures and let the user type manually.
      }
    };

    loadPreviewContext();
  }, [previewSessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          previewSessionId: previewSessionId || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: data.message || t("contact.success"),
        });
        
        // Track Meta Pixel Contact event
        try {
          trackContact();
        } catch (err) {
          console.error("Error tracking Contact:", err);
        }
        
        // Reset form
        setFormData({
          name: "",
          email: "",
          message: "",
        });
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
    // Clear status when user starts typing
    if (submitStatus.type) {
      setSubmitStatus({ type: null, message: "" });
    }
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main className="flex-1">
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
                          מתלבטים בקשר לתמונות? יש לכם שאלה?
                        </p>
                        <p className="text-base font-body text-medium-gray leading-relaxed">
                          מוזמנים ליצור איתנו קשר ונשמח לעזור בכל נושא
                        </p>
                      </div>
                    </div>

                    {/* Image */}
                    <div className="w-full h-64 lg:h-80 rounded-lg overflow-hidden">
                      <img
                        src="/contact-us.png"
                        alt="Contact Us"
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
                    </div>

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
