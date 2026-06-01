"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function ShippingPageContent() {
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
                  {t("shipping.title")}
                </h1>
              </div>

              {/* Content */}
              <div
                className={`space-y-8 font-body text-medium-gray leading-relaxed ${
                  locale === "en" ? "text-left" : "text-right"
                }`}
              >
                {/* זמן אספקה */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("shipping.deliveryTime.title")}
                  </h2>
                  <p className="mb-4">{t("shipping.deliveryTime.p1")}</p>
                  <p className="mb-4">{t("shipping.deliveryTime.p2")}</p>
                  <p>{t("shipping.deliveryTime.p3")}</p>
                </div>

                {/* עלויות משלוח */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("shipping.costs.title")}
                  </h2>
                  <p className="mb-4">{t("shipping.costs.p1")}</p>
                  <p>{t("shipping.costs.p2")}</p>
                </div>

                {/* מעקב משלוח */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("shipping.tracking.title")}
                  </h2>
                  <p>{t("shipping.tracking.p1")}</p>
                </div>

                {/* אזורי משלוח */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("shipping.deliveryAreas.title")}
                  </h2>
                  <p>{t("shipping.deliveryAreas.p1")}</p>
                </div>

                {/* מוצר שניזוק במשלוח */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("shipping.damaged.title")}
                  </h2>
                  <p className="mb-4">
                    {t("shipping.damaged.p1")}{" "}
                    <a
                      href="/contact"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      {t("shipping.damaged.link")}
                    </a>{" "}
                    {t("shipping.damaged.p2")}{" "}
                    <a
                      href="mailto:yaelromashkano@gmail.com"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      yaelromashkano@gmail.com
                    </a>
                    .
                  </p>
                  <p>{t("shipping.damaged.p3")}</p>
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

export default function ShippingPage() {
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

  return <ShippingPageContent />;
}
