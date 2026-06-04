"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function ShippingSection({
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
    <section>
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
    </section>
  );
}

function ShippingList({
  items,
  locale,
  className,
}: {
  items: string[];
  locale: string;
  className?: string;
}) {
  const listMargin = locale === "en" ? "ml-4" : "mr-4";

  return (
    <ul
      className={`list-disc list-inside space-y-2 ${listMargin} ${className ?? ""}`}
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function ShippingPageContent() {
  const { t, locale } = useLanguage();
  const textAlign = locale === "en" ? "text-left" : "text-right";

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
                <h1 className="mb-4 text-center font-heading text-3xl leading-tight text-dark-gray lg:text-4xl">
                  {t("shipping.title")}
                </h1>
              </div>

              <div
                className={`space-y-8 font-body leading-relaxed text-medium-gray ${textAlign}`}
              >
                <ShippingSection
                  locale={locale}
                  title={t("shipping.deliveryTime.title")}
                  paragraphs={[
                    t("shipping.deliveryTime.p1"),
                    t("shipping.deliveryTime.p2"),
                    t("shipping.deliveryTime.p3"),
                    t("shipping.deliveryTime.p4"),
                    t("shipping.deliveryTime.p5"),
                  ]}
                />

                <ShippingSection
                  locale={locale}
                  title={t("shipping.costs.title")}
                  paragraphs={[
                    t("shipping.costs.p1"),
                    t("shipping.costs.p2"),
                    t("shipping.costs.p3"),
                  ]}
                />

                <ShippingSection
                  locale={locale}
                  title={t("shipping.details.title")}
                  paragraphs={[
                    t("shipping.details.p1"),
                    t("shipping.details.p2"),
                  ]}
                />

                <ShippingSection
                  locale={locale}
                  title={t("shipping.tracking.title")}
                  paragraphs={[
                    t("shipping.tracking.p1"),
                    t("shipping.tracking.p2"),
                  ]}
                />

                <ShippingSection
                  locale={locale}
                  title={t("shipping.deliveryAreas.title")}
                  paragraphs={[
                    t("shipping.deliveryAreas.p1"),
                    t("shipping.deliveryAreas.p2"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("shipping.damaged.title")}
                  </h2>
                  <p className="mb-4">{t("shipping.damaged.p1")}</p>
                  <p className="mb-4">{t("shipping.damaged.intro")}</p>
                  <ShippingList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("shipping.damaged.li1"),
                      t("shipping.damaged.li2"),
                      t("shipping.damaged.li3"),
                      t("shipping.damaged.li4"),
                    ]}
                  />
                  <p>{t("shipping.damaged.p2")}</p>
                </section>

                <ShippingSection
                  locale={locale}
                  title={t("shipping.undelivered.title")}
                  paragraphs={[t("shipping.undelivered.p1")]}
                />

                <section>
                  <h2
                    className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("shipping.contact.title")}
                  </h2>
                  <p className="mb-4">{t("shipping.contact.p1")}</p>
                  <p className="mb-4">
                    📧{" "}
                    <a
                      href="mailto:support@littlegali.com"
                      className="text-primary-orange underline hover:text-primary-orange/80"
                    >
                      support@littlegali.com
                    </a>
                  </p>
                  <p>{t("shipping.contact.lastUpdated")}</p>
                </section>
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
        <div className="min-h-screen" />
        <Footer />
      </div>
    );
  }

  return <ShippingPageContent />;
}
