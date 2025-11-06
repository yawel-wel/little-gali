"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

const easeOwlet = [0.16, 1, 0.3, 1];

export default function InspirationPage() {
  const prefersReducedMotion = useReducedMotion();
  const [cardStates, setCardStates] = useState({
    card1: false,
    card2: false,
    card3: false,
  });

  const toggleCard = (card: "card1" | "card2" | "card3") => {
    setCardStates((prev) => ({
      ...prev,
      [card]: !prev[card],
    }));
  };

  const getImageSrc = (
    baseNumber: number,
    isColorful: boolean,
    cardPrefix: string
  ) => {
    if (isColorful) {
      return `/${cardPrefix}-color-${baseNumber}.png`;
    }
    return `/${cardPrefix}-${baseNumber}.png`;
  };
  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F9F7EE" }}
    >
      <Header />

      <main className="flex-1 pt-20">
        {/* Section Title */}
        <motion.section
          className="relative py-16 lg:py-24"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Title highlightText="השראה" size="xl" className="mb-4">
                השראה לספרונים
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                צפו בדוגמאות לסוגי ספרונים כדי לעזור לכם לבחור תמונות וליצור
                ספרון משלכם
              </p>
            </div>

            {/* Cards Section */}
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Card 1: ספרון משפחה גרעינית */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                animate={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                transition={{ duration: 1.1, ease: easeOwlet }}
              >
                {/* Badge */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: cardStates.card1 ? "#F7EEE9" : "#F0F2F2",
                    }}
                  >
                    <p className="text-sm font-body-bold text-black">
                      {cardStates.card1 ? "צבעוני" : "שחור לבן"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row pt-16 md:pt-10">
                  {/* Left Section - Text */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center text-right">
                    <h3 className="text-2xl font-heading font-bold text-dark-gray mb-4">
                      ספרון משפחה גרעינית
                    </h3>
                    <p className="text-base font-body text-medium-gray leading-relaxed">
                      הפנים הקרובות ביותר לתינוק – אמא, אבא, ואולי גם אח, אחות
                      או הכלב המשפחתי. הספרון שמעניק לו תחושת רוגע וחיבור למשפחה
                    </p>
                    {/* Switch Button */}
                    <button
                      type="button"
                      onClick={() => toggleCard("card1")}
                      className="flex items-center justify-start gap-3 mt-4 text-primary-orange hover:text-primary-orange/80 transition-all duration-200 cursor-pointer"
                    >
                      <span className="font-body-bold text-sm">
                        {cardStates.card1
                          ? "החלף לצד שחור לבן"
                          : "החלף לצד צבעוני"}
                      </span>
                      <RotateCw
                        className={`w-4 h-4 transition-transform duration-500 ${
                          cardStates.card1 ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Right Section - Illustrations Grid */}
                  <div className="w-full md:w-2/3 p-6 md:p-8">
                    <motion.div
                      className="grid grid-cols-2 gap-4"
                      initial={prefersReducedMotion ? false : "hidden"}
                      animate={prefersReducedMotion ? undefined : "show"}
                      variants={{
                        hidden: {},
                        show: {
                          transition: { staggerChildren: 0.1 },
                        },
                      }}
                    >
                      {/* Top Left */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={getImageSrc(1, cardStates.card1, "close-family")}
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Top Right */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={getImageSrc(2, cardStates.card1, "close-family")}
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Bottom Left */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={getImageSrc(3, cardStates.card1, "close-family")}
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Bottom Right */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={getImageSrc(4, cardStates.card1, "close-family")}
                          alt="Family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: הכירו את שאר המשפחה */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                transition={{ duration: 1.1, ease: easeOwlet }}
                viewport={{ once: true, amount: 0.25 }}
              >
                {/* Badge */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: cardStates.card2 ? "#F7EEE9" : "#F0F2F2",
                    }}
                  >
                    <p className="text-sm font-body-bold text-black">
                      {cardStates.card2 ? "צבעוני" : "שחור לבן"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row pt-16 md:pt-10">
                  {/* Left Section - Text */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center text-right">
                    <h3 className="text-2xl font-heading font-bold text-dark-gray mb-4">
                      הכירו את שאר המשפחה
                    </h3>
                    <p className="text-base font-body text-medium-gray leading-relaxed">
                      סבים, סבתות, דודים, בני דודים – כל מי שאוהב ומכיר את
                      התינוק. דרך מתוקה לעודד היכרות וחיבור גם מרחוק
                    </p>
                    {/* Switch Button */}
                    <button
                      type="button"
                      onClick={() => toggleCard("card2")}
                      className="flex items-center justify-start gap-3 mt-4 text-primary-orange hover:text-primary-orange/80 transition-all duration-200 cursor-pointer"
                    >
                      <span className="font-body-bold text-sm">
                        {cardStates.card2
                          ? "החלף לצד שחור לבן"
                          : "החלף לצד צבעוני"}
                      </span>
                      <RotateCw
                        className={`w-4 h-4 transition-transform duration-500 ${
                          cardStates.card2 ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Right Section - Illustrations Grid */}
                  <div className="w-full md:w-2/3 p-6 md:p-8">
                    <motion.div
                      className="grid grid-cols-2 gap-4"
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
                      {/* Top Left */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card2
                              ? "/extended-family-color-1.png"
                              : "/extended-family-1.png"
                          }
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Top Right */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card2
                              ? "/extended-family-color-2.png"
                              : "/extended-family-2.png"
                          }
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Bottom Left */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card2
                              ? "/extended-family-color-3.png"
                              : "/extended-family-3.png"
                          }
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Bottom Right */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card2
                              ? "/extended-family-color-4.jpg"
                              : "/extended-family-4.jpg"
                          }
                          alt="Extended family illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: ספר תינוקי */}
              <motion.div
                className="bg-white rounded-2xl shadow-lg overflow-hidden relative"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
                whileInView={
                  prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                }
                transition={{ duration: 1.1, ease: easeOwlet }}
                viewport={{ once: true, amount: 0.25 }}
              >
                {/* Badge */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                  <div
                    className="px-4 py-2 rounded-lg"
                    style={{
                      backgroundColor: cardStates.card3 ? "#F7EEE9" : "#F0F2F2",
                    }}
                  >
                    <p className="text-sm font-body-bold text-black">
                      {cardStates.card3 ? "צבעוני" : "שחור לבן"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row pt-16 md:pt-10">
                  {/* Left Section - Text */}
                  <div className="w-full md:w-1/3 p-6 md:p-8 flex flex-col justify-center text-right">
                    <h3 className="text-2xl font-heading font-bold text-dark-gray mb-4">
                      ספר תינוקי
                    </h3>
                    <p className="text-base font-body text-medium-gray leading-relaxed">
                      רגעים שונים של התינוק עצמו – חיוך, פליאה, מבט סקרן. ספרון
                      אישי ופשוט שמרתק כל תינוק
                    </p>
                    {/* Switch Button */}
                    <button
                      type="button"
                      onClick={() => toggleCard("card3")}
                      className="flex items-center justify-start gap-3 mt-4 text-primary-orange hover:text-primary-orange/80 transition-all duration-200 cursor-pointer"
                    >
                      <span className="font-body-bold text-sm">
                        {cardStates.card3
                          ? "החלף לצד שחור לבן"
                          : "החלף לצד צבעוני"}
                      </span>
                      <RotateCw
                        className={`w-4 h-4 transition-transform duration-500 ${
                          cardStates.card3 ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Right Section - Illustrations Grid */}
                  <div className="w-full md:w-2/3 p-6 md:p-8">
                    <motion.div
                      className="grid grid-cols-2 gap-4"
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
                      {/* Top Left */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card3
                              ? "/baby-color-1.png"
                              : "/baby-1.png"
                          }
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Top Right */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card3
                              ? "/baby-color-2.png"
                              : "/baby-2.png"
                          }
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Bottom Left */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card3
                              ? "/baby-color-3.png"
                              : "/baby-3.png"
                          }
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                      {/* Bottom Right */}
                      <motion.div
                        className="aspect-square rounded-lg flex items-center justify-center p-4"
                        variants={{
                          hidden: { opacity: 0, scale: 0.9 },
                          show: {
                            opacity: 1,
                            scale: 1,
                            transition: { duration: 0.7, ease: easeOwlet },
                          },
                        }}
                      >
                        <img
                          src={
                            cardStates.card3
                              ? "/baby-color-4.png"
                              : "/baby-4.png"
                          }
                          alt="Baby moments illustration"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <div className="text-center mt-12">
              <motion.div
                whileHover={{
                  scale: 1.01,
                  y: -1,
                  transition: { duration: 0.2, ease: easeOwlet },
                }}
              >
                <a href="/upload">
                  <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-4 rounded-full font-body-bold text-base transition-all duration-200">
                    התחילו ליצור את הספרון שלכם
                  </Button>
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
