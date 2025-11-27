"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function PrivacyPageContent() {
  const { t, locale } = useLanguage();
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main className="flex-1">
        <section
          className="relative py-16 lg:py-24 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-16">
            <div className="max-w-4xl mx-auto">
              {/* Page Title */}
              <div className="text-center mb-12">
                <h1 className="text-3xl lg:text-4xl font-heading text-dark-gray leading-tight mb-4 text-center">
                  {t("privacy.title")}
                </h1>
              </div>

              {/* Content */}
              <div
                className={`space-y-8 font-body text-medium-gray leading-relaxed ${
                  locale === "en" ? "text-left" : "text-right"
                }`}
              >
                <div>
                  <p className="mb-4">{t("privacy.intro")}</p>
                </div>

                {/* מידע אישי */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("privacy.personalInfo.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.personalInfo.p1")}</p>
                  <ul
                    className={`list-disc space-y-2 mb-4 ${
                      locale === "en" ? "list-inside ml-4" : "list-inside mr-4"
                    }`}
                  >
                    <li>{t("privacy.personalInfo.li1")}</li>
                    <li>{t("privacy.personalInfo.li2")}</li>
                    <li>{t("privacy.personalInfo.li3")}</li>
                  </ul>
                  <p>{t("privacy.personalInfo.p2")}</p>
                </div>

                {/* שימוש בתמונות */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("privacy.imageUse.title")}
                  </h2>
                  <p className="mb-4">{t("privacy.imageUse.p1")}</p>
                  <p className="mb-4">{t("privacy.imageUse.p2")}</p>
                  <p className="mb-4">{t("privacy.imageUse.p3")}</p>
                  <p>{t("privacy.imageUse.p4")}</p>
                </div>

                {/* אבטחת מידע */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("privacy.dataSecurity.title")}
                  </h2>
                  <p>{t("privacy.dataSecurity.p1")}</p>
                </div>

                {/* זכויות המשתמש */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("privacy.userRights.title")}
                  </h2>
                  <p>{t("privacy.userRights.p1")}</p>
                </div>

                {/* יצירת קשר */}
                <div>
                  <h2
                    className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                      locale === "en" ? "text-left" : "text-right"
                    }`}
                  >
                    {t("privacy.contact.title")}
                  </h2>
                  <p>
                    {t("privacy.contact.p1")}{" "}
                    <a
                      href="/contact"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      {t("privacy.contact.link")}
                    </a>{" "}
                    {t("privacy.contact.p2")}
                  </p>
                  <p className="mt-2">
                    📧{" "}
                    <a
                      href="mailto:yaelromashkano@gmail.com"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      yaelromashkano@gmail.com
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

export default function PrivacyPage() {
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

  return <PrivacyPageContent />;
}
