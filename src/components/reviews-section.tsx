"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";
import { Title } from "./title";

interface Review {
  id: number;
  rating: number;
  text: string;
  name: string;
  location: string;
}

const mockReviews: Review[] = [
  {
    id: 1,
    rating: 5,
    text: "Sin duda repetiriamos. Nos ha gustado lo bien equipada que estaba. Además fueron muy amables, pedimos una cama supletoria y nos la facilitaron sin problemas.",
    name: "Pedro Santos",
    location: "GRANADA",
  },
  {
    id: 2,
    rating: 5,
    text: "We had a great time staying here. Arrival was seamless and location is great. We're making plans to be here for our next stay.",
    name: "Maria Samper",
    location: "MADRID",
  },
  {
    id: 3,
    rating: 4,
    text: "The book quality exceeded our expectations. Our baby loves looking at the familiar faces. Highly recommend!",
    name: "Sarah Cohen",
    location: "TEL AVIV",
  },
  {
    id: 4,
    rating: 5,
    text: "Perfect gift for new parents! The black and white side is perfect for our newborn, and the colorful side will be great as she grows.",
    name: "David Levy",
    location: "JERUSALEM",
  },
  {
    id: 5,
    rating: 5,
    text: "Amazing service from start to finish. The book arrived quickly and the quality is outstanding. Our little one is fascinated by it!",
    name: "Rachel Green",
    location: "HAIFA",
  },
  {
    id: 6,
    rating: 4,
    text: "Beautiful personalized book. The AI processing did a great job with our family photos. Very happy with the purchase!",
    name: "Michael Brown",
    location: "BEER SHEVA",
  },
  {
    id: 7,
    rating: 5,
    text: "This is such a thoughtful and unique product. Our baby recognizes the faces and gets so excited. Worth every penny!",
    name: "Emily White",
    location: "NETANYA",
  },
  {
    id: 8,
    rating: 5,
    text: "The book is beautifully made and the concept is brilliant. Our baby loves tummy time with this book. Thank you!",
    name: "James Miller",
    location: "ASHKELON",
  },
  {
    id: 9,
    rating: 4,
    text: "Great quality and fast shipping. The book is a perfect keepsake for this special time in our baby's life.",
    name: "Lisa Anderson",
    location: "EILAT",
  },
  {
    id: 10,
    rating: 5,
    text: "Absolutely love this book! The dual design is perfect for different stages. Our baby is captivated by the familiar faces.",
    name: "Robert Taylor",
    location: "RAANANA",
  },
];

const easeOwlet: any = [0.16, 1, 0.3, 1];

export function ReviewsSection() {
  const prefersReducedMotion = useReducedMotion();
  const { t, locale } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setTouchStart(0);
      setTouchEnd(0);
      return;
    }
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextReview();
    }
    if (isRightSwipe) {
      prevReview();
    }
    
    // Reset touch values
    setTouchStart(0);
    setTouchEnd(0);
  };

  const nextReview = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % mockReviews.length);
  };

  const prevReview = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + mockReviews.length) % mockReviews.length);
  };

  const goToReview = (index: number) => {
    // Determine direction based on whether we're going forward or backward
    const newDirection = index > currentIndex ? "right" : "left";
    setDirection(newDirection);
    setCurrentIndex(index);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${
          i < rating ? "fill-[#E16854]" : "fill-none stroke-[#E16854]"
        }`}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={i < rating ? 0 : 1.5}
          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
        />
      </svg>
    ));
  };

  return (
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
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center mb-12">
          <Title
            highlightText={t("home.reviews.titleHighlight")}
            size="lg"
            className="mb-4"
          >
            {t("home.reviews.title")}
          </Title>
        </div>

        {/* Mobile: Scrollable Carousel */}
        {isMobile ? (
          <div className="md:hidden w-full">
            <div
              className="relative overflow-hidden w-full"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{
                  width: `${mockReviews.length * 100}%`,
                  transform: `translateX(calc(-${currentIndex} * (100% / ${mockReviews.length})))`,
                }}
              >
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex-shrink-0"
                    style={{
                      width: `calc(100% / ${mockReviews.length})`,
                    }}
                  >
                    <div className="px-4">
                      <div className="bg-white rounded-2xl p-6 shadow-sm relative">
                      {/* Stars */}
                      <div className="flex gap-1 mb-3">
                        {renderStars(review.rating)}
                      </div>

                      {/* Review Text */}
                      <p className="text-sm font-body text-dark-gray mb-4 leading-relaxed">
                        {review.text}
                      </p>

                      {/* Name and Location */}
                      <div className="text-sm font-body text-dark-gray">
                        <span className="font-body-bold">{review.name}</span>
                        {" - "}
                        <span>{review.location}</span>
                      </div>

                      {/* Decorative Quotation Marks */}
                      <div
                        className="absolute bottom-4 right-4 text-[#E16854] opacity-20"
                        style={{ fontSize: "4rem", lineHeight: 1 }}
                      >
                        "
                      </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {mockReviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToReview(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex
                      ? "bg-[#E16854] w-6"
                      : "bg-gray-300"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Desktop: Carousel with Multiple Cards Visible */
          <div className="hidden md:block max-w-6xl mx-auto">
            <div className="relative">
              {/* Navigation Arrows - on the edges */}
              <button
                onClick={prevReview}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-16 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-6 h-6 text-dark-gray" />
              </button>

              <button
                onClick={nextReview}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                aria-label="Next review"
              >
                <ChevronRight className="w-6 h-6 text-dark-gray" />
              </button>

              {/* Carousel Container with centered card and partial adjacent cards */}
              <div className="relative overflow-hidden px-12">
                <div className="flex items-center justify-center">
                  {/* Previous Card (partially visible) */}
                  <div className="w-[30%] flex-shrink-0 pr-4">
                    <motion.div
                      className="bg-white rounded-2xl p-6 shadow-sm relative opacity-60 scale-95 cursor-pointer"
                      onClick={prevReview}
                      whileHover={{ opacity: 0.8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-1 mb-3">
                        {renderStars(
                          mockReviews[
                            (currentIndex - 1 + mockReviews.length) %
                              mockReviews.length
                          ].rating
                        )}
                      </div>
                      <p className="text-sm font-body text-dark-gray mb-4 leading-relaxed line-clamp-3">
                        {
                          mockReviews[
                            (currentIndex - 1 + mockReviews.length) %
                              mockReviews.length
                          ].text
                        }
                      </p>
                      <div className="text-sm font-body text-dark-gray">
                        <span className="font-body-bold">
                          {
                            mockReviews[
                              (currentIndex - 1 + mockReviews.length) %
                                mockReviews.length
                            ].name
                          }
                        </span>
                        {" - "}
                        <span>
                          {
                            mockReviews[
                              (currentIndex - 1 + mockReviews.length) %
                                mockReviews.length
                            ].location
                          }
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Active Card (centered, fully visible) */}
                  <div className="w-[40%] flex-shrink-0 px-4 relative overflow-hidden">
                    <motion.div
                      className="bg-white rounded-2xl p-8 shadow-sm relative cursor-pointer"
                      onClick={() => {
                        // Allow clicking on the card to go to next
                        nextReview();
                      }}
                      whileHover={{ scale: 1.02, y: -2 }}
                    >
                      {/* Stars */}
                      <div className="flex gap-1 mb-4">
                        {renderStars(mockReviews[currentIndex].rating)}
                      </div>

                      {/* Review Text */}
                      <p className="text-base font-body text-dark-gray mb-6 leading-relaxed">
                        {mockReviews[currentIndex].text}
                      </p>

                      {/* Name and Location */}
                      <div className="text-base font-body text-dark-gray">
                        <span className="font-body-bold">
                          {mockReviews[currentIndex].name}
                        </span>
                        {" - "}
                        <span>{mockReviews[currentIndex].location}</span>
                      </div>

                      {/* Decorative Quotation Marks */}
                      <div
                        className="absolute bottom-6 right-6 text-[#E16854] opacity-20"
                        style={{ fontSize: "5rem", lineHeight: 1 }}
                      >
                        "
                      </div>
                    </motion.div>
                  </div>

                  {/* Next Card (partially visible) */}
                  <div className="w-[30%] flex-shrink-0 pl-4">
                    <motion.div
                      className="bg-white rounded-2xl p-6 shadow-sm relative opacity-60 scale-95 cursor-pointer"
                      onClick={nextReview}
                      whileHover={{ opacity: 0.8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex gap-1 mb-3">
                        {renderStars(
                          mockReviews[(currentIndex + 1) % mockReviews.length]
                            .rating
                        )}
                      </div>
                      <p className="text-sm font-body text-dark-gray mb-4 leading-relaxed line-clamp-3">
                        {
                          mockReviews[(currentIndex + 1) % mockReviews.length]
                            .text
                        }
                      </p>
                      <div className="text-sm font-body text-dark-gray">
                        <span className="font-body-bold">
                          {
                            mockReviews[(currentIndex + 1) % mockReviews.length]
                              .name
                          }
                        </span>
                        {" - "}
                        <span>
                          {
                            mockReviews[(currentIndex + 1) % mockReviews.length]
                              .location
                          }
                        </span>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Desktop Navigation Dots - below the carousel */}
              <div className="flex justify-center gap-2 mt-8">
                {mockReviews.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToReview(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 cursor-pointer ${
                      index === currentIndex
                        ? "bg-[#E16854]"
                        : "bg-gray-300 hover:bg-[#E16854]/50"
                    }`}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.section>
  );
}
