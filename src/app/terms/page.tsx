"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function TermsPageContent() {
  const { t, locale } = useLanguage();
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
              {/* Page Title */}
              <div className="text-center mb-12">
                <h1 className="text-3xl lg:text-4xl font-heading text-dark-gray leading-tight mb-4 text-center">
                  {t("terms.title")}
                </h1>
              </div>

              {/* Intro */}
              <div
                className={`font-body text-medium-gray leading-relaxed mb-8 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}
              >
                <p className="mb-4">{t("terms.intro")}</p>
              </div>

              {/* Content */}
              <div
                className={`space-y-8 font-body text-medium-gray leading-relaxed ${
                  locale === "en" ? "text-left" : "text-right"
                }`}
              >
                {/* שימוש באתר */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.useOfSite.title")}
                  </h2>
                  <p className="mb-4">{t("terms.useOfSite.p1")}</p>
                  <p>{t("terms.useOfSite.p2")}</p>
                </div>

                {/* אחריות המשתמש */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.userResponsibility.title")}
                  </h2>
                  <p className="mb-4">{t("terms.userResponsibility.p1")}</p>
                  <p>{t("terms.userResponsibility.p2")}</p>
                </div>

                {/* הזמנות ותשלום */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.ordersAndPayment.title")}
                  </h2>
                  <p className="mb-4">{t("terms.ordersAndPayment.p1")}</p>
                  <p>{t("terms.ordersAndPayment.p2")}</p>
                </div>

                {/* הפקת המוצר */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.productProduction.title")}
                  </h2>
                  <p className="mb-4">{t("terms.productProduction.p1")}</p>
                  <p>{t("terms.productProduction.p2")}</p>
                </div>

                {/* אחריות ושירות */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.warrantyAndService.title")}
                  </h2>
                  <p className="mb-4">{t("terms.warrantyAndService.p1")}</p>
                  <p>{t("terms.warrantyAndService.p2")}</p>
                </div>

                {/* שימוש בטוח במוצרים לתינוקות */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.safeUse.title")}
                  </h2>
                  <p className="mb-4">{t("terms.safeUse.p1")}</p>
                  <p className="mb-4">{t("terms.safeUse.p2")}</p>
                  <p>{t("terms.safeUse.p3")}</p>
                </div>

                {/* קניין רוחני */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.intellectualProperty.title")}
                  </h2>
                  <p>{t("terms.intellectualProperty.p1")}</p>
                </div>

                {/* הגבלת אחריות */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.liabilityLimitation.title")}
                  </h2>
                  <p>{t("terms.liabilityLimitation.p1")}</p>
                </div>

                {/* שינוי תנאים */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.termsChanges.title")}
                  </h2>
                  <p>{t("terms.termsChanges.p1")}</p>
                </div>

                {/* יצירת קשר */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("terms.contact.title")}
                  </h2>
                  <p>
                    {t("terms.contact.p1")}{" "}
                    <a
                      href="/contact"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      {t("terms.contact.link")}
                    </a>{" "}
                    {t("terms.contact.p2")}
                  </p>
                  <p className="mt-2">
                    📧{" "}
                    <a
                      href="mailto:support@littlegali.com"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
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
