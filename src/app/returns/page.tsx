"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function ReturnsSection({
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

function ReturnsList({
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

function ReturnsPageContent() {
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
                  highlightText={isHebrew ? "החזרים" : "Returns"}
                  size="lg"
                >
                  {t("returns.title")}
                </Title>
              </div>

              <div
                className={`space-y-8 font-body leading-relaxed text-medium-gray ${textAlign}`}
              >
                <p>{t("returns.intro")}</p>

                <ReturnsSection
                  locale={locale}
                  title={t("returns.customized.title")}
                  paragraphs={[
                    t("returns.customized.p1"),
                    t("returns.customized.p2"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("returns.damage.title")}
                  </h2>
                  <p className="mb-4">{t("returns.damage.p1")}</p>
                  <p className="mb-4">{t("returns.damage.p2")}</p>
                  <p className="mb-4">{t("returns.damage.intro")}</p>
                  <ReturnsList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("returns.damage.li1"),
                      t("returns.damage.li2"),
                      t("returns.damage.li3"),
                      t("returns.damage.li4"),
                    ]}
                  />
                  <p>{t("returns.damage.p3")}</p>
                </section>

                <ReturnsSection
                  locale={locale}
                  title={t("returns.unsatisfied.title")}
                  paragraphs={[
                    t("returns.unsatisfied.p1"),
                    t("returns.unsatisfied.p2"),
                    t("returns.unsatisfied.p3"),
                    t("returns.unsatisfied.p4"),
                  ]}
                />

                <ReturnsSection
                  locale={locale}
                  title={t("returns.variations.title")}
                  paragraphs={[
                    t("returns.variations.p1"),
                    t("returns.variations.p2"),
                  ]}
                />

                <ReturnsSection
                  locale={locale}
                  title={t("returns.orderErrors.title")}
                  paragraphs={[
                    t("returns.orderErrors.p1"),
                    t("returns.orderErrors.p2"),
                  ]}
                />

                <ReturnsSection
                  locale={locale}
                  title={t("returns.imageRights.title")}
                  paragraphs={[
                    t("returns.imageRights.p1"),
                    t("returns.imageRights.p2"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-2xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("returns.contact.title")}
                  </h2>
                  <p className="mb-4">{t("returns.contact.p1")}</p>
                  <p className="mb-4">
                    📧{" "}
                    <a
                      href="mailto:support@littlegali.com"
                      className="text-primary-orange underline hover:text-primary-orange/80"
                    >
                      support@littlegali.com
                    </a>
                  </p>
                  <p>{t("returns.contact.lastUpdated")}</p>
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

export default function ReturnsPage() {
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

  return <ReturnsPageContent />;
}
