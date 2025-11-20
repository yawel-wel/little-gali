"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useLanguage } from "@/lib/LanguageContext";

const easeOwlet = [0.16, 1, 0.3, 1];

export default function QAPage() {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#F3EEE8" }}>
      <Header />

      <main className="flex-1">
        {/* Q&A Section */}
        <motion.section
          className="relative py-16 lg:py-24 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-16">
            {/* Section Title */}
            <div className="text-center mb-16">
              <Title highlightText={t("home.qa.titleHighlight")} size="lg" className="mb-4">
                {t("home.qa.title")}
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                {t("home.qa.subtitle")}
              </p>
            </div>

            {/* Accordion */}
            <motion.div
              className="max-w-4xl mx-auto"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.1 },
                },
              }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-1"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question1")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer1")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-2"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question2")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer2")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-3"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question3")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer3")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-4"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question4")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer4")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-5"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question5")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer5")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-6"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question6")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer6")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-7"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question7")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer7")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-8"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question8")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer8")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 1.1, ease: easeOwlet },
                    },
                  }}
                >
                  <AccordionItem
                    value="item-9"
                    className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                  >
                    <AccordionTrigger
                      className={`font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.question9")}
                    </AccordionTrigger>
                    <AccordionContent
                      className={`font-body text-medium-gray leading-relaxed pt-4 ${
                        locale === "en" ? "text-left" : "text-right"
                      }`}
                    >
                      {t("qa.answer9")}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              </Accordion>
            </motion.div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                transition={{ duration: 1.1, ease: easeOwlet }}
                viewport={{ once: true, amount: 0.25 }}
              >
                <a href="/contact" className="block">
                  <p className="font-body text-medium-gray mb-6 cursor-pointer hover:text-dark-gray transition-colors">
                    {t("qa.notFound")}
                  </p>
                  <motion.div
                    whileHover={{
                      scale: 1.01,
                      y: -1,
                      transition: { duration: 0.2, ease: easeOwlet },
                    }}
                  >
                    <Button className="cursor-pointer bg-soft-peach hover:bg-soft-peach/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200">
                      {t("qa.contact")}
                    </Button>
                  </motion.div>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
