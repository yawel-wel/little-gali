"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { UploadModal } from "@/components/upload-modal";
import { Upload, Info, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUploadImages } from "@/lib/UploadImagesContext";
import { useCart } from "@/lib/CartContext";
import { compressImage } from "@/lib/utils";

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewFlow = searchParams.get("new") === "1";
  const { images, setImages, clearImages } = useUploadImages();
  const { addToCart, removeFromCart, cart } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [hasSeenModal, setHasSeenModal] = useState(false);
  const [isFromUploadButton, setIsFromUploadButton] = useState(true);
  const [selectedImagesCount, setSelectedImagesCount] = useState(images.length);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [originalEditImageUrls, setOriginalEditImageUrls] = useState<string[]>(
    []
  );
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if editing a cart item on page load
  useEffect(() => {
    // If explicitly starting a new book flow, ensure everything is cleared and skip edit detection
    if (isNewFlow) {
      setIsEditing(false);
      setEditingLineId(null);
      setOriginalEditImageUrls([]);
      images.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      clearImages();
      setSelectedImagesCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setHasSeenModal(false);
      setSubmitStatus({ type: null, message: "" });
      // Also make sure any stale edit intent is cleared
      localStorage.removeItem("editing_cart_item");
      return;
    }

    // Read and immediately clear editing item from localStorage
    // This ensures it doesn't persist across page navigations
    const editingItem = localStorage.getItem("editing_cart_item");
    localStorage.removeItem("editing_cart_item");

    if (editingItem) {
      // We're editing - load the images from the cart item
      try {
        const itemData = JSON.parse(editingItem);

        if (itemData.imageUrls && itemData.imageUrls.length > 0) {
          // Clear images immediately to prevent flashing
          clearImages();
          setSelectedImagesCount(0);

          // Set editing state
          setIsEditing(true);
          setEditingLineId(itemData.lineId);
          // Store original image URLs for matching later
          setOriginalEditImageUrls(itemData.imageUrls);

          // Set images from cart item (these are Cloudinary URLs, not blob URLs)
          // Use setTimeout to ensure clearImages has completed
          setTimeout(() => {
            setImages(itemData.imageUrls);
            setSelectedImagesCount(itemData.imageUrls.length);
          }, 0);
        } else {
          // No imageUrls found - clear editing state
          setIsEditing(false);
          setEditingLineId(null);
          clearImages();
          setSelectedImagesCount(0);
        }
      } catch (error) {
        console.error("Error parsing editing cart item:", error);
        // Clear invalid editing state
        setIsEditing(false);
        setEditingLineId(null);
        // Clear images if error
        clearImages();
        setSelectedImagesCount(0);
      }
    } else {
      // Not editing - check if existing images are Cloudinary URLs (from previous edit)
      // If so, we might be in edit mode but localStorage was cleared
      const hasCloudinaryUrls =
        images.length > 0 &&
        images.some(
          (url) => url.startsWith("http://") || url.startsWith("https://")
        );

      if (hasCloudinaryUrls && images.length === 5) {
        // Likely editing - preserve images and set edit mode
        // At least one image is a Cloudinary URL, suggesting we're editing
        setIsEditing(true);
        // Store original image URLs for matching later
        setOriginalEditImageUrls(
          images.filter(
            (url) => url.startsWith("http://") || url.startsWith("https://")
          )
        );
        setSelectedImagesCount(images.length);
      } else {
        // Not editing - clear images as usual
        setIsEditing(false);
        setEditingLineId(null);
        images.forEach((url) => {
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
        });
        clearImages();
        setSelectedImagesCount(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }

    // Reset modal state
    setHasSeenModal(false);
    setSubmitStatus({ type: null, message: "" });
  }, []); // Only run on mount

  // Maintain edit mode when images change - if we're editing and have 5 images, stay in edit mode
  useEffect(() => {
    if (isNewFlow) {
      return;
    }
    // If we're already in edit mode, keep it that way as long as we have 5 images
    if (isEditing && images.length === 5) {
      // Stay in edit mode
      return;
    }

    // If we're not in edit mode but have 5 images with at least one Cloudinary URL, set edit mode
    if (!isEditing && images.length === 5) {
      const hasCloudinaryUrls = images.some(
        (url) => url.startsWith("http://") || url.startsWith("https://")
      );
      if (hasCloudinaryUrls) {
        setIsEditing(true);
      }
    }
  }, [images, isEditing]);

  const handleUploadClick = () => {
    // Don't show modal if in edit mode
    if (isEditing) {
      fileInputRef.current?.click();
      return;
    }

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

  // Upload a single image to Cloudinary
  const uploadSingleImage = async (
    blobUrl: string,
    index: number
  ): Promise<string> => {
    try {
      // Compress the image
      const compressedFile = await compressImage(blobUrl, 1920, 1920, 0.85);

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

      // Revoke the blob URL to free memory
      URL.revokeObjectURL(blobUrl);

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
      setImages(limitedImages);
      setSelectedImagesCount(limitedImages.length);

      // Upload new images immediately (only blob URLs that are newly added)
      // Find which images are new blob URLs and need uploading
      limitedImages.forEach(async (url, index) => {
        // Only upload if it's a blob URL (newly added) and not already a Cloudinary URL
        if (url.startsWith("blob:")) {
          // Mark as uploading
          setUploadingImages((prev) => new Set(prev).add(index));

          try {
            const cloudinaryUrl = await uploadSingleImage(url, index);

            // Update the images array with Cloudinary URL
            setImages((prevImages) => {
              const updated = [...prevImages];
              // Make sure the index is still valid and the URL at that index is still the same blob URL
              if (index < updated.length && updated[index] === url) {
                updated[index] = cloudinaryUrl;
              }
              return updated;
            });
          } catch (error) {
            console.error(`Failed to upload image at index ${index}:`, error);
            // Keep the blob URL on error - user can still proceed
          } finally {
            // Remove from uploading set
            setUploadingImages((prev) => {
              const newSet = new Set(prev);
              newSet.delete(index);
              return newSet;
            });
          }
        }
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    // Don't allow removal while uploading
    if (uploadingImages.has(index)) {
      return;
    }
    // Revoke the URL to prevent memory leaks (only for blob URLs)
    if (images[index] && images[index].startsWith("blob:")) {
      URL.revokeObjectURL(images[index]);
    }
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setSelectedImagesCount(newImages.length);
    // Remove from uploading set if it was there
    setUploadingImages((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    // Clear editing state if starting over
    localStorage.removeItem("editing_cart_item");
  };

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      // Validate images
      if (!images || images.length !== 5) {
        setSubmitStatus({
          type: "error",
          message: "אנא בחר בדיוק 5 תמונות",
        });
        setIsSubmitting(false);
        return;
      }

      // Check if any images are still uploading
      if (uploadingImages.size > 0) {
        setSubmitStatus({
          type: "error",
          message: "אנא המתן עד שהתמונות יסיימו להעלות",
        });
        setIsSubmitting(false);
        return;
      }

      // Limit to first 5 images and create a snapshot to avoid stale references
      const limitedImages = [...images.slice(0, 5)];

      // Check for any remaining blob URLs that haven't been uploaded yet
      const blobUrls = limitedImages.filter(
        (url) => !url.startsWith("http://") && !url.startsWith("https://")
      );

      let imageUrls: string[];

      if (blobUrls.length === 0) {
        // All images are already Cloudinary URLs, use them directly
        imageUrls = [...limitedImages];
      } else {
        // Some images are still blob URLs - upload them now
        // This should rarely happen, but handle it as a fallback
        console.log("Uploading remaining blob URLs:", blobUrls);
        const compressedImages = await Promise.all(
          blobUrls.map((url) => compressImage(url, 1920, 1920, 0.85))
        );

        // Upload compressed images to Cloudinary
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
          throw new Error(uploadError.error || "Failed to upload images");
        }

        const uploadData = await uploadResponse.json();
        const newCloudinaryUrls = uploadData.imageUrls;
        console.log("Received Cloudinary URLs:", newCloudinaryUrls);

        // Combine existing Cloudinary URLs with newly uploaded ones
        // Reconstruct the array maintaining the exact order
        let cloudinaryIndex = 0;
        imageUrls = limitedImages.map((url) => {
          if (url.startsWith("http://") || url.startsWith("https://")) {
            // Keep existing Cloudinary URL
            return url;
          } else {
            // Replace blob URL with corresponding Cloudinary URL
            if (cloudinaryIndex >= newCloudinaryUrls.length) {
              throw new Error("Failed to map uploaded image URL");
            }
            const cloudinaryUrl = newCloudinaryUrls[cloudinaryIndex];
            cloudinaryIndex++;
            // Revoke blob URL
            URL.revokeObjectURL(url);
            return cloudinaryUrl;
          }
        });
      }

      // Validate that we have exactly 5 Cloudinary URLs
      if (imageUrls.length !== 5) {
        console.error("Invalid imageUrls length:", imageUrls.length);
        throw new Error("Failed to prepare images for cart");
      }

      // Validate all URLs are Cloudinary URLs
      const invalidUrls = imageUrls.filter(
        (url) => !url.startsWith("http://") && !url.startsWith("https://")
      );
      if (invalidUrls.length > 0) {
        console.error("Invalid URLs in final imageUrls:", invalidUrls);
        throw new Error("Some images were not uploaded correctly");
      }

      console.log("Final imageUrls to add to cart:", imageUrls);

      // If editing, find and remove the old item first
      let lineIdToRemove = editingLineId;

      if (isEditing && !lineIdToRemove) {
        // We're editing but don't have the lineId - find it by matching original images
        if (cart?.id && originalEditImageUrls.length > 0) {
          try {
            // Fetch cart to get latest data
            const response = await fetch("/api/shopify/cart/get", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ cartId: cart.id }),
            });

            if (response.ok) {
              const data = await response.json();
              const cartData = data.cart;

              // Find the cart item that matches our original images
              if (cartData?.lines) {
                const matchingItem = cartData.lines.find((line: any) => {
                  if (!line.imageUrls || line.imageUrls.length === 0)
                    return false;
                  // Check if at least 3 original images match
                  const matchingUrls = line.imageUrls.filter((url: string) =>
                    originalEditImageUrls.some((imgUrl) => {
                      // Compare URLs (might have query params, so compare base URL)
                      const baseUrl1 = url.split("?")[0];
                      const baseUrl2 = imgUrl.split("?")[0];
                      return baseUrl1 === baseUrl2;
                    })
                  );
                  return matchingUrls.length >= 3;
                });

                if (matchingItem) {
                  lineIdToRemove = matchingItem.id;
                  console.log(
                    "Found matching item to remove:",
                    matchingItem.id
                  );
                } else {
                  console.log(
                    "No matching item found. Original URLs:",
                    originalEditImageUrls
                  );
                  console.log(
                    "Cart items:",
                    cartData.lines.map((l: any) => ({
                      id: l.id,
                      imageUrls: l.imageUrls,
                    }))
                  );
                }
              }
            }
          } catch (error) {
            console.error("Error fetching cart to find item:", error);
          }
        } else {
          console.log(
            "Cannot find item: cart?.id =",
            cart?.id,
            "originalEditImageUrls.length =",
            originalEditImageUrls.length
          );
        }
      }

      if (isEditing && lineIdToRemove) {
        console.log("Removing item with lineId:", lineIdToRemove);
        await removeFromCart([lineIdToRemove]);
        // Wait a moment to ensure removal is complete before adding new item
        await new Promise((resolve) => setTimeout(resolve, 100));
      } else if (isEditing && !lineIdToRemove) {
        console.warn(
          "Editing but no lineId found - will create new item instead of updating"
        );
      }

      // Verify imageUrls before adding to cart
      console.log("About to add to cart with imageUrls:", imageUrls);
      if (!imageUrls || imageUrls.length !== 5) {
        throw new Error("Invalid imageUrls array before adding to cart");
      }
      const allValidUrls = imageUrls.every(
        (url) =>
          url && (url.startsWith("http://") || url.startsWith("https://"))
      );
      if (!allValidUrls) {
        console.error("Invalid URLs in imageUrls:", imageUrls);
        throw new Error("Some image URLs are invalid before adding to cart");
      }

      // Add to cart - create a copy to ensure we're using the correct array
      const imageUrlsToAdd = [...imageUrls];
      console.log("Adding to cart with imageUrlsToAdd:", imageUrlsToAdd);
      // Mark optimistic adding to avoid empty-state flash
      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("adding_to_cart", "1");
        }
      } catch {}

      // Set navigating flag to prevent empty state flash
      setIsNavigating(true);

      // Fire-and-forget to enable optimistic navigation; cart page will reflect when ready
      const addPromise = addToCart(imageUrlsToAdd, 1);

      // Navigate immediately to cart (optimistic UX)
      router.push("/cart");

      // Optionally avoid unhandled rejection warnings
      addPromise.catch((e) => {
        console.error("Add to cart failed:", e);
        setIsNavigating(false);
      });

      // Don't clear images/state immediately - let navigation happen first
      // The images will be cleared when the component unmounts or on next visit
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus({
        type: "error",
        message: "שגיאה בשרת. אנא נסה שוב מאוחר יותר.",
      });
      setIsSubmitting(false);
      setIsNavigating(false);
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
                    {images.slice(0, 5).map((url, index) => {
                      const isUploading = uploadingImages.has(index);
                      const isCloudinaryUrl =
                        url.startsWith("http://") || url.startsWith("https://");
                      return (
                        <div
                          key={index}
                          className="relative w-[72px] h-[72px] sm:w-[80px] sm:h-[80px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px] flex-shrink-0 mx-auto"
                        >
                          <img
                            src={url}
                            alt={`Selected ${index + 1}`}
                            className={`w-full h-full object-cover border-2 rounded-lg transition-opacity ${
                              isUploading
                                ? "opacity-60 border-primary-orange/50"
                                : "border-primary-orange"
                            }`}
                          />
                          {/* Uploading indicator */}
                          {isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                              <Loader2 className="w-6 h-6 md:w-8 md:h-8 animate-spin text-primary-orange" />
                            </div>
                          )}
                          {/* Uploaded checkmark */}
                          {!isUploading && isCloudinaryUrl && (
                            <div className="absolute top-1 right-1 bg-green-500 rounded-full p-1 shadow-lg">
                              <svg
                                className="w-2 h-2 md:w-3 md:h-3 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          )}
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 hover:opacity-90 text-white rounded-full p-1 shadow-lg transition-all z-10 cursor-pointer"
                            disabled={isUploading}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action Buttons */}
                  {(selectedImagesCount >= 5 || isNavigating) && (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full sm:w-auto">
                      <button
                        onClick={handleAddToCart}
                        disabled={isSubmitting || uploadingImages.size > 0}
                        className="w-full bg-primary-orange hover:bg-primary-orange/90 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-body-bold text-lg py-3 sm:py-4 rounded-xl transition-opacity shadow-md hover:shadow-lg cursor-pointer relative z-10 flex items-center justify-center gap-2"
                        style={{ touchAction: "manipulation" }}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isEditing ? "מעדכן..." : "מוסיף לעגלה..."}
                          </>
                        ) : (
                          "הוסף לעגלה"
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
                        התחל מחדש
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

              {/* Image Upload Area - Only show when less than 5 images and not navigating */}
              {selectedImagesCount < 5 && !isNavigating && (
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
