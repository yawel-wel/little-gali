"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function TermsSection({
  title,
  paragraphs,
  locale,
}: {
  title: string;
  paragraphs: string[];
  locale: string;
}) {
  const align = locale === "en" ? "text-left" : "text-right";

  return (
    <div>
      <h2
        className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${align}`}
      >
        {title}
      </h2>
      {paragraphs.map((text, index) => (
        <p
          key={index}
          className={index < paragraphs.length - 1 ? "mb-4" : undefined}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

function TermsPageContent() {
  const { t, locale } = useLanguage();
  const textAlign = locale === "en" ? "text-left" : "text-right";
  const isHebrew = locale === "he";

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main id="main-content" className="flex-1">
        <section
          className="relative py-16 lg:py-24 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-16">
            <div className="max-w-4xl mx-auto">
              <div className="mb-12 text-center">
                <Title
                  as="h1"
                  highlightText={isHebrew ? "שירות" : "Service"}
                  size="lg"
                >
                  {t("terms.title")}
                </Title>
              </div>

              <div
                className={`mb-8 font-body leading-relaxed text-medium-gray ${textAlign}`}
              >
                <p className="mb-4">{t("terms.intro.p1")}</p>
                <p>{t("terms.intro.p2")}</p>
              </div>

              <div
                className={`space-y-8 font-body leading-relaxed text-medium-gray ${textAlign}`}
              >
                <TermsSection
                  locale={locale}
                  title={t("terms.useOfSite.title")}
                  paragraphs={[
                    t("terms.useOfSite.p1"),
                    t("terms.useOfSite.p2"),
                    t("terms.useOfSite.p3"),
                  ]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.userResponsibility.title")}
                  paragraphs={[
                    t("terms.userResponsibility.p1"),
                    t("terms.userResponsibility.p2"),
                    t("terms.userResponsibility.p3"),
                    t("terms.userResponsibility.p4"),
                  ]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.ordersAndPayment.title")}
                  paragraphs={[
                    t("terms.ordersAndPayment.p1"),
                    t("terms.ordersAndPayment.p2"),
                    t("terms.ordersAndPayment.p3"),
                    t("terms.ordersAndPayment.p4"),
                  ]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.productProduction.title")}
                  paragraphs={[
                    t("terms.productProduction.p1"),
                    t("terms.productProduction.p2"),
                    t("terms.productProduction.p3"),
                  ]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.customProducts.title")}
                  paragraphs={[t("terms.customProducts.p1")]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.warrantyAndService.title")}
                  paragraphs={[
                    t("terms.warrantyAndService.p1"),
                    t("terms.warrantyAndService.p2"),
                    t("terms.warrantyAndService.p3"),
                    t("terms.warrantyAndService.p4"),
                  ]}
                />

                <div>
                  <h2
                    className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("terms.safeUse.title")}
                  </h2>
                  <h3
                    className={`mb-3 text-lg font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("terms.safeUse.books.title")}
                  </h3>
                  <p className="mb-4">{t("terms.safeUse.books.p1")}</p>
                  <p className="mb-4">{t("terms.safeUse.books.p2")}</p>
                  <p className="mb-4">{t("terms.safeUse.books.p3")}</p>
                  <p className="mb-4">{t("terms.safeUse.books.p4")}</p>
                  <p className="mb-6">{t("terms.safeUse.books.p5")}</p>
                  <h3
                    className={`mb-3 text-lg font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("terms.safeUse.framed.title")}
                  </h3>
                  <p className="mb-4">{t("terms.safeUse.framed.p1")}</p>
                  <p className="mb-4">{t("terms.safeUse.framed.p2")}</p>
                  <p className="mb-4">{t("terms.safeUse.framed.p3")}</p>
                  <p className="mb-4">{t("terms.safeUse.framed.p4")}</p>
                  <p className="mb-4">{t("terms.safeUse.framed.p5")}</p>
                  <p className="mb-4">{t("terms.safeUse.framed.p6")}</p>
                  <p>{t("terms.safeUse.framed.p7")}</p>
                </div>

                <TermsSection
                  locale={locale}
                  title={t("terms.intellectualProperty.title")}
                  paragraphs={[
                    t("terms.intellectualProperty.p1"),
                    t("terms.intellectualProperty.p2"),
                  ]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.liabilityLimitation.title")}
                  paragraphs={[
                    t("terms.liabilityLimitation.p1"),
                    t("terms.liabilityLimitation.p2"),
                    t("terms.liabilityLimitation.p3"),
                  ]}
                />

                <TermsSection
                  locale={locale}
                  title={t("terms.termsChanges.title")}
                  paragraphs={[
                    t("terms.termsChanges.p1"),
                    t("terms.termsChanges.p2"),
                  ]}
                />

                <div>
                  <h2
                    className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("terms.contact.title")}
                  </h2>
                  <p>
                    {t("terms.contact.p1")}{" "}
                    <a
                      href="/contact"
                      className="text-primary-orange underline hover:text-primary-orange/80"
                    >
                      {t("terms.contact.link")}
                    </a>{" "}
                    {t("terms.contact.p2")}
                  </p>
                  <p className="mt-2">
                    📧{" "}
                    <a
                      href="mailto:support@littlegali.com"
                      className="text-primary-orange underline hover:text-primary-orange/80"
                    >
                      support@littlegali.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function TermsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "#F3EEE8" }}
      >
        <Header />
        <div className="min-h-screen"></div>
        <Footer />
      </div>
    );
  }

  return <TermsPageContent />;
}
