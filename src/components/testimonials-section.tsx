"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { Title } from "./title";
import type { Testimonial } from "@/lib/loox/types";

const easeOwlet: any = [0.16, 1, 0.3, 1];

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReviews() {
      try {
        const response = await fetch("/api/loox/reviews");
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { reviews?: Testimonial[] };
        if (!cancelled && Array.isArray(data.reviews) && data.reviews.length > 0) {
          setTestimonials(data.reviews);
        }
      } catch (error) {
        console.error("Failed to load Loox reviews:", error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadReviews();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    const handleResize = () => checkMobile();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || testimonials.length === 0) return;

    autoRotateRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [prefersReducedMotion, testimonials.length]);

  const resetAutoRotate = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    if (!prefersReducedMotion && testimonials.length > 0) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }
  };

  const goToTestimonial = (index: number) => {
    setCurrentIndex(index);
    resetAutoRotate();
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "fill-yellow-400" : "fill-gray-200"
        }`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  const renderAvatar = (testimonial: Testimonial, className: string) => {
    if (testimonial.imageUrl) {
      return (
        <img
          src={testimonial.imageUrl}
          alt={testimonial.name}
          className={`${className} object-cover`}
        />
      );
    }

    return (
      <div
        className={`${className} bg-gradient-to-br from-[#F4A261] to-[#E16854] flex items-center justify-center text-white font-semibold text-lg`}
      >
        {getInitials(testimonial.name)}
      </div>
    );
  };

  const getVisibleProfiles = () => {
    const visible = [];
    for (let i = -2; i <= 2; i++) {
      const index =
        (currentIndex + i + testimonials.length) % testimonials.length;
      visible.push({
        testimonial: testimonials[index],
        index,
        position: i,
        isActive: i === 0,
      });
    }
    return visible;
  };

  if (isLoading || testimonials.length === 0) {
    return null;
  }

  const activeTestimonial = testimonials[currentIndex];

  return (
    <motion.section
      className="relative pt-16 lg:pt-24 pb-0 lg:pb-4 bg-white h-[520px] lg:h-[570px]"
      initial={
        prefersReducedMotion || isMobile === true
          ? undefined
          : { opacity: 0, y: 20 }
      }
      animate={
        isMobile === false && !prefersReducedMotion
          ? undefined
          : { opacity: 1, y: 0 }
      }
      whileInView={
        isMobile === false && !prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : undefined
      }
      transition={{ duration: 0.6, ease: easeOwlet }}
      viewport={{ once: true, amount: 0.05 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Title
            highlightText={t("home.testimonials.titleHighlight")}
            size="lg"
            className="mb-0"
          >
            {t("home.testimonials.title")}
          </Title>
          <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">
            Custom UI
          </p>
        </div>

        <div className="hidden md:block max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6 relative">
            {getVisibleProfiles().map(
              ({ testimonial, index, position, isActive }) => {
                const isEdge = Math.abs(position) === 2;
                return (
                  <motion.div
                    key={testimonial.id}
                    className={`relative ${
                      isActive
                        ? "w-20 h-20 z-10"
                        : isEdge
                          ? "w-12 h-12 opacity-40"
                          : "w-16 h-16 opacity-70"
                    } transition-all duration-300 cursor-pointer`}
                    onClick={() => goToTestimonial(index)}
                    whileHover={!isActive ? { scale: 1.1, opacity: 0.9 } : {}}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200">
                      {renderAvatar(testimonial, "w-full h-full")}
                    </div>
                  </motion.div>
                );
              },
            )}
          </div>

          <div className="relative h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: easeOwlet }}
                className="relative h-full"
              >
                <div
                  className="bg-white rounded-2xl p-8 shadow-lg relative h-full flex flex-col"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(50% + 40px) calc(100% - 20px), 50% 100%, calc(50% - 40px) calc(100% - 20px), 0% calc(100% - 20px))",
                  }}
                >
                  <div className="flex gap-1 justify-center mb-3 flex-shrink-0">
                    {renderStars(activeTestimonial.rating)}
                  </div>

                  <p
                    className="text-base lg:text-lg font-body text-dark-gray leading-relaxed text-center mb-6 overflow-y-auto max-h-[180px]"
                    dir={locale === "he" ? "rtl" : "ltr"}
                  >
                    {activeTestimonial.text}
                  </p>

                  <div
                    className="text-sm font-body text-gray-500 text-center flex-shrink-0"
                    dir="ltr"
                  >
                    -{activeTestimonial.name}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="md:hidden w-full">
          <div className="relative overflow-hidden w-full">
            <div className="flex items-center justify-center gap-6 mb-4 relative px-4">
              {(() => {
                const profiles = [];
                for (let i = -1; i <= 1; i++) {
                  const index =
                    (currentIndex + i + testimonials.length) %
                    testimonials.length;
                  profiles.push({
                    testimonial: testimonials[index],
                    index,
                    isActive: i === 0,
                  });
                }
                return profiles.map(({ testimonial, index, isActive }) => (
                  <motion.div
                    key={testimonial.id}
                    className={`relative ${
                      isActive ? "w-20 h-20 z-10" : "w-16 h-16 opacity-70"
                    } transition-all duration-300 cursor-pointer`}
                    onClick={() => goToTestimonial(index)}
                    whileHover={!isActive ? { scale: 1.1, opacity: 0.9 } : {}}
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200">
                      {renderAvatar(testimonial, "w-full h-full")}
                    </div>
                  </motion.div>
                ));
              })()}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial.id}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: easeOwlet }}
                className="px-4 h-[300px]"
              >
                <div
                  className="bg-white rounded-2xl p-6 shadow-lg relative h-full flex flex-col"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(50% + 40px) calc(100% - 20px), 50% 100%, calc(50% - 40px) calc(100% - 20px), 0% calc(100% - 20px))",
                  }}
                >
                  <div className="flex gap-1 justify-center mb-3 flex-shrink-0">
                    {renderStars(activeTestimonial.rating)}
                  </div>

                  <p
                    className="text-base font-body text-dark-gray leading-relaxed mb-6 text-center overflow-y-auto max-h-[200px]"
                    dir={locale === "he" ? "rtl" : "ltr"}
                  >
                    {activeTestimonial.text}
                  </p>

                  <div
                    className="text-sm font-body text-gray-500 text-center flex-shrink-0"
                    dir="ltr"
                  >
                    -{activeTestimonial.name}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
