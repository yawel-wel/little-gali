"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  // Handle hash scrolling on page load
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const yOffset = -80; // Offset for header
          const y =
            element.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    const clickHandlers: Array<{
      element: Element;
      handler: (e: Event) => void;
    }> = [];
    const touchHandlers: Array<{
      element: Element;
      handlers: { event: string; handler: (e: Event) => void }[];
    }> = [];

    let currentSlide = 0;
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;

    function goToSlide(
      index: number,
      container: HTMLElement,
      dots: NodeListOf<Element>
    ) {
      currentSlide = index;

      // Update active dot
      dots.forEach((d, i) => {
        if (i === index) {
          d.className =
            "w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200 cursor-pointer";
        } else {
          d.className =
            "w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200 cursor-pointer";
        }
      });

      // Move carousel
      if (index === 0) {
        container.style.transform = "translateX(0%)";
      } else if (index === 1) {
        container.style.transform = "translateX(60%)";
      }
    }

    function initCarousel() {
      const container = document.getElementById("carousel-container");
      const dots = document.querySelectorAll("[data-slide]");

      if (container && dots.length > 0) {
        // Set initial position to show first slide
        goToSlide(0, container, dots);

        // Dot click handlers
        dots.forEach((dot, index) => {
          const handler = (e: Event) => {
            e.preventDefault();
            goToSlide(index, container, dots);
          };

          dot.addEventListener("click", handler);
          clickHandlers.push({ element: dot, handler });
        });

        // Touch/swipe handlers for mobile
        const touchStartHandler = (e: TouchEvent) => {
          touchStartX = e.touches[0].clientX;
          touchEndX = touchStartX;
          isDragging = true;
          container.style.transition = "none";
        };

        const touchMoveHandler = (e: TouchEvent) => {
          if (!isDragging) return;

          touchEndX = e.touches[0].clientX;
          const diff = touchStartX - touchEndX;

          // Only prevent default if swiping horizontally
          if (Math.abs(diff) > 10) {
            e.preventDefault();
          }

          // Calculate current position
          const currentTranslate = currentSlide === 0 ? 0 : 60;
          const newTranslate =
            currentTranslate + (diff / container.offsetWidth) * 100;

          // Constrain movement
          const minTranslate = 0;
          const maxTranslate = 60;
          const constrainedTranslate = Math.max(
            minTranslate,
            Math.min(maxTranslate, newTranslate)
          );

          container.style.transform = `translateX(${constrainedTranslate}%)`;
        };

        const touchEndHandler = () => {
          if (!isDragging) return;
          isDragging = false;
          container.style.transition = "transform 0.3s ease-in-out";

          const swipeDistance = touchStartX - touchEndX;
          const swipeThreshold = 50; // Minimum distance for swipe

          if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0 && currentSlide > 0) {
              // Swipe left - go to previous slide
              goToSlide(currentSlide - 1, container, dots);
            } else if (swipeDistance < 0 && currentSlide < 1) {
              // Swipe right - go to next slide
              goToSlide(currentSlide + 1, container, dots);
            } else {
              // Return to current slide
              goToSlide(currentSlide, container, dots);
            }
          } else {
            // Return to current slide if swipe wasn't significant
            goToSlide(currentSlide, container, dots);
          }
        };

        container.addEventListener(
          "touchstart",
          touchStartHandler as EventListener
        );
        container.addEventListener(
          "touchmove",
          touchMoveHandler as EventListener
        );
        container.addEventListener(
          "touchend",
          touchEndHandler as EventListener
        );

        touchHandlers.push({
          element: container,
          handlers: [
            {
              event: "touchstart",
              handler: touchStartHandler as EventListener,
            },
            { event: "touchmove", handler: touchMoveHandler as EventListener },
            { event: "touchend", handler: touchEndHandler as EventListener },
          ],
        });
      } else {
        timeoutId = setTimeout(initCarousel, 100);
      }
    }

    // Initialize carousel after component mounts
    initCarousel();

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      clickHandlers.forEach(({ element, handler }) => {
        element.removeEventListener("click", handler);
      });
      touchHandlers.forEach(({ element, handlers }) => {
        handlers.forEach(({ event, handler }) => {
          element.removeEventListener(event, handler);
        });
      });
    };
  }, []);
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="relative bg-[#F3EEE8] py-8 lg:py-12 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center space-y-4">
              {/* Welcome text */}
              <div>
                <div
                  className="inline-block px-6 py-2 rounded-full"
                  style={{ backgroundColor: "#F8D9C4" }}
                >
                  <p className="text-sm font-body-bold text-black uppercase tracking-widest">
                    הדפסה אישית באיכות גבוהה
                  </p>
                </div>

                {/* Main headline - made bigger and added more space */}
                <h1 className="text-4xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-dark-gray leading-tight max-w-4xl mx-auto mt-4">
                  ספרון תינוקות מותאם באופן{" "}
                  <span className="relative inline-block">
                    <span className="relative z-10">אישי</span>
                    <span
                      className="absolute bottom-0 left-0 right-0 transform -rotate-1 rounded-full"
                      style={{
                        height: "8px",
                        borderRadius: "4px",
                        transform: "rotate(-1deg) translateY(0px)",
                        background:
                          "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                        boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                        width: "110%",
                        left: "-5%",
                      }}
                    ></span>
                  </span>
                </h1>

                {/* Description */}
                <p
                  className="text-base sm:text-lg md:text-xl font-normal text-medium-gray leading-relaxed max-w-xl mx-auto mt-6 text-center"
                  style={{
                    fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
                    letterSpacing: "0.5px",
                  }}
                >
                  ספרון נפתח ודו צדדי עם תמונות של הקרובים ביותר.
                  <br />
                  מתאים במיוחד לזמן בטן וגילאי 0-3 חודשים.
                </p>
              </div>

              {/* Hero Image with Arrow */}
              <div className="w-full max-w-6xl mx-auto relative">
                <img
                  src="/musicians.png"
                  alt="Baby book example"
                  className="w-full h-auto object-contain"
                  style={{ maxHeight: "220px" }}
                />

                {/* Decorative Arrow - Right side */}
                <div className="absolute top-1/2 right-36 transform -translate-y-1/2 hidden lg:block">
                  {/* Text above arrow */}
                  <div
                    className="absolute -top-6 left-26 transform -translate-x-1/2 text-dark-gray text-sm"
                    style={{
                      fontFamily: "'Playpen Sans Hebrew', cursive",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      transform: "translateX(-50%) rotate(5deg)",
                      lineHeight: "1.2",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>מותאם לראיית</div>
                    <div>תינוקות</div>
                  </div>

                  {/* Arrow */}
                  <svg
                    width="100"
                    height="80"
                    viewBox="0 0 100 80"
                    className="text-dark-gray"
                    style={{ transform: "rotate(180deg)" }}
                  >
                    <path
                      d="M10 40 Q50 20 90 50"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M75 35 L90 50 L75 65"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* CTA Button with Arrow */}
              <div className="pt-1 relative flex items-center justify-center">
                {/* Hand-drawn Arrow and Text - Left side */}
                <div className="hidden lg:block absolute right-1/2 mr-20 top-1/2 transform -translate-y-1/2">
                  {/* Arrow */}
                  <svg
                    width="80"
                    height="40"
                    viewBox="0 0 80 40"
                    className="text-dark-gray"
                    style={{ transform: "rotate(-26deg)" }}
                  >
                    <path
                      d="M8 30 Q25 20 50 25"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M45 15 L50 25 L45 35"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  {/* Text */}
                  <div
                    className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-dark-gray text-sm"
                    style={{
                      transform: "translateX(-50%) rotate(-32deg)",
                      fontFamily: "'Playpen Sans Hebrew', cursive",
                      fontWeight: "600",
                      letterSpacing: "0.5px",
                      lineHeight: "1.2",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div>זה לוקח</div>
                    <div>דקה</div>
                  </div>
                </div>

                {/* Centered Button */}
                <Button
                  size="lg"
                  className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-black text-base text-sm transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  צרו ספרון עכשיו
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Path Section */}
        <section className="relative bg-[#F9F7EE] py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2 className="text-[1.8rem] sm:text-3xl md:text-4xl font-black text-dark-gray leading-tight max-w-3xl mx-auto">
                מה הופך את הספרון שלנו{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">למיוחד</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                    style={{
                      height: "6px",
                      borderRadius: "6px 6px 0 0",
                      transform: "rotate(-2deg) translateY(0px)",
                      background:
                        "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                      boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                      width: "110%",
                      left: "-5%",
                    }}
                  ></span>
                </span>
              </h2>
            </div>

            {/* 4 Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
              {/* Column 1 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/couple.png"
                    alt="Couple"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  להסתכל על הקרובים ביותר{" "}
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  הפנים של המטפלים העיקריים מוכרות לתינוק ומרגיעות אותו כבר
                  מימיו הראשונים
                </p>
              </div>

              {/* Column 2 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/sister.png"
                    alt="Young Sister"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  להכיר את המשפחה
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  הזדמנות להיחשף ולהסתכל על המשפחה אליה נכנס התינוק
                </p>
              </div>

              {/* Column 3 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/parent-and-son.png"
                    alt="Parent and Son"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  מזכרת מתוקה
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  ספרון שהוא אישי ומהווה מזכרת לתקופה קצרה ומופלאה בחיי התינוק
                </p>
              </div>

              {/* Column 4 */}
              <div className="text-center">
                {/* Image */}
                <div className="w-48 h-48 md:w-64 md:h-64 mx-auto mb-6">
                  <img
                    src="/dad-and-son.png"
                    alt="Dad and Son"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                {/* Title */}
                <h3 className="font-heading text-dark-gray text-lg mb-2 text-[1.2em] md:text-lg">
                  לא עוד מוצר גנרי
                </h3>

                {/* Subtitle */}
                <p className="font-body text-medium-gray text-sm leading-relaxed max-w-[280px] md:max-w-none mx-auto">
                  במקום להסתכל על צורות ותבניות, תנו לתינוק להסתכל על המשפחה
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-16">
              <p className="font-body text-medium-gray text-sm">
                מעוניינים לדעת עוד על ראיית תינוקות?{" "}
                <a
                  href="#"
                  className="text-[#F4A261] hover:text-[#F4A261]/80 underline cursor-pointer transition-colors duration-200"
                >
                  גלו כאן
                </a>
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative bg-gradient-to-br from-soft-peach-light to-soft-blue-light py-16 lg:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-heading text-dark-gray mb-4">
                איך זה{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">עובד</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                    style={{
                      height: "6px",
                      borderRadius: "6px 6px 0 0",
                      transform: "rotate(-2deg) translateY(0px)",
                      background:
                        "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                      boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                      width: "110%",
                      left: "-5%",
                    }}
                  ></span>
                </span>
                ?
              </h2>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                כל מה שצריך זה כמה תמונות. אנחנו נטפל בכל השאר
              </p>
            </div>

            {/* Steps Grid */}
            <div className="flex flex-col md:grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto space-y-12 md:space-y-0 px-3 md:px-0">
              {/* Step 1 */}
              <div className="text-center relative">
                {/* Step Image */}
                <div className="mb-4">
                  <div
                    className="w-48 md:w-56 h-48 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                  >
                    <img
                      src="/upload-images.jpg"
                      alt="Upload Images"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFEDD4" }}
                  >
                    <span className="text-dark-gray font-heading text-sm font-bold">
                      1
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mt-3 max-w-sm mx-auto">
                  {/* Step Text */}
                  <div className="mb-1">
                    <p className="text-primary-orange text-sm font-body-bold">
                      אתם עושים
                    </p>
                  </div>

                  <h3 className="text-xl font-heading text-dark-gray">
                    מעלים תמונות
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    מעלים 5 תמונות אהובות של התינוק או המשפחה – זה לוקח פחות
                    מדקה, ואפשר גם מהטלפון
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-orange to-soft-peach opacity-30"></div>
              </div>

              {/* Step 2 */}
              <div className="text-center relative">
                {/* Step Image */}
                <div className="mb-4">
                  <div
                    className="w-48 md:w-56 h-48 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                  >
                    <img
                      src="/transform-images.png"
                      alt="Transform Images"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFEDD4" }}
                  >
                    <span className="text-dark-gray font-heading text-sm font-bold">
                      2
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mt-3 max-w-sm mx-auto">
                  {/* Step Text */}
                  <div className="mb-1">
                    <p className="text-primary-orange text-sm font-body-bold">
                      אנחנו עושים
                    </p>
                  </div>

                  <h3 className="text-xl font-heading text-dark-gray">
                    מעבדים את התמונות
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    בעזרת בינה מלאכותית (AI) אנחנו ממירים את התמונות לגרסאות
                    ברורות וידידותיות לתינוק – בשחור-לבן ובצבע.
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-soft-peach to-soft-blue opacity-30"></div>
              </div>

              {/* Step 3 */}
              <div className="text-center relative">
                {/* Step Image */}
                <div className="mb-4">
                  <div
                    className="w-48 md:w-56 h-48 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                  >
                    <img
                      src="/print-book.png"
                      alt="Print Book"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFEDD4" }}
                  >
                    <span className="text-dark-gray font-heading text-sm font-bold">
                      3
                    </span>
                  </div>
                </div>

                {/* Step Content */}
                <div className="space-y-4 mt-3 max-w-sm mx-auto">
                  {/* Step Text */}
                  <div className="mb-1">
                    <p className="text-primary-orange text-sm font-body-bold">
                      אנחנו עושים
                    </p>
                  </div>

                  <h3 className="text-xl font-heading text-dark-gray">
                    מדפיסים את הספרון
                  </h3>
                  <p className="font-body text-medium-gray leading-relaxed">
                    אנחנו מדפיסים את הספרון האישי שלכם באיכות גבוהה ושולחים אותו
                    עד הבית – מוכן לשימוש ולמזכרת.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-4 rounded-full font-body-bold text-lg transition-all duration-200 transform hover:scale-105">
                התחילו עכשיו
              </Button>
            </div>
          </div>
        </section>

        {/* Dual Design Section */}
        <section className="relative bg-white py-8 lg:py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8">
              <h2 className="text-[1.8rem] sm:text-3xl md:text-4xl font-black text-dark-gray leading-tight max-w-2xl mx-auto">
                תמונה אחת,{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">שני</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                    style={{
                      height: "4px",
                      borderRadius: "4px 4px 0 0",
                      transform: "rotate(-2deg) translateY(0px)",
                      background:
                        "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                      boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                      width: "110%",
                      left: "-5%",
                    }}
                  ></span>
                </span>{" "}
                עיצובים
              </h2>
              <p className="text-base sm:text-lg font-body text-medium-gray leading-relaxed max-w-xl mx-auto mt-4">
                אנחנו נעבד את התמונה וניצור ממנה שתי גרסאות שונות
              </p>
            </div>

            {/* Mobile Carousel / Desktop Grid */}
            <div className="max-w-4xl mx-auto relative mt-16 md:mt-24">
              {/* Center Image - Overlapping both mobile and desktop */}
              <div
                className="absolute top-12 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 md:top-0 md:-translate-y-3/4"
                style={{ top: "38px" }}
              >
                <div className="w-26 h-26 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src="/original-example.jpeg"
                    alt="Original Example"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Mobile Carousel */}
              <div className="md:hidden">
                <div className="relative overflow-hidden">
                  <div
                    className="flex transition-transform duration-300 ease-in-out pt-12 cursor-grab active:cursor-grabbing"
                    id="carousel-container"
                    style={{ touchAction: "pan-x pan-y" }}
                  >
                    {/* Slide 1 - Colorful (Left) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <div className="bg-orange-100 rounded-2xl p-6 text-center">
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          צבעוני
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          מתאים מגיל 3 חודשים ומעלה
                        </p>
                        <div className="w-40 h-40 mx-auto">
                          <img
                            src="/colorful-example.png"
                            alt="Colorful Example"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Slide 2 - Black and White (Right) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <div className="bg-gray-100 rounded-2xl p-6 text-center">
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          שחור לבן
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          מתאים במיוחד מגיל לידה ועד גיל 3 חודשים
                        </p>
                        <div className="w-40 h-40 mx-auto">
                          <img
                            src="/black-and-white-example.png"
                            alt="Black and White Example"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    className="cursor-pointer w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200 cursor-pointer"
                    data-slide="0"
                  ></button>
                  <button
                    className="cursor-pointer w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200 cursor-pointer"
                    data-slide="1"
                  ></button>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-0 relative">
                {/* Left Side - Black and White */}
                <div className="bg-gray-100 rounded-l-2xl p-8 text-center relative pt-16">
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    שחור לבן
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    מתאים במיוחד מגיל לידה ועד גיל 3 חודשים
                  </p>
                  <div className="w-56 h-56 mx-auto">
                    <img
                      src="/black-and-white-example.png"
                      alt="Black and White Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>

                {/* Right Side - Colorful */}
                <div className="bg-orange-100 rounded-r-2xl p-8 text-center relative pt-16">
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    צבעוני
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    מתאים מגיל 3 חודשים ומעלה
                  </p>
                  <div className="w-56 h-56 mx-auto">
                    <img
                      src="/colorful-example.png"
                      alt="Colorful Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Us Section */}
        <section id="about" className="relative bg-[#F3EEE8] pb-6">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left Column - Image */}
              <div className="relative">
                <img
                  src="/about-us.png"
                  alt="About Us"
                  className="w-full h-auto rounded-3xl"
                />
              </div>

              {/* Right Column - Text Content */}
              <div className="relative">
                {/* Content */}
                <div className="space-y-4">
                  {/* Brand name */}
                  <div className="text-primary-orange font-body-bold text-sm uppercase tracking-wide mb-0">
                    ליטל גלי
                  </div>

                  {/* Main heading */}
                  <h2 className="text-3xl lg:text-4xl font-black text-dark-gray leading-tight">
                    מי{" "}
                    <span className="relative inline-block">
                      <span className="relative z-10">אנחנו</span>
                      <span
                        className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                        style={{
                          height: "6px",
                          borderRadius: "6px 6px 0 0",
                          transform: "rotate(-2deg) translateY(0px)",
                          background:
                            "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                          boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                          width: "110%",
                          left: "-5%",
                        }}
                      ></span>
                    </span>
                  </h2>

                  {/* Body text */}
                  <div className="space-y-3 pt-2">
                    <p className="font-body text-medium-gray leading-relaxed">
                      התחלתי לעבוד על הפרויקט אחרי שגלי נולדה. מצאתי את עצמי
                      נשאבת לזה – חושבת על זה, מתכננת, מעצבת את האתר, ובכל פעם
                      שמישהי העלתה תמונות לספרון – זה היה הדבר הראשון שרציתי
                      לראות.
                    </p>
                    <p className="font-body text-medium-gray leading-relaxed">
                      נהניתי מהתהליך עצמו, מליצור משהו חדש, ובעיקר מלראות את
                      התגובות של האמהות כשהספרונים הגיעו אליהן. הרגשתי שאני עושה
                      משהו מיוחד, שיש לו מקום, ושגם אני הייתי רוצה אותו בשביל
                      גלי שלי (ואל דאגה – הכנתי לה כבר כמה וכמה ספרונים משלה).
                    </p>
                    <p className="font-body text-medium-gray leading-relaxed">
                      אני מקווה שכמוני יהיו עוד אמהות שימצאו בספרון הזה ערך,
                      שירצו אחד כזה לתינוק שלהן. ובסוף – זה גם בשבילנו. לראות את
                      התינוק שלנו מסתכל על התמונות של המשפחה בסקרנות ולהתרגש בכל
                      פעם מחדש.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Q&A Section */}
        <section
          id="qa"
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-heading text-dark-gray mb-4">
                שאלו{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">אותנו</span>
                  <span
                    className="absolute bottom-0 left-0 right-0 transform -rotate-1"
                    style={{
                      height: "6px",
                      borderRadius: "6px 6px 0 0",
                      transform: "rotate(-2deg) translateY(0px)",
                      background:
                        "linear-gradient(90deg, rgba(229, 84, 61, 0.6) 0%, rgba(229, 84, 61, 0.8) 50%, rgba(229, 84, 61, 0.6) 100%)",
                      boxShadow: "0 2px 4px rgba(229, 84, 61, 0.3)",
                      width: "110%",
                      left: "-5%",
                    }}
                  ></span>
                </span>
              </h2>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                התשובות לשאלות הנפוצות ביותר על הספרון והשירותים שלנו
              </p>
            </div>

            {/* Accordion */}
            <div className="max-w-4xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem
                  value="item-1"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    ממה הספרון עשוי?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    הספרון עשוי מנייר איכותי ועבה שנעבר למינציה.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-2"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    כמה תמונות צריך לבחור?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    5 תמונות בלבד. אותן תמונות מופיעות בצד אחד בשחור לבן ובצד
                    השני בצבעוני.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-3"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    מי כדאי שיהיה בספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    אנשים קרובים שתינוקכם יכיר ויתחבר אליהם – הורים, סבים, אחים,
                    חבר קרוב ואפילו חיית המחמד המשפחתית.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem
                  value="item-9"
                  className="border border-soft-peach-light rounded-lg px-6 py-4 bg-white shadow-sm cursor-pointer"
                >
                  <AccordionTrigger className="text-right font-body-bold text-dark-gray hover:text-primary-orange transition-colors cursor-pointer">
                    מה אם אני לא מרוצה מהספרון?
                  </AccordionTrigger>
                  <AccordionContent className="text-right font-body text-medium-gray leading-relaxed pt-4">
                    המטרה שלנו היא שתאהבו ותהיו מרוצים מהספרון שלכם. אם זה לא
                    המצב שאנחנו מאפשרים להחזיר את הספרון ולקבל את התשלום בחזרה.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Button to navigate to Q&A page */}
            <div className="text-center mt-12">
              <a href="/qa">
                <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200 transform hover:scale-105">
                  לכל השאלות והתשובות
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white">
        {/* Upper Section - White Background with Columns */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Column 1: Logo/Brand (Right side) */}
            <div className="col-span-2 lg:col-span-1 order-1 lg:order-1">
              <div className="mb-4">
                <img src="/logo.png" alt="Little Gali" className="h-8 w-auto" />
              </div>
              <p className="font-body text-medium-gray text-sm leading-relaxed mb-6">
                Little Gali הופך תמונות רגילות ליצירות שחור-לבן עדינות שמתאימות
                במיוחד לראיית תינוקות. נולד מאמא שאהבה לראות את התינוקת שלה
                נמשכת לפנים מוכרות.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Facebook"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                  aria-label="Instagram"
                >
                  <svg
                    className="w-5 h-5 text-black"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2: Platform */}
            <div className="order-2 lg:order-2">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                פלטפורמה
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    איך זה עובד
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    מדריך בחירת תמונה
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    גלריית השראה
                  </a>
                </li>
                <li>
                  <a
                    href="/qa"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    שאלות ותשובות
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    ראיית תינוקות
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Policies */}
            <div className="order-3 lg:order-3">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                תקנונים
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="/terms"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    תנאי שירות
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    פרטיות
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    משלוחים
                  </a>
                </li>
                <li>
                  <a
                    href="/returns"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    החזרות
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: About */}
            <div className="order-4 lg:order-4">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                אודות
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    מי אנחנו
                  </a>
                </li>
                <li>
                  <a
                    href="/contact"
                    className="font-body text-medium-gray hover:text-dark-gray transition-colors text-sm"
                  >
                    צרו קשר
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Contact US (Left side) */}
            <div className="order-5 lg:order-5">
              <h3 className="font-heading text-dark-gray text-lg font-bold mb-4">
                צרו קשר
              </h3>
              <a href="/contact">
                <Button className="cursor-pointer bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-body-bold text-sm transition-all duration-200">
                  צרו איתנו קשר
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section - Dark Gray Bar */}
        <div className="bg-gray-800 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center font-body text-white/80 text-sm">
              © Copyright Little Gali. כל הזכויות שמורות.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
