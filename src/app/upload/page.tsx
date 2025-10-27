"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
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
                <Title highlightText="אישי" size="xl" roundedUnderline>
                  בואו ניצור לתינוק שלכם ספרון אישי
                </Title>
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

      <Footer />
    </div>
  );
}
