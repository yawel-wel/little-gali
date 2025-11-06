"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { UploadModal } from "@/components/upload-modal";
import { Upload, Info, X } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUploadImages } from "@/lib/UploadImagesContext";

export default function UploadPage() {
  const router = useRouter();
  const { images, setImages, clearImages } = useUploadImages();
  const [showModal, setShowModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [isFromUploadButton, setIsFromUploadButton] = useState(true);
  const [selectedImagesCount, setSelectedImagesCount] = useState(images.length);
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
      const newImages = [...images, ...imageUrls];

      // Only keep first 5 images
      const limitedImages = newImages.slice(0, 5);

      // Revoke URLs for images beyond the 5th if any
      if (newImages.length > 5) {
        newImages.slice(5).forEach((url) => URL.revokeObjectURL(url));
      }

      setImages(limitedImages);
      setSelectedImagesCount(limitedImages.length);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(images[index]);
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setSelectedImagesCount(newImages.length);
  };

  const handleStartOver = () => {
    // Revoke all URLs
    images.forEach((url) => URL.revokeObjectURL(url));
    clearImages();
    setSelectedImagesCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleNavigateToPreview = async () => {
    router.push("/preview");
  };

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main className="flex-1">
        <section
          className="relative py-10 lg:py-16 pt-20 md:pt-16"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-visible pt-16 md:pt-16">
            <div className="max-w-3xl mx-auto space-y-8 overflow-visible">
              {/* Main Title */}
              <div className="text-center md:mt-4">
                <Title
                  highlightText="אישי"
                  size="xl"
                  roundedUnderline
                  className="text-2xl md:text-4xl font-bold"
                >
                  בואו ניצור לתינוק שלכם ספרון אישי
                </Title>
              </div>

              {/* First Paragraph */}
              <div className="text-center mb-8">
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
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex flex-nowrap justify-center gap-1 md:gap-4 w-full max-w-none mx-auto px-6 overflow-visible">
                    {images.slice(0, 5).map((url, index) => (
                      <div
                        key={index}
                        className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px] flex-shrink-0 mx-auto"
                      >
                        <img
                          src={url}
                          alt={`Selected ${index + 1}`}
                          className="w-full h-full object-cover border-2 border-primary-orange rounded-lg"
                        />
                        <button
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 hover:opacity-90 text-white rounded-full p-1 shadow-lg transition-all z-10 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  {selectedImagesCount >= 5 && (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full sm:w-auto">
                      <button
                        onClick={handleNavigateToPreview}
                        className="w-full bg-primary-orange hover:bg-primary-orange/90 hover:opacity-90 text-white font-body-bold text-lg py-3 sm:py-4 rounded-xl transition-opacity shadow-md hover:shadow-lg cursor-pointer relative z-10"
                        style={{ touchAction: "manipulation" }}
                      >
                        המשך
                      </button>
                      <button
                        onClick={handleStartOver}
                        className="w-full bg-white hover:bg-gray-50 text-dark-gray font-body-bold text-base py-3 sm:py-4 rounded-xl border border-gray-300 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        style={{ touchAction: "manipulation" }}
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
                      className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-primary-orange transition-all duration-200 cursor-pointer"
                      onClick={handleUploadClick}
                    >
                      <Upload className="w-10 h-10 md:w-12 md:h-12 text-primary-orange" />
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

      <Footer />
    </div>
  );
}
