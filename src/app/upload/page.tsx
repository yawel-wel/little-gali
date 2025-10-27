"use client";

import { Header } from "@/components/header";
import { UploadModal } from "@/components/upload-modal";
import { Upload, Info, X } from "lucide-react";
import { useState, useRef } from "react";

export default function UploadPage() {
  const [showModal, setShowModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [isFromUploadButton, setIsFromUploadButton] = useState(true);
  const [selectedImagesCount, setSelectedImagesCount] = useState(0);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    // Show modal only if it hasn't been seen before
    if (!hasSeenModal) {
      setIsFromUploadButton(true);
      setShowModal(true);
      setHasSeenModal(true);
    } else {
      // If modal was already seen, directly trigger file input
      fileInputRef.current?.click();
    }
  };

  const handleInfoClick = () => {
    // Always show when clicking on the info text
    setIsFromUploadButton(false);
    setShowModal(true);
    setHasSeenModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleModalUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      // Filter only image files
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      // Create URLs for preview and add to existing images
      const imageUrls = imageFiles.map((file) => URL.createObjectURL(file));
      const newImages = [...selectedImages, ...imageUrls];

      // Only keep first 5 images
      const limitedImages = newImages.slice(0, 5);

      // Revoke URLs for images beyond the 5th if any
      if (newImages.length > 5) {
        newImages.slice(5).forEach((url) => URL.revokeObjectURL(url));
      }

      setSelectedImages(limitedImages);
      setSelectedImagesCount(limitedImages.length);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(selectedImages[index]);
    const newImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setSelectedImagesCount(newImages.length);
  };

  const handleStartOver = () => {
    // Revoke all URLs
    selectedImages.forEach((url) => URL.revokeObjectURL(url));
    setSelectedImages([]);
    setSelectedImagesCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F3EEE8" }}>
      <Header />

      <main className="flex-1 pt-20">
        <section
          className="relative py-16 lg:py-24"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8">
              {/* Main Title */}
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-gray leading-tight">
                  בואו ניצור לתינוק שלכם ספרון{" "}
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
              </div>

              {/* First Paragraph */}
              <div className="text-center">
                <p className="text-lg font-body text-dark-gray leading-relaxed">
                  בחרו 5 תמונות שיופיעו בספרון.
                  <br />
                  אין צורך בתמונה מושלמת, אנחנו נדאג שהפנים, ההבעה והחום האנושי
                  שבתמונה יבואו לידי ביטוי.
                </p>
              </div>

              {/* Image Selection Progress Indicator */}
              <div className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-white border border-gray-200">
                  <span className="text-dark-gray font-body-bold text-md">
                    <span className="text-primary-orange">
                      {selectedImagesCount}
                    </span>{" "}
                    מתוך 5 תמונות
                  </span>
                </div>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Selected Images Display */}
              {selectedImages.length > 0 && (
                <div className="space-y-4">
                  {/* Images Scrollable Container */}
                  <div className="relative">
                    <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
                      {selectedImages.slice(0, 5).map((url, index) => (
                        <div
                          key={index}
                          className="relative flex-shrink-0 w-40 h-40 rounded-lg overflow-hidden border-2 border-primary-orange group"
                        >
                          <img
                            src={url}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-white"
                          >
                            <X className="w-4 h-4 text-white" strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Statement */}
                  <div className="flex items-start gap-3 text-dark-gray bg-white p-4 rounded-lg border border-gray-200">
                    <div className="w-6 h-6 rounded-full bg-primary-orange flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-body text-sm leading-relaxed">
                      התמונות ישמשו אך ורק ליצירת הספרון האישי שלכם ולא יפורסמו
                      או יישמרו לשום שימוש אחר
                    </p>
                  </div>

                  {/* Action Buttons */}
                  {selectedImagesCount >= 5 && (
                    <div className="flex flex-col gap-4">
                      <button className="w-full bg-primary-orange hover:bg-primary-orange/90 text-white font-body-bold text-lg py-4 rounded-xl transition-opacity">
                        המשך
                      </button>
                      <button
                        onClick={handleStartOver}
                        className="w-full bg-white hover:bg-gray-50 text-dark-gray font-body-bold text-base py-3 rounded-xl border border-gray-300 transition-colors flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        התחל מחדש
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Image Upload Area - Only show when less than 5 images */}
              {selectedImagesCount < 5 && (
                <>
                  <div className="text-center">
                    <div
                      className="w-48 h-48 mx-auto rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-primary-orange transition-all duration-200 cursor-pointer"
                      onClick={handleUploadClick}
                    >
                      <Upload className="w-12 h-12 text-primary-orange" />
                    </div>
                  </div>

                  {/* Image Upload Tip */}
                  <div className="text-center">
                    <div
                      className="inline-flex items-center gap-2 text-primary-orange cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={handleInfoClick}
                    >
                      <Info className="w-5 h-5" />
                      <span className="font-body-bold text-base">
                        איזו תמונה כדאי להעלות?
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      <UploadModal
        isOpen={showModal}
        onClose={handleCloseModal}
        showUploadButton={isFromUploadButton}
        onUploadClick={handleModalUploadClick}
      />

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
                <button className="cursor-pointer bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md font-body-bold text-sm transition-all duration-200">
                  צרו איתנו קשר
                </button>
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
