"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect, type ReactNode } from "react";

function PrivacySection({
  title,
  intro,
  items,
  paragraphs = [],
  children,
}: {
  title: string;
  intro?: string;
  items?: string[];
  paragraphs?: string[];
  children?: ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-heading font-bold text-dark-gray">
        {title}
      </h2>
      {intro && <p className="mb-4">{intro}</p>}
      {items && (
        <ul
          className={`list-disc list-outside space-y-2 ps-5 ${paragraphs.length > 0 ? "mb-4" : ""}`}
        >
          {items.map((item, index) => (
            <li key={index} className="ps-1">
              {item}
            </li>
          ))}
        </ul>
      )}
      {paragraphs.map((text, index) => (
        <p
          key={index}
          className={index < paragraphs.length - 1 ? "mb-4" : undefined}
        >
          {text}
        </p>
      ))}
      {children}
    </section>
  );
}

function PrivacyPageContent() {
  const { t, locale } = useLanguage();
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
                className="space-y-8 font-body leading-relaxed text-medium-gray text-start"
              >
                <section>
                  <p className="mb-4">{t("privacy.intro.p1")}</p>
                  <p>{t("privacy.intro.p2")}</p>
                </section>

                <PrivacySection
                  title={t("privacy.collection.title")}
                  intro={t("privacy.collection.intro")}
                  items={[
                    t("privacy.collection.li1"),
                    t("privacy.collection.li2"),
                    t("privacy.collection.li3"),
                    t("privacy.collection.li4"),
                    t("privacy.collection.li5"),
                    t("privacy.collection.li6"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.photos.title")}
                  paragraphs={[
                    t("privacy.photos.p1"),
                    t("privacy.photos.p2"),
                    t("privacy.photos.p3"),
                    t("privacy.photos.p4"),
                    t("privacy.photos.p5"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.ai.title")}
                  paragraphs={[
                    t("privacy.ai.p1"),
                    t("privacy.ai.p2"),
                    t("privacy.ai.p3"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.usage.title")}
                  intro={t("privacy.usage.intro")}
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
                  ]}
                />

                <PrivacySection
                  title={t("privacy.sharing.title")}
                  intro={t("privacy.sharing.intro")}
                  items={[
                    t("privacy.sharing.li1"),
                    t("privacy.sharing.li2"),
                    t("privacy.sharing.li3"),
                    t("privacy.sharing.li4"),
                    t("privacy.sharing.li5"),
                    t("privacy.sharing.li6"),
                    t("privacy.sharing.li7"),
                  ]}
                  paragraphs={[
                    t("privacy.sharing.p1"),
                    t("privacy.sharing.p2"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.retention.title")}
                  paragraphs={[
                    t("privacy.retention.p1"),
                    t("privacy.retention.p2"),
                    t("privacy.retention.p3"),
                    t("privacy.retention.p4"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.security.title")}
                  paragraphs={[
                    t("privacy.security.p1"),
                    t("privacy.security.p2"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.cookies.title")}
                  paragraphs={[
                    t("privacy.cookies.p1"),
                    t("privacy.cookies.p2"),
                    t("privacy.cookies.p3"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.marketing.title")}
                  paragraphs={[
                    t("privacy.marketing.p1"),
                    t("privacy.marketing.p2"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.photoSubjects.title")}
                  paragraphs={[
                    t("privacy.photoSubjects.p1"),
                    t("privacy.photoSubjects.p2"),
                  ]}
                />

                <PrivacySection
                  title={t("privacy.rights.title")}
                  paragraphs={[t("privacy.rights.p1"), t("privacy.rights.p2")]}
                >
                  <p className="mt-2">
                    <a
                      href="mailto:support@littlegali.com"
                      className="cursor-pointer text-primary-orange hover:underline"
                      dir="ltr"
                    >
                      support@littlegali.com
                    </a>
                  </p>
                </PrivacySection>

                <PrivacySection
                  title={t("privacy.changes.title")}
                  paragraphs={[
                    t("privacy.changes.p1"),
                    t("privacy.changes.p2"),
                  ]}
                />

                <p>{t("privacy.lastUpdated")}</p>
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
