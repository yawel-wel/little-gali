"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { UploadModal } from "@/components/upload-modal";
import { StyleSelector, StyleType } from "@/components/style-selector";
import { Upload, Info, X, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { useRouter } from "next/navigation";
import { useUploadImages } from "@/lib/UploadImagesContext";
import { useCart } from "@/lib/CartContext";
import { compressImage } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import Button from "@mui/material/Button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── Mobile Image Editor ──────────────────────────────────────────────────────
// Uses react-easy-crop for pan/zoom, then crops the image via canvas on save.

// Crop the image to the pixel area described by `pixelCrop`
async function getCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob | null> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(
    img,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
}

type CropState = { crop: { x: number; y: number }; zoom: number };

function MobileImageEditor({
  imageUrl,
  initialCrop,
  initialZoom,
  onSave,
}: {
  imageUrl: string;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  onSave: (croppedUrl: string, cropState: CropState) => void;
}) {
  const { t } = useLanguage();
  const [crop, setCrop] = useState(initialCrop ?? { x: 0, y: 0 });
  const [zoom, setZoom] = useState(initialZoom ?? 1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  // Portrait ratio matching the thumbnail frames (72×84 ≈ 6:7)
  const aspect = 72 / 84;

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!croppedAreaPixels) return;
    const blob = await getCroppedBlob(imageUrl, croppedAreaPixels);
    if (blob) onSave(URL.createObjectURL(blob), { crop, zoom });
  }, [imageUrl, croppedAreaPixels, onSave, crop, zoom]);

  // Prevent body scroll while editor is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8"
      style={{ backgroundColor: "#F9F7EE" }}
    >
      {/* Cropper — constrained box so the full image is visible around the frame */}
      <div
        className="relative w-[85vw] md:w-[380px] flex-shrink-0"
        style={{ aspectRatio: "72 / 84" }}
      >
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          onInteractionStart={() => setIsInteracting(true)}
          onInteractionEnd={() => setIsInteracting(false)}
          style={{
            cropAreaStyle: { border: "3px solid rgba(255,255,255,0.85)" },
          }}
        />
      </div>

      {/* Text + button — always visible on mobile; fades on desktop while dragging/pinching */}
      <div
        className={`flex flex-col items-center gap-4 transition-opacity duration-200 ${isInteracting ? "md:opacity-0 md:pointer-events-none" : ""}`}
      >
        <p
          className="font-body text-center px-6"
          style={{ color: "#374151", fontSize: "1rem" }}
        >
          {t("upload.cropInstruction")}
        </p>
        <button
          onClick={handleSave}
          className="bg-primary-orange text-white font-body-bold rounded-xl px-10 py-3 text-lg"
        >
          {t("upload.cropDone")}
        </button>
      </div>
    </div>
  );
}

// ─── Sortable Image Item ──────────────────────────────────────────────────────

interface SortableImageItemProps {
  id: string;
  url: string;
  index: number;
  locale: string;
  onRemove: (index: number) => void;
  isSubmitting: boolean;
  onTap: (index: number) => void;
}

function SortableImageItem({
  id,
  url,
  index,
  locale,
  onRemove,
  isSubmitting,
  onTap,
}: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    animateLayoutChanges: () => false, // Disable layout animation on drop
  });

  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia("(min-width: 768px)").matches);
    };

    checkDesktop();
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    mediaQuery.addEventListener("change", checkDesktop);

    return () => mediaQuery.removeEventListener("change", checkDesktop);
  }, []);

  // Track whether a drag actually started so we can ignore click-after-drag
  const wasDragging = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDragging.current = true;
    }
  }, [isDragging]);

  useEffect(() => {
    if (!isDragging && wasDragging.current) {
      // Give the browser time to fire any synthetic click before resetting
      const t = setTimeout(() => {
        wasDragging.current = false;
      }, 400);
      return () => clearTimeout(t);
    }
  }, [isDragging]);

  const dragTransform = CSS.Transform.toString(transform);
  const isDraggingTransform =
    dragTransform &&
    dragTransform !== "none" &&
    dragTransform !== "translate3d(0, 0, 0)";

  const style = {
    transform: dragTransform,
    transition: "none", // Always disable transitions to prevent flicker on all items
    opacity: isDragging ? 0.5 : 1,
  };

  // 3D accordion book effect using rotateY - only on desktop
  // Alternate fold direction per index
  const isEven = index % 2 === 0;
  const foldAngle = isEven ? "-25deg" : "25deg";
  const origin = isEven ? "center left" : "center right";

  // Combine accordion rotation with drag transform
  // When dragging, only show drag transform; otherwise show accordion effect on desktop only
  // On mobile, show normal images without rotation
  const accordionTransform = `perspective(800px) rotateY(${foldAngle})`;
  const combinedTransform = isDraggingTransform
    ? dragTransform
    : isDesktop
      ? accordionTransform
      : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        transform: combinedTransform,
        transformOrigin: isDesktop ? origin : undefined,
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
        cursor: isDragging ? "grabbing" : "grab",
        touchAction: "none", // Prevent default touch behaviors on mobile
        WebkitTouchCallout: "none", // Prevent iOS callout menu
        WebkitUserSelect: "none", // Prevent text selection
        userSelect: "none",
        willChange: isDragging ? "transform" : "auto", // Optimize for dragging
      }}
      className="relative w-[72px] h-[84px] sm:w-[80px] sm:h-[93px] md:w-[120px] md:h-[140px] lg:w-[140px] lg:h-[163px] flex-shrink-0"
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!wasDragging.current) onTap(index);
      }}
    >
      <img
        src={url}
        alt={
          locale === "en"
            ? `Selected photo ${index + 1}`
            : `תמונה נבחרת ${index + 1}`
        }
        className="w-full h-full object-cover border-2 border-primary-orange rounded-lg pointer-events-none"
        loading="eager"
        decoding="async"
        draggable={false}
      />
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onRemove(index);
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
        onTouchStart={(e) => {
          e.stopPropagation();
        }}
        className="absolute -top-1 -left-1 bg-red-500 hover:bg-red-600 hover:opacity-90 text-white rounded-full p-1 shadow-lg transition-all z-10 cursor-pointer"
        disabled={isSubmitting}
        style={{ pointerEvents: "auto" }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── Upload Page ──────────────────────────────────────────────────────────────

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
    new Set(),
  );
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("cartoon");
  const selectedStyleRef = useRef<StyleType>("cartoon");
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Store Cloudinary URLs separately - don't update display, only use for cart
  const cloudinaryUrls = useRef<Map<number, string>>(new Map()); // Maps index -> Cloudinary URL
  // Keep the original (unedited) image URL per index so the full image is always
  // available when the user re-opens the crop editor.
  const originalUrls = useRef<Map<number, string>>(new Map());
  // Remember where the user left the crop (pan + zoom) so it's restored next time.
  const cropStates = useRef<Map<number, CropState>>(new Map());

  // Mobile image editor state
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(
    null,
  );

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
    cloudinaryUrls.current.clear();
    originalUrls.current.clear();
    cropStates.current.clear();

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []); // Only run on mount

  // Sync selectedImagesCount with images.length
  useEffect(() => {
    setSelectedImagesCount(images.length);
  }, [images.length]);

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
    index: number,
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
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files) {
      // Filter only image files
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
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

      // Record the original (uncropped) URL for each new image
      const startIndex = images.length;
      blobUrls.forEach((url, i) => {
        const idx = startIndex + i;
        if (idx < 5) originalUrls.current.set(idx, url);
      });

      // Update images with blob URLs for immediate preview
      // Don't upload yet - wait until user clicks "Add to Cart"
      setImages(limitedImages);
      setSelectedImagesCount(limitedImages.length);
    }
  };

  const handleRemoveImage = (index: number) => {
    const displayUrl = images[index];
    const origUrl = originalUrls.current.get(index);
    // Revoke original blob URL
    if (origUrl && origUrl.startsWith("blob:")) URL.revokeObjectURL(origUrl);
    // Revoke display URL only if it differs from the original (i.e. it's a crop blob)
    if (
      displayUrl &&
      displayUrl.startsWith("blob:") &&
      displayUrl !== origUrl
    ) {
      URL.revokeObjectURL(displayUrl);
    }

    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setSelectedImagesCount(newImages.length);

    // Helper to shift a Map<number,T> after removing `index`
    const shiftMap = <T,>(map: Map<number, T>) => {
      const next = new Map<number, T>();
      map.forEach((v, i) => {
        if (i < index) next.set(i, v);
        else if (i > index) next.set(i - 1, v);
      });
      return next;
    };

    cloudinaryUrls.current = shiftMap(cloudinaryUrls.current);
    originalUrls.current = shiftMap(originalUrls.current);
    cropStates.current = shiftMap(cropStates.current);
  };

  const handleStartOver = () => {
    // Revoke display blob URLs
    images.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    // Revoke original blob URLs that differ from display URLs
    originalUrls.current.forEach((origUrl, i) => {
      if (origUrl.startsWith("blob:") && origUrl !== images[i]) {
        URL.revokeObjectURL(origUrl);
      }
    });
    clearImages();
    setSelectedImagesCount(0);
    setUploadingImages(new Set());
    setSelectedStyle("cartoon");
    cloudinaryUrls.current.clear();
    originalUrls.current.clear();
    cropStates.current.clear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open the mobile editor for a specific image
  const handleImageTap = useCallback((index: number) => {
    setEditingImageIndex(index);
  }, []);

  // Save the cropped image back into the images array
  const handleSaveCrop = useCallback(
    (croppedUrl: string, cropState: CropState) => {
      if (editingImageIndex === null) return;
      const newImages = [...images];
      const oldDisplayUrl = newImages[editingImageIndex];
      const origUrl = originalUrls.current.get(editingImageIndex);
      // Only revoke the old display URL if it is NOT the original (originals are kept)
      if (oldDisplayUrl.startsWith("blob:") && oldDisplayUrl !== origUrl) {
        URL.revokeObjectURL(oldDisplayUrl);
      }
      newImages[editingImageIndex] = croppedUrl;
      setImages(newImages);
      cropStates.current.set(editingImageIndex, cropState);
      setEditingImageIndex(null);
    },
    [editingImageIndex, images, setImages],
  );

  // Drag and drop sensors
  // Use PointerSensor for mouse (with distance) and TouchSensor for touch (with delay)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts (for mouse)
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // 50ms delay on touch before drag starts (very short for responsiveness)
        tolerance: 15, // Allow 15px of movement during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle drag end to reorder images
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((_, i) => i.toString() === active.id);
      const newIndex = images.findIndex((_, i) => i.toString() === over.id);

      // Reorder images array
      const newImages = arrayMove(images, oldIndex, newIndex);
      setImages(newImages);

      // Reorder Cloudinary URLs map
      const newCloudinaryUrls = new Map<number, string>();
      const oldCloudinaryUrls = new Map(cloudinaryUrls.current);

      // Create a temporary array to track the reordering
      const tempUrls: (string | undefined)[] = Array(images.length);
      oldCloudinaryUrls.forEach((url, i) => {
        tempUrls[i] = url;
      });

      // Reorder the temp array
      const reorderedTemp = arrayMove(tempUrls, oldIndex, newIndex);

      // Rebuild the map with new indices
      reorderedTemp.forEach((url, i) => {
        if (url) {
          newCloudinaryUrls.set(i, url);
        }
      });

      cloudinaryUrls.current = newCloudinaryUrls;

      // Reorder originalUrls and cropStates the same way
      const reorderMap = <T,>(map: Map<number, T>) => {
        const tempArr: (T | undefined)[] = Array(images.length);
        map.forEach((v, i) => {
          tempArr[i] = v;
        });
        const reordered = arrayMove(tempArr, oldIndex, newIndex);
        const next = new Map<number, T>();
        reordered.forEach((v, i) => {
          if (v !== undefined) next.set(i, v);
        });
        return next;
      };
      originalUrls.current = reorderMap(originalUrls.current);
      cropStates.current = reorderMap(cropStates.current);
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
        images.map((url) => compressImage(url)),
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
          !url || (!url.startsWith("http://") && !url.startsWith("https://")),
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
        styleToAdd,
      );
      const addPromise = addToCart(
        imageUrls,
        1,
        undefined,
        undefined,
        styleToAdd,
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

      <main
        className="flex-1"
        style={{ paddingTop: "calc(72px + var(--banner-height, 0px))" }}
      >
        <section
          className="relative py-10 lg:py-16 pt-6 md:pt-6"
          style={{ backgroundColor: "#F3EEE8" }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 overflow-visible pt-0 md:pt-0">
            <div className="max-w-3xl mx-auto space-y-8 overflow-visible">
              {/* Main Title */}
              <div className="text-center md:mt-2">
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
              <div className="text-center mb-8 -mt-4">
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
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToHorizontalAxis]}
                  >
                    <SortableContext
                      items={images
                        .slice(0, 5)
                        .map((_, index) => index.toString())}
                      strategy={horizontalListSortingStrategy}
                    >
                      <div className="w-full overflow-x-auto md:overflow-visible">
                        <div
                          className="flex flex-nowrap justify-center gap-1 md:gap-2 w-full max-w-none mx-auto px-6 overflow-visible items-end pt-2"
                          style={{
                            perspective: "1000px",
                            transformStyle: "preserve-3d",
                          }}
                        >
                          {images.slice(0, 5).map((url, index) => (
                            <SortableImageItem
                              key={url} // Use URL as key to prevent re-renders on reorder
                              id={index.toString()}
                              url={url}
                              index={index}
                              locale={locale}
                              onRemove={handleRemoveImage}
                              isSubmitting={isSubmitting}
                              onTap={handleImageTap}
                            />
                          ))}
                        </div>
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Action Buttons */}
                  {selectedImagesCount >= 5 && (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full sm:w-auto">
                      <div
                        className="flex flex-col gap-1 text-sm font-body text-dark-gray text-center"
                        style={{ marginTop: "28px" }}
                      >
                        <p>{t("upload.tapToCrop")}</p>
                        <p>{t("upload.dragToReorder")}</p>
                      </div>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddToCart}
                        disabled={isSubmitting}
                        className="w-full cursor-pointer relative z-10 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          fontSize: "1rem",
                          fontWeight: 700,
                          py: { xs: 1.5, sm: 2 },
                          boxShadow: "none",
                          marginTop: "-8px",
                        }}
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          t("upload.addToCart")
                        )}
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={handleStartOver}
                        className="w-full cursor-pointer flex items-center justify-center gap-2"
                        sx={{
                          borderRadius: "12px",
                          textTransform: "none",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          py: { xs: 1.5, sm: 2 },
                          borderColor: "#D1D5DB",
                          color: "#374151",
                          backgroundColor: "#FFFFFF",
                          "&:hover": {
                            backgroundColor: "#F9FAFB",
                            borderColor: "#D1D5DB",
                          },
                        }}
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
                        <span className="font-body-bold text-base">
                          {t("upload.startOver")}
                        </span>
                      </Button>
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
                    <p className="mt-2 text-sm font-body text-dark-gray">
                      {t("upload.photoNote")}
                    </p>
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

      {/* Image crop editor – fullscreen overlay (mobile + desktop) */}
      {editingImageIndex !== null && (
        <MobileImageEditor
          imageUrl={
            originalUrls.current.get(editingImageIndex) ??
            images[editingImageIndex]
          }
          initialCrop={cropStates.current.get(editingImageIndex)?.crop}
          initialZoom={cropStates.current.get(editingImageIndex)?.zoom}
          onSave={handleSaveCrop}
        />
      )}

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
