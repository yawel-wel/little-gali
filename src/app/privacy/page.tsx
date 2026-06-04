"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function PrivacySection({
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
        className={`mb-3 text-xl font-heading font-bold text-dark-gray ${align}`}
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

function PrivacyList({
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

function PrivacyPageContent() {
  const { t, locale } = useLanguage();
  const textAlign = locale === "en" ? "text-left" : "text-right";
  const isHebrew = locale === "he";

  return (
    <div className="overflow-x-hidden bg-warm-light">
      <Header />
      <main
        id="main-content"
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <section className="relative pb-16 lg:pb-24 pt-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8 text-center">
                <Title
                  as="h1"
                  highlightText={isHebrew ? "פרטיות" : "Privacy"}
                  size="lg"
                >
                  {t("privacy.title")}
                </Title>
              </div>

              <div
                className={`space-y-8 font-body leading-relaxed text-medium-gray ${textAlign}`}
              >
                <PrivacySection
                  locale={locale}
                  title={t("privacy.intro.title")}
                  paragraphs={[
                    t("privacy.intro.p1"),
                    t("privacy.intro.p2"),
                    t("privacy.intro.p3"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.collection.title")}
                  </h2>
                  <h3
                    className={`mb-3 text-lg font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.collection.youProvide.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.collection.youProvide.p1")}
                  </p>
                  <PrivacyList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("privacy.collection.youProvide.li1"),
                      t("privacy.collection.youProvide.li2"),
                      t("privacy.collection.youProvide.li3"),
                      t("privacy.collection.youProvide.li4"),
                      t("privacy.collection.youProvide.li5"),
                      t("privacy.collection.youProvide.li6"),
                    ]}
                  />
                  <p className="mb-4">
                    {t("privacy.collection.youProvide.p2")}
                  </p>
                  <p className="mb-6">
                    {t("privacy.collection.youProvide.p3")}
                  </p>
                  <h3
                    className={`mb-3 text-lg font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.collection.technical.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.collection.technical.p1")}
                  </p>
                  <PrivacyList
                    locale={locale}
                    items={[
                      t("privacy.collection.technical.li1"),
                      t("privacy.collection.technical.li2"),
                      t("privacy.collection.technical.li3"),
                      t("privacy.collection.technical.li4"),
                      t("privacy.collection.technical.li5"),
                    ]}
                  />
                </section>

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.usage.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.usage.intro")}</p>
                  <PrivacyList
                    locale={locale}
                    items={[
                      t("privacy.usage.li1"),
                      t("privacy.usage.li2"),
                      t("privacy.usage.li3"),
                      t("privacy.usage.li4"),
                      t("privacy.usage.li5"),
                      t("privacy.usage.li6"),
                      t("privacy.usage.li7"),
                      t("privacy.usage.li8"),
                    ]}
                  />
                </section>

                <PrivacySection
                  locale={locale}
                  title={t("privacy.imageProcessing.title")}
                  paragraphs={[
                    t("privacy.imageProcessing.p1"),
                    t("privacy.imageProcessing.p2"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.analytics.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.analytics.intro")}</p>
                  <h3
                    className={`mb-2 text-lg font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.analytics.ga.title")}
                  </h3>
                  <p className="mb-4">{t("privacy.analytics.ga.p")}</p>
                  <h3
                    className={`mb-2 text-lg font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.analytics.meta.title")}
                  </h3>
                  <p className="mb-4">{t("privacy.analytics.meta.p")}</p>
                  <p>{t("privacy.analytics.cookiesNote")}</p>
                </section>

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.cookies.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.cookies.intro")}</p>
                  <PrivacyList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("privacy.cookies.li1"),
                      t("privacy.cookies.li2"),
                      t("privacy.cookies.li3"),
                      t("privacy.cookies.li4"),
                      t("privacy.cookies.li5"),
                    ]}
                  />
                  <p>{t("privacy.cookies.note")}</p>
                </section>

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.sharing.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.sharing.p1")}</p>
                  <p className="mb-4">{t("privacy.sharing.intro")}</p>
                  <PrivacyList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("privacy.sharing.li1"),
                      t("privacy.sharing.li2"),
                      t("privacy.sharing.li3"),
                      t("privacy.sharing.li4"),
                      t("privacy.sharing.li5"),
                      t("privacy.sharing.li6"),
                    ]}
                  />
                  <p>{t("privacy.sharing.p2")}</p>
                </section>

                <PrivacySection
                  locale={locale}
                  title={t("privacy.retention.title")}
                  paragraphs={[
                    t("privacy.retention.p1"),
                    t("privacy.retention.p2"),
                  ]}
                />

                <PrivacySection
                  locale={locale}
                  title={t("privacy.security.title")}
                  paragraphs={[
                    t("privacy.security.p1"),
                    t("privacy.security.p2"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.rights.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.rights.intro")}</p>
                  <PrivacyList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("privacy.rights.li1"),
                      t("privacy.rights.li2"),
                      t("privacy.rights.li3"),
                      t("privacy.rights.li4"),
                      t("privacy.rights.li5"),
                    ]}
                  />
                  <p>
                    {t("privacy.rights.contact")}{" "}
                    <a
                      href="mailto:support@littlegali.com"
                      className="text-primary-orange hover:underline"
                    >
                      support@littlegali.com
                    </a>
                  </p>
                </section>

                <PrivacySection
                  locale={locale}
                  title={t("privacy.changes.title")}
                  paragraphs={[
                    t("privacy.changes.p1"),
                    t("privacy.changes.p2"),
                  ]}
                />

                <section>
                  <h2
                    className={`mb-4 text-xl font-heading font-bold text-dark-gray ${textAlign}`}
                  >
                    {t("privacy.contact.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.contact.p1")}</p>
                  <p className="mb-4">
                    📧{" "}
                    <a
                      href="mailto:support@littlegali.com"
                      className="text-primary-orange hover:underline"
                    >
                      support@littlegali.com
                    </a>
                  </p>
                  <p>{t("privacy.contact.lastUpdated")}</p>
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

export default function PrivacyPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="overflow-x-hidden bg-warm-light">
        <Header />
        <div className="min-h-screen" />
        <Footer />
      </div>
    );
  }

  return <PrivacyPageContent />;
}
