"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useLanguage } from "@/lib/LanguageContext";
import { useState, useEffect } from "react";

function ReturnsPageContent() {
  const { t, locale } = useLanguage();
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F9F7EE" }}
    >
      <Header />

      <main className="flex-1">
        <section
          className="relative py-16 lg:py-24 pt-20 md:pt-16"
          style={{ backgroundColor: "#F9F7EE" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-16">
            <div className="max-w-4xl mx-auto">
              {/* Page Title */}
              <div className="text-center mb-12">
                <h1 className={`text-3xl lg:text-4xl font-heading text-dark-gray leading-tight mb-4 ${
                  locale === "en" ? "text-left" : "text-right"
                }`}>
                  {t("returns.title")}
                </h1>
              </div>

              {/* Content */}
              <div className={`space-y-8 font-body text-medium-gray leading-relaxed ${
                locale === "en" ? "text-left" : "text-right"
              }`}>
                <div>
                  <p className="mb-4">
                    {t("returns.intro")}
                  </p>
                </div>

                {/* ספרון אישי ומותאם אישית */}
                <div>
                  <h2 className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                    locale === "en" ? "text-left" : "text-right"
                  }`}>
                    {t("returns.customized.title")}
                  </h2>
                  <p>
                    {t("returns.customized.p1")}
                  </p>
                </div>

                {/* פגמים או נזק במשלוח */}
                <div>
                  <h2 className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                    locale === "en" ? "text-left" : "text-right"
                  }`}>
                    {t("returns.damage.title")}
                  </h2>
                  <p className="mb-4">
                    {t("returns.damage.p1")}{" "}
                    <a
                      href="/contact"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      {t("returns.damage.link")}
                    </a>{" "}
                    {t("returns.damage.p2")}{" "}
                    <a
                      href="mailto:yaelromashkano@gmail.com"
                      className="text-primary-orange hover:text-primary-orange/80 underline"
                    >
                      yaelromashkano@gmail.com
                    </a>
                    {t("returns.damage.p3")}
                  </p>
                  <p>
                    {t("returns.damage.p4")}
                  </p>
                </div>

                {/* לא מרוצים מהמוצר? */}
                <div>
                  <h2 className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                    locale === "en" ? "text-left" : "text-right"
                  }`}>
                    {t("returns.unsatisfied.title")}
                  </h2>
                  <p className="mb-4">
                    {t("returns.unsatisfied.p1")}
                  </p>
                  <p>
                    {t("returns.unsatisfied.p2")}
                  </p>
                </div>

                {/* שונות טבעית ודגשים טכניים */}
                <div>
                  <h2 className={`text-2xl font-heading text-dark-gray mb-4 font-bold ${
                    locale === "en" ? "text-left" : "text-right"
                  }`}>
                    {t("returns.variations.title")}
                  </h2>
                  <p className="mb-4">
                    {t("returns.variations.p1")}
                  </p>
                  <p>
                    {t("returns.variations.p2")}
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

export default function ReturnsPage() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="min-h-screen overflow-x-hidden"
        style={{ backgroundColor: "#F9F7EE" }}
      >
        <Header />
        <div className="min-h-screen"></div>
        <Footer />
      </div>
    );
  }

  return <ReturnsPageContent />;
}
