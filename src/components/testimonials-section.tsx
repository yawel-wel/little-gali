"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/LanguageContext";
import { Title } from "./title";
import IconButton from "@mui/material/IconButton";

interface Testimonial {
  id: number;
  rating: number;
  text: string;
  name: string;
  imageUrl?: string;
}

const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    rating: 5,
    text: "המתנה הכי יפה שקיבלת ללידה 🥹 מומלץ בחום! שירות מושלם והתוצר מדהים‎",
    name: "Ella Abramovitch",
  },
  {
    id: 2,
    rating: 5,
    text: "ספרון אישי, ייחודי ופשוט הכי מושלם שאפשר לבקש! התינוק שלנו פשוט התאהב בספרון ולא מפסיק להוריד את העיניים ממנו!! כיף גדול! התמונות הצבעוניות והשחור לבן יצאו נהדרות ❤️ ממליץ כמתנה לכל הורה חדש!",
    name: "Pavel Krigman",
  },
  {
    id: 3,
    rating: 5,
    text: "ספרון מושלם, הבן שלנו מאוד נהנה לראות את הסבים והסבתות שלו בתמונות. מעולה לעידוד לזמן בטן ולכל שימוש אחר. ממליצה מאוד :)",
    name: "Shir David",
  },
  {
    id: 4,
    rating: 5,
    text: "מתחילת התהליך- החל מבחירת התמונות ועד קבלת המשלוח השירות ברמה הגבוהה ביותר. מתנה מקורית ומיוחדת ליולדת. ממליצה בחום",
    name: "Dafna Magidov",
  },
  {
    id: 5,
    rating: 5,
    text: "הספרון ממש מקורי ומקסים!יכול לשמש בכל מיני סיטואציות, והרבה יותר מענין ומסקרן את הקטנים מאשר הספרון הקלאסי. אהבנו מאוד מאוד ❤️ ‎",
    name: "Maya Zohar",
  },
  {
    id: 6,
    rating: 5,
    text: "קיבלתי כמתנה , זה מהמם !!! סופר התרגשנו, זה גם שימושי, גם אישי מאוד . אהבתי את היצירתיות והפשטות . ממש ממליצה כמתנה .",
    name: "מורג סעדה",
  },
  {
    id: 7,
    rating: 5,
    text: "הזמנתי 3 אלבומים והם היו פשוט וואו!!! המשפחות כ\"כ התלהבו והתרגשו מהמתנה המיוחדת וטענו שלא ראו את זה עוד. אני יודעת שכולם כבר מראים לקטנים שלהם את התמונות לאורך היום, ממליצה בחום!!! זו מתנה מקורית, שלגמרי לגמרי שווה!!! :)",
    name: "עמית ביבי",
  },
  {
    id: 8,
    rating: 5,
    text: "כל תמונה זיכרון של אושר. תודה רבה על העיצוב המיוחד ❤️ משתלב נפלא במשטח הפעילות ובעגלה סוחט מחמאות ותגובות נרגשות מהמשפחה ממליצה בחום ❤️",
    name: "Sapir Zalah",
  },
  {
    id: 9,
    rating: 5,
    text: "ספרון מושלם!! הבן שלי ממש נהנה להסתכל עליו ורואים איך הוא מגיב מהמם לדמויות! ממליצה בחום!",
    name: "טל סעד",
  },
  {
    id: 10,
    rating: 5,
    text: "ספרון מושלם מעוצב מותאם אישית לבייבי עם האנשים הכי יקרים וקרובים יעל מקסימה והתהליך איתה ובאתר שלה ממש נגיש מזמין וברור! ממליצה בחום",
    name: "Noi Pinchas",
  },
  {
    id: 11,
    rating: 5,
    text: "אין על הספרון של little Gali כל כך אישי ויפה שבא לי לתלות עוד אחד בבית סתם ככה 😍 רעיון מושלם גם לקנות כמתנה להורים חדשים!",
    name: "Yael Zagofsky",
  },
  {
    id: 12,
    rating: 5,
    text: "ספרון מושלם ! איכות מדהימה , בא לי עוד ספרונים כאלה וגם רעיון מרגש ואישי לחברות שילדו . תודה ❤️",
    name: "Amit Dadon",
  },
  {
    id: 13,
    rating: 5,
    text: "ספרון אישי ומקסים!! הבת שלי בת החצי שנה נהנית להסתכל על התמונות של הסבים והסבתות שלה 😍",
    name: "Moran Langsam",
  },
  {
    id: 14,
    rating: 5,
    text: "איכותי ומהמם! רעיון מושלם למתנה!!",
    name: "ליהי גרוסמן",
  },
];

const easeOwlet: any = [0.16, 1, 0.3, 1];

export function TestimonialsSection() {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoRotateRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotate every 5 seconds
  useEffect(() => {
    if (prefersReducedMotion) return;

    const startAutoRotate = () => {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mockTestimonials.length);
      }, 5000);
    };

    startAutoRotate();

    return () => {
      if (autoRotateRef.current) {
        clearInterval(autoRotateRef.current);
      }
    };
  }, [prefersReducedMotion]);

  // Reset auto-rotate timer when user manually changes testimonial
  const resetAutoRotate = () => {
    if (autoRotateRef.current) {
      clearInterval(autoRotateRef.current);
    }
    if (!prefersReducedMotion) {
      autoRotateRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % mockTestimonials.length);
      }, 5000);
    }
  };

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % mockTestimonials.length);
    resetAutoRotate();
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + mockTestimonials.length) % mockTestimonials.length
    );
    resetAutoRotate();
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

  // Get visible profile pictures (5 visible, with partial ones on edges)
  const getVisibleProfiles = () => {
    const visible = [];
    // Show 2 before, current, and 2 after (total 5 visible)
    for (let i = -2; i <= 2; i++) {
      const index =
        (currentIndex + i + mockTestimonials.length) %
        mockTestimonials.length;
      visible.push({
        testimonial: mockTestimonials[index],
        index: index,
        position: i,
        isActive: i === 0,
      });
    }
    return visible;
  };

  return (
    <motion.section
      className="relative pt-16 lg:pt-24 pb-0 lg:pb-4 bg-white h-[520px] lg:h-[570px]"
      initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: easeOwlet }}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <Title
            highlightText={t("home.testimonials.titleHighlight")}
            size="lg"
            className="mb-0"
          >
            {t("home.testimonials.title")}
          </Title>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block max-w-4xl mx-auto">
          {/* Profile Pictures Row */}
          <div className="flex items-center justify-center gap-6 mb-6 relative">
            {getVisibleProfiles().map(({ testimonial, index, position, isActive }) => {
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
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-[#F4A261] to-[#E16854] flex items-center justify-center text-white font-semibold text-lg">
                      {getInitials(testimonial.name)}
                    </div>
                  </div>
                  {/* Orange Star Icon on Active Profile - Only for Ella and Pavel */}
                  {isActive && (testimonial.id === 1 || testimonial.id === 2) && (
                    <motion.div
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Single Large Testimonial Card */}
          <div className="relative h-[280px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: easeOwlet }}
                className="relative h-full"
              >
                {/* Speech Bubble Card */}
                <div
                  className="bg-white rounded-2xl p-8 shadow-lg relative h-full flex flex-col"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(50% + 40px) calc(100% - 20px), 50% 100%, calc(50% - 40px) calc(100% - 20px), 0% calc(100% - 20px))",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 justify-center mb-3 flex-shrink-0">
                    {renderStars(mockTestimonials[currentIndex].rating)}
                  </div>

                  {/* Review Text */}
                  <p className="text-base lg:text-lg font-body text-dark-gray leading-relaxed text-center mb-6 overflow-y-auto max-h-[180px]" dir={locale === "he" ? "rtl" : "ltr"}>
                    {mockTestimonials[currentIndex].text}
                  </p>

                  {/* Author Name */}
                  <div className="text-sm font-body text-gray-500 text-center flex-shrink-0" dir="ltr">
                    -{mockTestimonials[currentIndex].name}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden w-full">
          <div className="relative overflow-hidden w-full">
            {/* Profile Pictures Row - Mobile */}
            <div className="flex items-center justify-center gap-6 mb-4 relative px-4">
              {(() => {
                // Show previous, current, and next (3 total on mobile)
                const profiles = [];
                for (let i = -1; i <= 1; i++) {
                  const index =
                    (currentIndex + i + mockTestimonials.length) %
                    mockTestimonials.length;
                  const isActive = i === 0;
                  profiles.push({
                    testimonial: mockTestimonials[index],
                    index: index,
                    isActive: isActive,
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
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200 flex items-center justify-center">
                      <div className="w-full h-full bg-gradient-to-br from-[#F4A261] to-[#E16854] flex items-center justify-center text-white font-semibold text-lg">
                        {getInitials(testimonial.name)}
                      </div>
                    </div>
                    {/* Orange Star Icon on Active Profile - Only for Ella and Pavel */}
                    {isActive && (testimonial.id === 1 || testimonial.id === 2) && (
                      <motion.div
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-md"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </motion.div>
                    )}
                  </motion.div>
                ));
              })()}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: easeOwlet }}
                className="px-4 h-[300px]"
              >

                {/* Speech Bubble Card */}
                <div
                  className="bg-white rounded-2xl p-6 shadow-lg relative h-full flex flex-col"
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 100% calc(100% - 20px), calc(50% + 40px) calc(100% - 20px), 50% 100%, calc(50% - 40px) calc(100% - 20px), 0% calc(100% - 20px))",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 justify-center mb-3 flex-shrink-0">
                    {renderStars(mockTestimonials[currentIndex].rating)}
                  </div>

                  {/* Review Text */}
                  <p className="text-base font-body text-dark-gray leading-relaxed mb-6 text-center overflow-y-auto max-h-[200px]" dir={locale === "he" ? "rtl" : "ltr"}>
                    {mockTestimonials[currentIndex].text}
                  </p>

                  {/* Author Name */}
                  <div className="text-sm font-body text-gray-500 text-center flex-shrink-0" dir="ltr">
                    -{mockTestimonials[currentIndex].name}
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
