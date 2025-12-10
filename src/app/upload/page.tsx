"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { UploadModal } from "@/components/upload-modal";
import { StyleSelector, StyleType } from "@/components/style-selector";
import { Upload, Info, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUploadImages } from "@/lib/UploadImagesContext";
import { useCart } from "@/lib/CartContext";
import { compressImage } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";

function UploadPageContent() {
  const router = useRouter();
  const { images: contextImages, setImages, clearImages } = useUploadImages();
  const { addToCart, removeFromCart, cart } = useCart();

  // Always use context images directly - we'll clear them on mount
  const images = contextImages;
  const { t, locale } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [isFromUploadButton, setIsFromUploadButton] = useState(true);
  const [selectedImagesCount, setSelectedImagesCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("cartoon");
  const selectedStyleRef = useRef<StyleType>("cartoon");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Store Cloudinary URLs separately - don't update display, only use for cart
  const cloudinaryUrls = useRef<Map<number, string>>(new Map()); // Maps index -> Cloudinary URL

  // Keep ref in sync with state
  useEffect(() => {
    selectedStyleRef.current = selectedStyle;
  }, [selectedStyle]);

  // Reset everything when component mounts - always start fresh
  useEffect(() => {
    // Revoke any existing blob URLs to prevent memory leaks
    contextImages.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    // Clear images from context
    clearImages();
    setImages([]);

    // Reset all local state
    setUploadingImages(new Set());
    setSelectedImagesCount(0);
    setSelectedStyle("cartoon");
    selectedStyleRef.current = "cartoon";
    setHasSeenModal(false);
    setSubmitStatus({ type: null, message: "" });
    setIsSubmitting(false);
    cloudinaryUrls.current.clear(); // Clear Cloudinary URLs map

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []); // Only run on mount

  // Sync selectedImagesCount with images.length
  useEffect(() => {
    setSelectedImagesCount(images.length);
  }, [images.length]);

  // Preload modal images when component mounts to improve modal open performance
  useEffect(() => {
    const modalImages = [
      "/too-close-example.jpg",
      "/group-example.jpeg",
      "/good-example-1.jpg",
      "/good-example-2.jpg",
    ];

    // Preload all images and wait for them to fully load
    Promise.all(
      modalImages.map((src) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve(); // Resolve even on error to not block
          img.src = src;
        });
      })
    ).then(() => {
      console.log("Modal images preloaded");
    });
  }, []);

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

  const handleModalUploadClick = useCallback(() => {
    // Use setTimeout to ensure this runs after any state updates from modal close
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 0);
  }, []);

  // Upload a single image to Cloudinary
  const uploadSingleImage = async (
    blobUrl: string,
    index: number
  ): Promise<string> => {
    try {
      // Compress the image (using optimized defaults from utils)
      const compressedFile = await compressImage(blobUrl);

      // Upload to Cloudinary
      const uploadFormData = new FormData();
      uploadFormData.append("images", compressedFile);

      const uploadResponse = await fetch("/api/upload-images", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        throw new Error(uploadError.error || "Failed to upload image");
      }

      const uploadData = await uploadResponse.json();
      if (
        !uploadData.imageUrls ||
        !Array.isArray(uploadData.imageUrls) ||
        uploadData.imageUrls.length === 0
      ) {
        throw new Error("Invalid response from upload API");
      }

      // Don't revoke blob URL here - revoke it after state update to prevent black image
      // URL.revokeObjectURL(blobUrl);

      return uploadData.imageUrls[0];
    } catch (error) {
      console.error("Error uploading image:", error);
      // Keep the blob URL if upload fails so user can retry
      throw error;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files) {
      // Filter only image files
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/")
      );

      // Create blob URLs for preview and add to existing images
      const blobUrls = imageFiles.map((file) => URL.createObjectURL(file));
      const newImages = [...images, ...blobUrls];

      // Only keep first 5 images
      const limitedImages = newImages.slice(0, 5);

      // Revoke URLs for images beyond the 5th if any
      if (newImages.length > 5) {
        newImages.slice(5).forEach((url) => URL.revokeObjectURL(url));
      }

      // Update images with blob URLs for immediate preview
      // Don't upload yet - wait until user clicks "Add to Cart"
      setImages(limitedImages);
      setSelectedImagesCount(limitedImages.length);
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the URL to prevent memory leaks (only for blob URLs)
    if (images[index] && images[index].startsWith("blob:")) {
      URL.revokeObjectURL(images[index]);
    }
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setSelectedImagesCount(newImages.length);
    // Remove Cloudinary URL from map and shift remaining indices
    cloudinaryUrls.current.delete(index);
    // Shift all Cloudinary URLs after this index down by 1
    const newCloudinaryUrls = new Map<number, string>();
    cloudinaryUrls.current.forEach((url, i) => {
      if (i < index) {
        newCloudinaryUrls.set(i, url);
      } else if (i > index) {
        newCloudinaryUrls.set(i - 1, url);
      }
    });
    cloudinaryUrls.current = newCloudinaryUrls;
  };

  const handleStartOver = () => {
    // Revoke all blob URLs (only blob URLs need to be revoked)
    images.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    clearImages();
    setSelectedImagesCount(0);
    setUploadingImages(new Set()); // Clear uploading state
    setSelectedStyle("cartoon"); // Reset to default style
    cloudinaryUrls.current.clear(); // Clear Cloudinary URLs map
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Validate images
      if (!images || images.length !== 5) {
        setSubmitStatus({
          type: "error",
          message: t("upload.selectExactly5"),
        });
        setIsSubmitting(false);
        return;
      }

      // Mark all images as uploading for UI feedback
      setUploadingImages(new Set([0, 1, 2, 3, 4]));

      // Upload all 5 images simultaneously to Cloudinary
      // Compress all images in parallel
      const compressedImages = await Promise.all(
        images.map((url) => compressImage(url))
      );

      // Upload all compressed images to Cloudinary simultaneously
      const uploadFormData = new FormData();
      compressedImages.forEach((file) => {
        uploadFormData.append("images", file);
      });

      const uploadResponse = await fetch("/api/upload-images", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const uploadError = await uploadResponse.json();
        setUploadingImages(new Set());
        throw new Error(uploadError.error || "Failed to upload images");
      }

      const uploadData = await uploadResponse.json();
      const imageUrls = uploadData.imageUrls;

      if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length !== 5) {
        setUploadingImages(new Set());
        throw new Error("Invalid response from upload API");
      }

      // Store Cloudinary URLs in the map for potential future use
      imageUrls.forEach((url, index) => {
        cloudinaryUrls.current.set(index, url);
      });

      // Clear uploading state
      setUploadingImages(new Set());

      // Validate all URLs are Cloudinary URLs
      const invalidUrls = imageUrls.filter(
        (url) =>
          !url || (!url.startsWith("http://") && !url.startsWith("https://"))
      );
      if (invalidUrls.length > 0) {
        console.error("Invalid URLs in imageUrls:", invalidUrls);
        throw new Error("Some images were not uploaded correctly");
      }

      console.log("Uploaded images, adding to cart:", imageUrls);
      // Mark optimistic adding to avoid empty-state flash
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("adding_to_cart", "1");
        }
      } catch {}

      // Fire-and-forget to enable optimistic navigation; cart page will reflect when ready
      // Use ref to ensure we get the current value, not a stale closure
      const styleToAdd = selectedStyleRef.current || selectedStyle || "cartoon";
      console.log(
        "Adding to cart - selectedStyle state:",
        selectedStyle,
        "selectedStyleRef.current:",
        selectedStyleRef.current,
        "styleToAdd:",
        styleToAdd
      );
      const addPromise = addToCart(
        imageUrls,
        1,
        undefined,
        undefined,
        styleToAdd
      );

      // Navigate immediately to cart (optimistic UX)
      router.push("/cart");

      // Optionally avoid unhandled rejection warnings
      addPromise.catch((e) => {
        console.error("Add to cart failed:", e);
      });

      // Don't clear images/state immediately - let navigation happen first
      // The images will be cleared when the component unmounts or on next visit
    } catch (error) {
      console.error("Submit error:", error);
      setUploadingImages(new Set()); // Clear uploading state on error
      setSubmitStatus({
        type: "error",
        message: t("upload.serverError"),
      });
      setIsSubmitting(false);
    }
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
                  highlightText={t("upload.titleHighlight")}
                  size="xl"
                  roundedUnderline
                  className="text-2xl md:text-4xl font-bold"
                >
                  {t("upload.title")}
                </Title>
              </div>

              {/* First Paragraph */}
              <div className="text-center mb-8">
                <p className="text-lg font-body text-dark-gray leading-relaxed text-center">
                  {t("upload.description")
                    .split("\n")
                    .map((line, i, arr) => (
                      <span key={i}>
                        {line}
                        {i < arr.length - 1 && <br />}
                      </span>
                    ))}
                </p>
              </div>

              {/* Image Selection Progress Indicator */}
              <div className="text-center">
                <div className="inline-block px-4 py-2 rounded-full bg-white border border-gray-200">
                  <span
                    className={`text-dark-gray font-body-bold text-md ${
                      locale === "en" ? "text-center" : "text-right"
                    }`}
                  >
                    <span className="text-primary-orange">
                      {selectedImagesCount}
                    </span>{" "}
                    {t("upload.imagesCount")}
                  </span>
                </div>
              </div>

              {/* Style Selector - Show when all 5 images are uploaded */}
              {selectedImagesCount === 5 && (
                <div className="flex justify-center mt-6 mb-6 -mx-4 sm:mx-0 px-4 sm:px-0">
                  <StyleSelector
                    selectedStyle={selectedStyle}
                    onStyleChange={setSelectedStyle}
                  />
                </div>
              )}

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
                    {images.slice(0, 5).map((url, index) => {
                      return (
                        <div
                          key={index}
                          className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px] flex-shrink-0 mx-auto"
                        >
                          <img
                            src={url}
                            alt={
                              locale === "en"
                                ? `Selected photo ${index + 1}`
                                : `תמונה נבחרת ${index + 1}`
                            }
                            className="w-full h-full object-cover border-2 border-primary-orange rounded-lg"
                            loading="eager"
                            decoding="async"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 hover:opacity-90 text-white rounded-full p-1 shadow-lg transition-all z-10 cursor-pointer"
                            disabled={isSubmitting}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  {selectedImagesCount >= 5 && (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full sm:w-auto">
                      <button
                        onClick={handleAddToCart}
                        disabled={isSubmitting}
                        className="w-full bg-primary-orange hover:bg-primary-orange/90 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body-bold text-lg py-3 sm:py-4 rounded-xl transition-opacity shadow-md hover:shadow-lg cursor-pointer relative z-10 flex items-center justify-center"
                        style={{ touchAction: "manipulation" }}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          t("upload.addToCart")
                        )}
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
                        {t("upload.startOver")}
                      </button>
                      {/* Status Message */}
                      {submitStatus.type && (
                        <div
                          className={`w-full p-4 rounded-lg text-center font-body-bold ${
                            submitStatus.type === "success"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}
                        >
                          {submitStatus.message}
                        </div>
                      )}
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
                        {t("upload.photoTip")}
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

export default function UploadPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen overflow-x-hidden flex items-center justify-center"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-primary-orange" />
        </div>
      }
    >
      <UploadPageContent />
    </Suspense>
  );
}
