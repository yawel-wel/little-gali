"use client";

import { useEffect } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
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
import { BOOK_PRICE } from "@/lib/constants";

export default function Home() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 300], [0, -8]);
  const easeOwlet: any = [0.16, 1, 0.3, 1];
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
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] md:h-[600px] lg:h-[650px] overflow-hidden pt-[72px] pb-24 sm:pb-0">
          {/* Background Image - positioned top-right */}
          <div className="absolute inset-0">
            <motion.img
              src="/hero-image.jpeg"
              alt="Baby book example"
              className="w-full h-full object-cover object-top sm:object-[center_50%]"
              style={{ y: prefersReducedMotion ? 0 : heroY }}
              initial={prefersReducedMotion ? false : { scale: 1.2 }}
              animate={prefersReducedMotion ? undefined : { scale: 1.05 }}
              transition={{ duration: 5, ease: easeOwlet }}
            />
            {/* Lighter gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/25 to-black/20" />
          </div>
          {/* Content Overlay - center-aligned */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 h-full flex items-start sm:items-center justify-center pt-10 sm:pt-0">
            <div className="text-center space-y-5 md:space-y-6 max-w-2xl">
              {/* Title - centered with better contrast */}
              <div className="relative px-4">
                <Title
                  highlightText="אישי"
                  color="text-white"
                  className="text-[34px] sm:text-5xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                >
                  ספרון תינוקות מותאם באופן אישי
                </Title>
              </div>
              {/* CTA Button */}
              <div className="pt-6">
                <motion.div
                  className="fixed bottom-4 left-1/2 w-[calc(100%-32px)] max-w-md -translate-x-1/2 z-40 sm:relative sm:bottom-auto sm:left-auto sm:w-auto sm:max-w-none sm:translate-x-0"
                  whileHover={{
                    scale: 1.05,
                    y: -2,
                    transition: { duration: 0.2, ease: easeOwlet },
                  }}
                >
                  <a href="/upload">
                    <Button
                      size="lg"
                      className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-10 py-4 rounded-full font-body-bold text-base md:text-lg transition-all duration-200 shadow-2xl w-full sm:w-auto"
                    >
                      צרו ספרון עכשיו
                    </Button>
                  </a>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
        {/* הספרון שלנו Section */}
        <motion.section
          className="relative bg-white py-12 lg:py-16"
          initial={
            prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.9, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Column - Text Content */}
                <div className="order-1 lg:order-1 space-y-6">
                  {/* Title with Highlight */}
                  <div className="-mt-3">
                    <Title
                      highlightText="הספרון"
                      className="text-3xl lg:text-4xl text-center lg:text-right"
                    >
                      הספרון שלנו
                    </Title>
                  </div>

                  {/* Subtitle */}
                  <div className="text-center lg:text-right -mt-1">
                    <h3 className="text-xl lg:text-2xl font-heading text-dark-gray">
                      ספרון אישי לתינוק – עם תמונות המשפחה שלכם
                    </h3>
                  </div>

                  {/* Description Text */}
                  <div className="space-y-3 text-center lg:text-right">
                    <p className="font-body text-medium-gray leading-relaxed">
                      ספרון דו־צדדי עם תמונות מעובדות ב־AI שנוצרות מהתמונות
                      המשפחתיות שלכם.
                      <br />
                      צד אחד בשחור־לבן לגירוי ראייה לתינוקות בני 0–3 חודשים, וצד
                      שני צבעוני, להמשך ההתפתחות.
                      <br />
                      מושלם לזמן בטן, לשידת ההחתלה או למתנה אישית במיוחד.
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <span className="text-xl font-heading text-dark-gray">
                      מחיר: {BOOK_PRICE} ₪
                    </span>
                  </div>

                  {/* CTA Button */}
                  <div className="flex justify-center lg:justify-start pt-2">
                    <motion.div
                      whileHover={{
                        scale: 1.01,
                        y: -1,
                        transition: { duration: 0.2, ease: easeOwlet },
                      }}
                    >
                      <a href="/upload">
                        <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-5 rounded-full font-body-bold text-base transition-all duration-200">
                          צרו עכשיו את הספרון האישי שלכם
                        </Button>
                      </a>
                    </motion.div>
                  </div>
                </div>

                {/* Right Column - Single Image */}
                <div className="order-2 lg:order-2">
                  <div className="w-full">
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <motion.img
                        src="/our-book.jpg"
                        alt="Book showcase"
                        className="w-full h-full object-cover"
                        initial={prefersReducedMotion ? false : { scale: 1.12 }}
                        whileInView={
                          prefersReducedMotion ? undefined : { scale: 1 }
                        }
                        transition={{ duration: 2.2, ease: easeOwlet }}
                        viewport={{ once: true, amount: 0.25 }}
                        whileHover={{
                          scale: 1.04,
                          transition: { duration: 0.5, ease: easeOwlet },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
          initial={
            prefersReducedMotion ? false : { opacity: 0, y: 24, scale: 0.98 }
          }
          whileInView={
            prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: 0.9, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.1 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <Title highlightText="עובד" size="lg" className="mb-4">
                איך זה עובד – בשלושה צעדים פשוטים
              </Title>
              <p className="text-lg font-body text-medium-gray max-w-2xl mx-auto">
                כל מה שצריך זה כמה תמונות אהובות – אנחנו נדאג לכל השאר
              </p>
            </div>

            {/* Steps Grid */}
            <motion.div
              className="flex flex-col md:grid md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto space-y-12 md:space-y-0 px-3 md:px-0"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.15 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.2 },
                },
              }}
            >
              {/* Step 1 */}
              <motion.div
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.2, ease: easeOwlet },
                  },
                }}
              >
                {/* Step Image */}
                <div className="mb-4">
                  <motion.div
                    className="w-64 md:w-56 h-64 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/upload-images.jpg"
                      alt="Upload Images"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFD8D0" }}
                  >
                    <span className="text-dark-gray font-heading text-base font-bold">
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
                    מדקה
                  </p>
                </div>

                {/* Connecting line to next step */}
                <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-primary-orange to-soft-peach opacity-30"></div>
              </motion.div>

              {/* Step 2 */}
              <motion.div
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.2, ease: easeOwlet },
                  },
                }}
              >
                {/* Step Image */}
                <div className="mb-4">
                  <motion.div
                    className="w-64 md:w-56 h-64 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/transform-images.png"
                      alt="Transform Images"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFD8D0" }}
                  >
                    <span className="text-dark-gray font-heading text-base font-bold">
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
              </motion.div>

              {/* Step 3 */}
              <motion.div
                className="text-center relative"
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.2, ease: easeOwlet },
                  },
                }}
              >
                {/* Step Image */}
                <div className="mb-4">
                  <motion.div
                    className="w-64 md:w-56 h-64 md:h-56 mx-auto p-3 rounded-lg flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-[1.03]"
                    style={{ backgroundColor: "#F3EEE8" }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/print-book.png"
                      alt="Print Book"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                </div>

                {/* Step Number */}
                <div className="relative inline-block mb-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: "#FFD8D0" }}
                  >
                    <span className="text-dark-gray font-heading text-base font-bold">
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
              </motion.div>
            </motion.div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { type: "spring", stiffness: 200, damping: 20 },
                }}
              >
                <a href="/upload">
                  <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-4 rounded-full font-body-bold text-lg transition-all duration-200">
                    התחילו עכשיו
                  </Button>
                </a>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Dual Design Section */}
        <motion.section
          className="relative bg-white py-8 lg:py-12"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-8">
              <Title
                highlightText="שלכם"
                size="sm"
                className="max-w-2xl mx-auto"
              >
                התמונה שלכם – גם לפוקוס הראשון וגם לצבעים הראשונים
              </Title>
              <p className="text-base sm:text-lg font-body text-medium-gray leading-relaxed max-w-xl mx-auto mt-4">
                אנחנו ממירים כל תמונה לשתי גרסאות – אחת בשחור־לבן שמיועדת לגירוי
                הראייה הראשוני, ואחת צבעונית שמתאימה לשלב שבו התינוק כבר מזהה
                צבעים.
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
                  <motion.img
                    src="/original-example.jpeg"
                    alt="Original Example"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 3.5, ease: easeOwlet }}
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
                    {/* Slide 1 - Black and White (Left) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <motion.div
                        className="rounded-2xl p-6 text-center"
                        style={{ backgroundColor: "#F7F8FA" }}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          },
                        }}
                      >
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          שחור לבן
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          הצד הזה מתאים במיוחד לתינוקות מהלידה ועד גיל 3 חודשים
                          — בדיוק בשלב שבו הם מתחילים לזהות ניגודים חזקים.
                        </p>
                        <div className="w-40 h-40 mx-auto overflow-hidden rounded-lg">
                          <motion.img
                            src="/black-and-white-example.png"
                            alt="Black and White Example"
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 3.5, ease: easeOwlet }}
                          />
                        </div>
                      </motion.div>
                    </div>

                    {/* Slide 2 - Colorful (Right) */}
                    <div className="w-4/5 flex-shrink-0 pr-4">
                      <motion.div
                        className="rounded-2xl p-6 text-center"
                        style={{ backgroundColor: "#FFF7F2" }}
                        whileHover={{
                          scale: 1.02,
                          y: -2,
                          boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                          transition: {
                            type: "spring",
                            stiffness: 200,
                            damping: 20,
                          },
                        }}
                      >
                        <h3 className="text-lg font-heading text-dark-gray mb-2 mt-9 md:mt-0">
                          צבעוני
                        </h3>
                        <p className="text-xs font-body text-medium-gray mb-4">
                          הצד הצבעוני מושלם לגיל 3 חודשים ומעלה – כשהראייה
                          מתפתחת והעולם סביבם מתחיל להתמלא בצבעים.
                        </p>
                        <div className="w-40 h-40 mx-auto overflow-hidden rounded-lg">
                          <motion.img
                            src="/colorful-example.png"
                            alt="Colorful Example"
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.06 }}
                            transition={{ duration: 3.5, ease: easeOwlet }}
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>

                {/* Pagination Dots */}
                <div className="flex justify-center mt-6 space-x-2">
                  <button
                    className="cursor-pointer w-3 h-3 rounded-full bg-[#F4A261] transition-all duration-200"
                    data-slide="0"
                  ></button>
                  <button
                    className="cursor-pointer w-3 h-3 rounded-full bg-gray-300 hover:bg-[#F4A261] transition-all duration-200"
                    data-slide="1"
                  ></button>
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:grid md:grid-cols-2 gap-0 relative">
                {/* Left Side - Black and White */}
                <motion.div
                  className="rounded-l-2xl p-8 text-center relative pt-16"
                  style={{ backgroundColor: "#F7F8FA" }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    שחור לבן
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    הצד הזה מתאים במיוחד לתינוקות מהלידה ועד גיל 3 חודשים —
                    בדיוק בשלב שבו הם מתחילים לזהות ניגודים חזקים.
                  </p>
                  <motion.div
                    className="w-56 h-56 mx-auto"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/black-and-white-example.png"
                      alt="Black and White Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                </motion.div>

                {/* Right Side - Colorful */}
                <motion.div
                  className="rounded-r-2xl p-8 text-center relative pt-16"
                  style={{ backgroundColor: "#FFF7F2" }}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { opacity: 1, y: 0 }
                  }
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <h3 className="text-xl font-heading text-dark-gray mb-2">
                    צבעוני
                  </h3>
                  <p className="text-sm font-body text-medium-gray mb-4">
                    הצד הצבעוני מושלם לגיל 3 חודשים ומעלה – כשהראייה מתפתחת
                    והעולם סביבם מתחיל להתמלא בצבעים.
                  </p>
                  <motion.div
                    className="w-56 h-56 mx-auto"
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
                      transition: {
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                      },
                    }}
                  >
                    <img
                      src="/colorful-example.png"
                      alt="Colorful Example"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </motion.div>
                </motion.div>
              </div>
            </div>

            {/* Link to more examples */}
            <div className="text-center mt-8">
              <p className="text-sm font-body text-medium-gray">
                רוצים לראות עוד דוגמאות?{" "}
                <a
                  href="/inspiration"
                  className="text-primary-orange hover:text-primary-orange/80 underline cursor-pointer transition-colors duration-200"
                >
                  גלו כאן
                </a>
              </p>
            </div>
          </div>
        </motion.section>

        {/* Choose Your Path Section */}
        <motion.section
          className="relative bg-[#F3EEE8] py-16 lg:py-24"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: easeOwlet }}
          viewport={{ once: true, amount: 0.25 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-12">
              <Title highlightText="למיוחד" className="max-w-3xl mx-auto">
                מה הופך את הספרון שלנו למיוחד
              </Title>
            </div>

            {/* 4 Column Grid */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto"
              initial={prefersReducedMotion ? false : "hidden"}
              whileInView={prefersReducedMotion ? undefined : "show"}
              viewport={{ once: true, amount: 0.25 }}
              variants={{
                hidden: {},
                show: {
                  transition: { staggerChildren: 0.15 },
                },
              }}
            >
              {/* Column 1 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
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
              </motion.div>

              {/* Column 2 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
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
              </motion.div>

              {/* Column 3 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
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
              </motion.div>

              {/* Column 4 */}
              <motion.div
                className="text-center"
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 1.1, ease: easeOwlet },
                  },
                }}
              >
                {/* Image */}
                <div className="w-36 h-36 md:w-64 md:h-64 mx-auto mb-6">
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
              </motion.div>
            </motion.div>
          </div>
        </motion.section>

        {/* Meet Us Section */}
        <motion.section
          id="about"
          className="relative bg-white pb-6"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
              {/* Left Column - Image */}
              <div className="relative rounded-3xl overflow-hidden">
                <motion.img
                  src="/about-us.jpg"
                  alt="About Us"
                  className="w-full h-auto"
                  initial={prefersReducedMotion ? false : { scale: 1 }}
                  whileInView={
                    prefersReducedMotion ? undefined : { scale: 1.06 }
                  }
                  whileHover={{ scale: 1.06 }}
                  transition={{ duration: 2.5, ease: easeOwlet }}
                  viewport={{ once: true, amount: 0.4 }}
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
                  <Title highlightText="אנחנו" size="lg">
                    מי אנחנו
                  </Title>

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
        </motion.section>

        {/* Q&A Section */}
        <motion.section
          id="qa"
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F9F7EE" }}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 40 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section Title */}
            <div className="text-center mb-16">
              <Title highlightText="אותנו" size="lg" className="mb-4">
                שאלו אותנו
              </Title>
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
              <motion.div
                whileHover={{
                  scale: 1.02,
                  y: -2,
                  transition: { type: "spring", stiffness: 200, damping: 20 },
                }}
              >
                <a href="/qa">
                  <Button className="cursor-pointer bg-primary-orange hover:bg-primary-orange/90 text-white px-8 py-3 rounded-full font-body-bold text-sm transition-all duration-200">
                    לכל השאלות והתשובות
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
