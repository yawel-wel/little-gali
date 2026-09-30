"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function sectionHeadingClass(locale: string, level: "h2" | "h3") {
  const align = locale === "en" ? "text-left" : "text-right";
  const size = level === "h2" ? "text-xl" : "text-lg";
  const spacing = level === "h2" ? "mb-4" : "mb-3";
  return `${spacing} ${size} font-heading font-bold text-dark-gray ${align}`;
}

function PrivacySection({
  title,
  paragraphs,
  locale,
}: {
  title: string;
  paragraphs: string[];
  locale: string;
}) {
  return (
    <section>
      <h2 className={sectionHeadingClass(locale, "h2")}>{title}</h2>
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

function PrivacyEmail({ locale }: { locale: string }) {
  const align = locale === "en" ? "text-left" : "text-right";

  return (
    <p className={align}>
      <a
        href="mailto:support@littlegali.com"
        className="text-primary-orange hover:underline"
        dir="ltr"
      >
        support@littlegali.com
      </a>
    </p>
  );
}

function PrivacyList({
  items,
  className,
}: {
  items: string[];
  locale?: string;
  className?: string;
}) {
  return (
    <ul className={`list-disc list-outside space-y-2 ps-5 ${className ?? ""}`}>
      {items.map((item, index) => (
        <li key={index} className="ps-1">
          {item}
        </li>
      ))}
    </ul>
  );
}

function PrivacyPageContent() {
  const { t, locale } = useLanguage();
  const textAlign = locale === "en" ? "text-left" : "text-right";
  const direction = locale === "en" ? "ltr" : "rtl";
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
                dir={direction}
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
                  <h2 className={sectionHeadingClass(locale, "h2")}>
                    {t("privacy.collection.title")}
                  </h2>
                  <h3 className={sectionHeadingClass(locale, "h3")}>
                    {t("privacy.collection.youProvide.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.collection.youProvide.p1")}
                  </p>
                  <PrivacyList
                    locale={locale}
                    className="mb-6"
                    items={[
                      t("privacy.collection.youProvide.li1"),
                      t("privacy.collection.youProvide.li2"),
                      t("privacy.collection.youProvide.li3"),
                      t("privacy.collection.youProvide.li4"),
                      t("privacy.collection.youProvide.li5"),
                      t("privacy.collection.youProvide.li6"),
                      t("privacy.collection.youProvide.li7"),
                    ]}
                  />
                  <h3 className={sectionHeadingClass(locale, "h3")}>
                    {t("privacy.collection.photos.title")}
                  </h3>
                  <p className="mb-4">{t("privacy.collection.photos.p1")}</p>
                  <p className="mb-4">{t("privacy.collection.photos.p2")}</p>
                  <p className="mb-6">{t("privacy.collection.photos.p3")}</p>
                  <h3 className={sectionHeadingClass(locale, "h3")}>
                    {t("privacy.collection.technical.title")}
                  </h3>
                  <p className="mb-4">
                    {t("privacy.collection.technical.p1")}
                  </p>
                  <PrivacyList
                    locale={locale}
                    className="mb-4"
                    items={[
                      t("privacy.collection.technical.li1"),
                      t("privacy.collection.technical.li2"),
                      t("privacy.collection.technical.li3"),
                      t("privacy.collection.technical.li4"),
                      t("privacy.collection.technical.li5"),
                      t("privacy.collection.technical.li6"),
                      t("privacy.collection.technical.li7"),
                      t("privacy.collection.technical.li8"),
                    ]}
                  />
                  <p>{t("privacy.collection.technical.p2")}</p>
                </section>

                <section>
                  <h2 className={sectionHeadingClass(locale, "h2")}>
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
                      t("privacy.usage.li9"),
                      t("privacy.usage.li10"),
                      t("privacy.usage.li11"),
                      t("privacy.usage.li12"),
                      t("privacy.usage.li13"),
                    ]}
                  />
                </section>

                <PrivacySection
                  locale={locale}
                  title={t("privacy.imageProcessing.title")}
                  paragraphs={[
                    t("privacy.imageProcessing.p1"),
                    t("privacy.imageProcessing.p2"),
                    t("privacy.imageProcessing.p3"),
                  ]}
                />

                <PrivacySection
                  locale={locale}
                  title={t("privacy.payments.title")}
                  paragraphs={[
                    t("privacy.payments.p1"),
                    t("privacy.payments.p2"),
                    t("privacy.payments.p3"),
                    t("privacy.payments.p4"),
                  ]}
                />

                <section>
                  <h2 className={sectionHeadingClass(locale, "h2")}>
                    {t("privacy.analytics.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.analytics.intro")}</p>
                  <h3 className={sectionHeadingClass(locale, "h3")}>
                    {t("privacy.analytics.ga.title")}
                  </h3>
                  <p className="mb-4">{t("privacy.analytics.ga.p")}</p>
                  <h3 className={sectionHeadingClass(locale, "h3")}>
                    {t("privacy.analytics.mixpanel.title")}
                  </h3>
                  <p className="mb-4">{t("privacy.analytics.mixpanel.p1")}</p>
                  <p className="mb-4">{t("privacy.analytics.mixpanel.p2")}</p>
                  <p className="mb-4">{t("privacy.analytics.mixpanel.p3")}</p>
                  <p className="mb-4">{t("privacy.analytics.mixpanel.p4")}</p>
                  <h3 className={sectionHeadingClass(locale, "h3")}>
                    {t("privacy.analytics.meta.title")}
                  </h3>
                  <p className="mb-4">{t("privacy.analytics.meta.p")}</p>
                  <p>{t("privacy.analytics.cookiesNote")}</p>
                </section>

                <section>
                  <h2 className={sectionHeadingClass(locale, "h2")}>
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
                      t("privacy.cookies.li6"),
                    ]}
                  />
                  <p className="mb-4">{t("privacy.cookies.note")}</p>
                  <p>{t("privacy.cookies.note2")}</p>
                </section>

                <section>
                  <h2 className={sectionHeadingClass(locale, "h2")}>
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
                      t("privacy.sharing.li7"),
                      t("privacy.sharing.li8"),
                      t("privacy.sharing.li9"),
                      t("privacy.sharing.li10"),
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
                    t("privacy.retention.p3"),
                    t("privacy.retention.p4"),
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
                  <h2 className={sectionHeadingClass(locale, "h2")}>
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
                  <p className="mb-4">{t("privacy.rights.note")}</p>
                  <p className="mb-2">{t("privacy.rights.contact")}</p>
                  <PrivacyEmail locale={locale} />
                </section>

                <PrivacySection
                  locale={locale}
                  title={t("privacy.photoSubjects.title")}
                  paragraphs={[
                    t("privacy.photoSubjects.p1"),
                    t("privacy.photoSubjects.p2"),
                  ]}
                />

                <PrivacySection
                  locale={locale}
                  title={t("privacy.changes.title")}
                  paragraphs={[
                    t("privacy.changes.p1"),
                    t("privacy.changes.p2"),
                  ]}
                />

                <section>
                  <h2 className={sectionHeadingClass(locale, "h2")}>
                    {t("privacy.contact.title")}
                  </h2>
                  <p className="mb-2">{t("privacy.contact.p1")}</p>
                  <div className="mb-4">
                    <PrivacyEmail locale={locale} />
                  </div>
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
