"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { UploadModal } from "@/components/upload-modal";
import { StyleSelector, StyleType } from "@/components/style-selector";
import { Upload, Info, X, Loader2, RefreshCw, ImageIcon } from "lucide-react";
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

// ─── Feature flag ─────────────────────────────────────────────────────────────
const AI_PREVIEW_ENABLED =
  process.env.NEXT_PUBLIC_AI_PREVIEW_ENABLED === "true";

// ─── AI generation prompts ────────────────────────────────────────────────────
const STYLE_PROMPTS: Record<StyleType, string> = {
  cartoon: `Convert the given photo into a colored cartoon illustration on a white background.
Use vibrant pen strokes and keep the main subject's proportions and features accurate and recognizable.
Outline all shapes gently using colored or black lines.
Replace the background with clean white.
Avoid shadows, textures, gradients, or photographic details.
The result should look like it was drawn by hand with colored markers — playful, clean, and emotionally warm.`,
  pencil: `Convert the given photo into a colored pencil sketch illustration on a white background.
Use soft, pastel-like pencil strokes with light texture visible, but keep the main subject's proportions and features accurate and recognizable.
Outline all shapes gently using colored lines — no black outlines.
Replace the background with clean white.
Avoid harsh shadows, gradients, or photographic details.
The result should look like it was drawn by hand with colored pencils — playful, clean, and emotionally warm.
Do not fade the bottom part of the person into the background.`,
  watercolor: `Convert the given photo into an ink outlines with visible hand-drawn wobble, and vibrant watercolor-style fills with soft color bleeding on a white background.

Keep all proportions, facial features, and expressions accurate and recognizable.

Ensure the background is pure white and clean, with no shading or gradients.

Avoid photographic details or heavy shadows.

The result should look like a hand-painted watercolor character illustration - warm, vibrant, and full of charm.

Make sure to remove the background and replace it with white.`,
};

// ─── AI generation types ──────────────────────────────────────────────────────
type GenSlot = string | "loading" | "error" | null;
type GenType = "bw" | StyleType;

type GeneratedImages = {
  bw: GenSlot[];
  cartoon: GenSlot[];
  pencil: GenSlot[];
  watercolor: GenSlot[];
};

// ─── Helper: blob URL → base64 ────────────────────────────────────────────────
async function blobUrlToBase64(
  blobUrl: string
): Promise<{ base64: string; mimeType: string }> {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  const mimeType = blob.type || "image/jpeg";
  const base64 = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
  return { base64, mimeType };
}

// ─── Helper: upload single base64 image to Cloudinary ─────────────────────────
async function uploadBase64ToCloudinary(
  base64: string,
  mimeType: string
): Promise<string> {
  const res = await fetch("/api/upload-images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ base64, mimeType }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to upload image");
  }
  const data = await res.json();
  return data.imageUrls[0];
}

// ─── Skeleton loader component ────────────────────────────────────────────────
function ImageSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-gray-200 rounded-lg overflow-hidden ${className}`}
      style={{
        background:
          "linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s ease-in-out infinite",
      }}
    />
  );
}

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
  onCancel,
  onChangeImage,
  currentIndex,
  totalImages,
}: {
  imageUrl: string;
  initialCrop?: { x: number; y: number };
  initialZoom?: number;
  onSave: (croppedUrl: string, cropState: CropState) => void;
  onCancel: () => void;
  onChangeImage?: () => void;
  currentIndex?: number;
  totalImages?: number;
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
      {/* X button — top-right corner */}
      <button
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
        aria-label="ביטול חיתוך"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Progress indicator — top center */}
      {currentIndex !== undefined && totalImages !== undefined && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
          <span className="font-body-bold text-dark-gray text-lg">
            {currentIndex + 1}/{totalImages}
          </span>
        </div>
      )}

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
        <div className="flex flex-col gap-3 items-center">
          <button
            onClick={handleSave}
            className="bg-primary-orange text-white font-body-bold rounded-xl px-10 py-3 text-lg cursor-pointer lg:hover:opacity-85 transition-opacity"
          >
            {t("upload.cropDone")}
          </button>
          {onChangeImage && (
            <button
              onClick={onChangeImage}
              className="bg-white text-dark-gray font-body-bold rounded-xl px-8 py-2.5 text-base cursor-pointer lg:hover:bg-gray-50 transition-colors border-2 border-gray-300"
            >
              {t("upload.changeImage")}
            </button>
          )}
        </div>
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
  onSwitch?: (index: number) => void; // AI mode: replace X with switch button
}

function SortableImageItem({
  id,
  url,
  index,
  locale,
  onRemove,
  isSubmitting,
  onTap,
  onSwitch,
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

  // Preload style example images so they're ready when the style selector appears
  useEffect(() => {
    [
      "/style-example-cartoon.png",
      "/style-example-pencil.png",
      "/style-example-pencil2.png",
      "/style-example-watercolor.png",
    ].forEach((src) => {
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  // Track whether a drag actually started so we can ignore click-after-drag
  const wasDragging = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDragging.current = true;
    } else if (wasDragging.current) {
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

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
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
      {onSwitch ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onSwitch(index);
          }}
          onMouseDown={(e) => { e.stopPropagation(); }}
          onTouchStart={(e) => { e.stopPropagation(); }}
          className="absolute -top-1 -left-1 bg-white hover:bg-gray-100 text-dark-gray rounded-full p-1 shadow-lg transition-all z-10 cursor-pointer border border-gray-200"
          style={{ pointerEvents: "auto" }}
          title={locale === "en" ? "Switch image" : "החלף תמונה"}
        >
          <RefreshCw className="w-3 h-3" />
        </button>
      ) : (
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
      )}
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
  const [isFromUploadButton, setIsFromUploadButton] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set(),
  );
  const [selectedStyle, setSelectedStyle] = useState<StyleType | null>("pencil");
  const selectedStyleRef = useRef<StyleType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceImageInputRef = useRef<HTMLInputElement>(null);
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

  // Sequential cropping state
  const [pendingCropImages, setPendingCropImages] = useState<string[]>([]);
  const [currentCropIndex, setCurrentCropIndex] = useState<number>(0);
  const [isInCroppingFlow, setIsInCroppingFlow] = useState<boolean>(false);

  // ── AI Preview state ────────────────────────────────────────────────────────
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({
    bw: Array(5).fill(null),
    cartoon: Array(5).fill(null),
    pencil: Array(5).fill(null),
    watercolor: Array(5).fill(null),
  });
  const [imageErrors, setImageErrors] = useState<Map<string, string>>(
    new Map()
  );
  const [generationCount, setGenerationCount] = useState(0);
  // Input ref for "Switch Image" after generation
  const switchImageInputRef = useRef<HTMLInputElement>(null);
  const switchingSlotIndex = useRef<number | null>(null);
  // Whether any AI cart upload is in progress
  const [isCartUploading, setIsCartUploading] = useState(false);

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
    setSelectedStyle("pencil");
    selectedStyleRef.current = "pencil";
    setSubmitStatus({ type: null, message: "" });
    setIsSubmitting(false);
    cloudinaryUrls.current.clear();
    originalUrls.current.clear();
    cropStates.current.clear();
    setPendingCropImages([]);
    setCurrentCropIndex(0);
    setIsInCroppingFlow(false);
    setEditingImageIndex(null);
    // Reset AI state
    setGeneratedImages({
      bw: Array(5).fill(null),
      cartoon: Array(5).fill(null),
      pencil: Array(5).fill(null),
      watercolor: Array(5).fill(null),
    });
    setImageErrors(new Map());

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []); // Only run on mount

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInfoClick = () => {
    setIsFromUploadButton(false);
    setShowModal(true);
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
      // Filter only image files and limit to 5
      const imageFiles = Array.from(files).filter((file) =>
        file.type.startsWith("image/"),
      );

      // Calculate how many more images we can add
      const currentCount = images.length;
      const availableSlots = 5 - currentCount;
      
      if (availableSlots <= 0) {
        return; // Already have 5 images
      }

      // Take only as many as we have slots for
      const filesToProcess = imageFiles.slice(0, availableSlots);

      // Create blob URLs for the new images
      const blobUrls = filesToProcess.map((file) => URL.createObjectURL(file));

      // Store these URLs as pending for cropping
      setPendingCropImages(blobUrls);
      setCurrentCropIndex(0);
      setIsInCroppingFlow(true);

      // Auto-open the cropping modal for the first image
      setEditingImageIndex(-1); // Use -1 to indicate we're in the sequential flow
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
    // Revoke pending crop images
    pendingCropImages.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    
    clearImages();
    setUploadingImages(new Set());
    setSelectedStyle("pencil");
    selectedStyleRef.current = "pencil";
    cloudinaryUrls.current.clear();
    originalUrls.current.clear();
    cropStates.current.clear();
    setPendingCropImages([]);
    setCurrentCropIndex(0);
    setIsInCroppingFlow(false);
    setEditingImageIndex(null);
    setGeneratedImages({
      bw: Array(5).fill(null),
      cartoon: Array(5).fill(null),
      pencil: Array(5).fill(null),
      watercolor: Array(5).fill(null),
    });
    setImageErrors(new Map());

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Open the mobile editor for a specific image
  const handleImageTap = useCallback((index: number) => {
    setEditingImageIndex(index);
  }, []);

  // ── AI generation functions ──────────────────────────────────────────────────

  const generateSingleImage = useCallback(
    async (blobUrl: string, type: GenType, index: number) => {
      // Mark slot as loading
      setGeneratedImages((prev) => ({
        ...prev,
        [type]: prev[type].map((s: GenSlot, i: number) =>
          i === index ? "loading" : s
        ),
      }));
      setImageErrors((prev) => {
        const next = new Map(prev);
        next.delete(`${type}_${index}`);
        return next;
      });

      try {
        const { base64, mimeType } = await blobUrlToBase64(blobUrl);
        const body: Record<string, string> = {
          imageBase64: base64,
          imageMimeType: mimeType,
          aspectRatio: "1:1",
        };
        if (type !== "bw") body.prompt = STYLE_PROMPTS[type as StyleType];

        const res = await fetch("/api/nano-banana", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();

        if (data.current !== undefined) setGenerationCount(data.current);

        if (!res.ok || !data.success || !data.images?.[0]) {
          setGeneratedImages((prev) => ({
            ...prev,
            [type]: prev[type].map((s: GenSlot, i: number) =>
              i === index ? "error" : s
            ),
          }));
          setImageErrors((prev) => {
            const next = new Map(prev);
            next.set(
              `${type}_${index}`,
              data.error || (locale === "he" ? "שגיאה ביצירה" : "Generation failed")
            );
            return next;
          });
          return;
        }

        const img = data.images[0];
        const dataUrl = `data:${img.mimeType};base64,${img.base64Data}`;

        setGeneratedImages((prev) => ({
          ...prev,
          [type]: prev[type].map((s: GenSlot, i: number) =>
            i === index ? dataUrl : s
          ),
        }));
      } catch {
        setGeneratedImages((prev) => ({
          ...prev,
          [type]: prev[type].map((s: GenSlot, i: number) =>
            i === index ? "error" : s
          ),
        }));
        setImageErrors((prev) => {
          const next = new Map(prev);
          next.set(
            `${type}_${index}`,
            locale === "he" ? "שגיאת רשת. נסה שנית." : "Network error. Please try again."
          );
          return next;
        });
      }
    },
    [locale]
  );

  // Save the cropped image back into the images array
  const handleSaveCrop = useCallback(
    (croppedUrl: string, cropState: CropState) => {
      if (isInCroppingFlow) {
        // Sequential cropping flow: add the cropped image to the gallery
        const newImages = [...images, croppedUrl];
        setImages(newImages);
        
        const newIndex = images.length;
        // Store the original uncropped URL
        const originalUrl = pendingCropImages[currentCropIndex];
        originalUrls.current.set(newIndex, originalUrl);
        cropStates.current.set(newIndex, cropState);
        
        // Move to next image in queue
        if (currentCropIndex < pendingCropImages.length - 1) {
          setCurrentCropIndex(currentCropIndex + 1);
          // Keep modal open for next image
        } else {
          // Finished cropping all images - reset file input
          setPendingCropImages([]);
          setCurrentCropIndex(0);
          setIsInCroppingFlow(false);
          setEditingImageIndex(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      } else if (editingImageIndex !== null && editingImageIndex >= 0) {
        // Re-cropping existing image
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

        // In AI flow: after switching/re-cropping a slot, regenerate B&W for it
        if (AI_PREVIEW_ENABLED && switchingSlotIndex.current === editingImageIndex) {
          switchingSlotIndex.current = null;
          generateSingleImage(croppedUrl, "bw", editingImageIndex);
        }
      }
    },
    [isInCroppingFlow, currentCropIndex, pendingCropImages, images, editingImageIndex, setImages, generateSingleImage],
  );

  // Handle cancel/skip during cropping
  const handleCancelCrop = useCallback(() => {
    if (isInCroppingFlow) {
      // Skip this image - revoke its URL and move to next
      const skippedUrl = pendingCropImages[currentCropIndex];
      if (skippedUrl && skippedUrl.startsWith("blob:")) {
        URL.revokeObjectURL(skippedUrl);
      }
      
      // Move to next image in queue
      if (currentCropIndex < pendingCropImages.length - 1) {
        setCurrentCropIndex(currentCropIndex + 1);
        // Keep modal open for next image
      } else {
        // Finished with all images - reset file input
        setPendingCropImages([]);
        setCurrentCropIndex(0);
        setIsInCroppingFlow(false);
        setEditingImageIndex(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } else {
      // Just close the modal when re-editing
      setEditingImageIndex(null);
    }
  }, [isInCroppingFlow, currentCropIndex, pendingCropImages]);

  // Handle replacing current image during cropping
  const handleChangeImage = useCallback(() => {
    if (isInCroppingFlow && replaceImageInputRef.current) {
      replaceImageInputRef.current.click();
    }
  }, [isInCroppingFlow]);

  // Handle file selection for replacing an image
  const handleReplaceImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0 && isInCroppingFlow) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          // Revoke the old blob URL
          const oldUrl = pendingCropImages[currentCropIndex];
          if (oldUrl && oldUrl.startsWith("blob:")) {
            URL.revokeObjectURL(oldUrl);
          }

          // Create new blob URL
          const newBlobUrl = URL.createObjectURL(file);

          // Replace the image in the pending array
          const newPendingImages = [...pendingCropImages];
          newPendingImages[currentCropIndex] = newBlobUrl;
          setPendingCropImages(newPendingImages);

          // Clear the file input so the same file can be selected again if needed
          if (replaceImageInputRef.current) {
            replaceImageInputRef.current.value = "";
          }
        }
      }
    },
    [isInCroppingFlow, currentCropIndex, pendingCropImages]
  );

  // Derived: is any image currently generating?
  const isAnyGenerating = Object.values(generatedImages)
    .flat()
    .some((s) => s === "loading");

  // Derived: is generation hard-blocked (limit reached)?
  const isGenLimitReached = generationCount >= 20;

  // Derived: show warning banner
  const genWarningRemaining =
    generationCount >= 15 && generationCount < 20
      ? 20 - generationCount
      : null;

  // Derived: has B&W generation been triggered? (any slot is non-null)
  const bwHasStarted = AI_PREVIEW_ENABLED && generatedImages.bw.some((s: GenSlot) => s !== null);

  // Derived: is the currently selected style generating?
  const isCurrentStyleGenerating = selectedStyle
    ? generatedImages[selectedStyle].some((s: GenSlot) => s === "loading")
    : false;

  // Fetch current generation count on mount (AI flow only)
  useEffect(() => {
    if (!AI_PREVIEW_ENABLED) return;
    fetch("/api/nano-banana")
      .then((r) => r.json())
      .then((d) => {
        if (d.current !== undefined) setGenerationCount(d.current);
      })
      .catch(() => {});
  }, []);

  // Trigger B&W generation for all 5 images (called by the generate button)
  const handleGenerateBW = useCallback(() => {
    images.forEach((url, i) => generateSingleImage(url, "bw", i));
  }, [images, generateSingleImage]);

  // Handle style selection with caching
  const handleAIStyleSelect = useCallback(
    (style: StyleType) => {
      setSelectedStyle(style);
      selectedStyleRef.current = style;

      const cached = generatedImages[style];
      const missingIndices = cached
        .map((slot: GenSlot, i: number) =>
          slot === null || slot === "error" ? i : null
        )
        .filter((i): i is number => i !== null);

      missingIndices.forEach((i) =>
        generateSingleImage(images[i], style, i)
      );
    },
    [generatedImages, images, generateSingleImage]
  );

  // Handle "Switch Image" button click on a generated image slot
  const handleSwitchImageClick = useCallback((index: number) => {
    switchingSlotIndex.current = index;
    switchImageInputRef.current?.click();
  }, []);

  // Handle file selection for switching a generated image
  const handleSwitchImageFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!file.type.startsWith("image/")) return;

      const slotIndex = switchingSlotIndex.current;
      if (slotIndex === null) return;

      const newBlobUrl = URL.createObjectURL(file);
      // Revoke old blob URL if applicable
      const oldOrigUrl = originalUrls.current.get(slotIndex);
      if (oldOrigUrl?.startsWith("blob:")) URL.revokeObjectURL(oldOrigUrl);

      // Store as original + open crop editor for this slot
      originalUrls.current.set(slotIndex, newBlobUrl);

      // Update displayed image immediately
      const newImages = [...images];
      newImages[slotIndex] = newBlobUrl;
      setImages(newImages);

      // Open crop editor for this slot
      setEditingImageIndex(slotIndex);

      // Clear all generated slots for this index
      setGeneratedImages((prev) => ({
        bw: prev.bw.map((s: GenSlot, i: number) => (i === slotIndex ? null : s)),
        cartoon: prev.cartoon.map((s: GenSlot, i: number) =>
          i === slotIndex ? null : s
        ),
        pencil: prev.pencil.map((s: GenSlot, i: number) =>
          i === slotIndex ? null : s
        ),
        watercolor: prev.watercolor.map((s: GenSlot, i: number) =>
          i === slotIndex ? null : s
        ),
      }));

      // Unselect style so user must re-choose after the new image is processed
      setSelectedStyle(null);
      selectedStyleRef.current = null;

      // Clear the input
      if (switchImageInputRef.current) {
        switchImageInputRef.current.value = "";
      }
    },
    [images, setImages]
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

      // ── AI Preview flow ──────────────────────────────────────────────────
      if (AI_PREVIEW_ENABLED) {
        const style = selectedStyleRef.current || selectedStyle;
        if (!style) {
          setSubmitStatus({
            type: "error",
            message:
              locale === "he"
                ? "אנא בחר סגנון צבעוני"
                : "Please select a color style",
          });
          setIsSubmitting(false);
          return;
        }

        const bwSlots = generatedImages.bw;
        const coloredSlots = generatedImages[style];
        const allBwReady = bwSlots.every(
          (s) => typeof s === "string" && s !== "loading" && s !== "error"
        );
        const allColoredReady = coloredSlots.every(
          (s) => typeof s === "string" && s !== "loading" && s !== "error"
        );

        if (!allBwReady || !allColoredReady) {
          setSubmitStatus({
            type: "error",
            message:
              locale === "he"
                ? "אנא המתן לסיום יצירת כל התמונות"
                : "Please wait for all images to finish generating",
          });
          setIsSubmitting(false);
          return;
        }

        setIsCartUploading(true);
        setUploadingImages(new Set([0, 1, 2, 3, 4]));

        // Upload all 15 images to Cloudinary in parallel:
        // 5 original user images + 5 B&W generated + 5 colored generated
        const [originalUploadResults, bwUploadResults, coloredUploadResults] =
          await Promise.all([
            // Original user images (compress first)
            Promise.all(
              images.map(async (blobUrl) => {
                const compressed = await compressImage(blobUrl);
                const fd = new FormData();
                fd.append("images", compressed);
                const res = await fetch("/api/upload-images", {
                  method: "POST",
                  body: fd,
                });
                if (!res.ok) throw new Error("Failed to upload original image");
                const d = await res.json();
                return d.imageUrls[0] as string;
              })
            ),
            // B&W generated images
            Promise.all(
              bwSlots.map(async (slot) => {
                const dataUrl = slot as string;
                const [, rest] = dataUrl.split(",");
                const mimeType =
                  dataUrl.match(/data:([^;]+);/)?.[1] ?? "image/png";
                return uploadBase64ToCloudinary(rest, mimeType);
              })
            ),
            // Colored generated images
            Promise.all(
              coloredSlots.map(async (slot) => {
                const dataUrl = slot as string;
                const [, rest] = dataUrl.split(",");
                const mimeType =
                  dataUrl.match(/data:([^;]+);/)?.[1] ?? "image/png";
                return uploadBase64ToCloudinary(rest, mimeType);
              })
            ),
          ]);

        setUploadingImages(new Set());
        setIsCartUploading(false);

        // Store original Cloudinary URLs
        originalUploadResults.forEach((url, i) => {
          cloudinaryUrls.current.set(i, url);
        });

        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem("adding_to_cart", "1");
          }
        } catch {}

        const addPromise = addToCart(
          coloredUploadResults,
          1,
          undefined,
          undefined,
          style,
          bwUploadResults
        );
        router.push("/cart");
        addPromise.catch((e) => console.error("Add to cart failed:", e));
        return;
      }

      // ── Legacy flow ──────────────────────────────────────────────────────
      // Mark all images as uploading for UI feedback
      setUploadingImages(new Set([0, 1, 2, 3, 4]));

      // Upload all 5 images simultaneously to Cloudinary
      const compressedImages = await Promise.all(
        images.map((url) => compressImage(url)),
      );

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

      imageUrls.forEach((url: string, index: number) => {
        cloudinaryUrls.current.set(index, url);
      });
      setUploadingImages(new Set());

      const invalidUrls = imageUrls.filter(
        (url: string) =>
          !url || (!url.startsWith("http://") && !url.startsWith("https://")),
      );
      if (invalidUrls.length > 0) {
        throw new Error("Some images were not uploaded correctly");
      }

      try {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("adding_to_cart", "1");
        }
      } catch {}

      const styleToAdd =
        selectedStyleRef.current || selectedStyle || ("pencil" as StyleType);
      const addPromise = addToCart(imageUrls, 1, undefined, undefined, styleToAdd);
      router.push("/cart");
      addPromise.catch((e) => console.error("Add to cart failed:", e));
    } catch (error) {
      console.error("Submit error:", error);
      setUploadingImages(new Set());
      setIsCartUploading(false);
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
          className="relative pb-10 lg:pb-16 pt-6 lg:pt-10"
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
                    <span style={{ color: "#693430" }}>
                      {images.length}
                    </span>{" "}
                    {t("upload.imagesCount")}
                  </span>
                </div>
              </div>

              {/* Section 1 Title - Image Selection */}
              {images.length > 0 && (
                <div className="text-center mt-6">
                  <h3 className="text-lg font-body-bold text-dark-gray flex items-center justify-center gap-2">
                    <span 
                      className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-body-bold"
                      style={{ backgroundColor: "#e1b093" }}
                    >
                      1
                    </span>
                    {locale === "he" ? "בחירת תמונות" : "Select Images"}
                  </h3>
                  {/* Helper texts under title - only show when 5 images */}
                  {images.length >= 5 && (
                    <div className="flex flex-col gap-1 text-sm font-body text-dark-gray text-center mt-3">
                      <p>{t("upload.tapToCrop")}</p>
                      <p>{t("upload.dragToReorder")}</p>
                      {/* Info link to show image selection tips */}
                      <div className="mt-2">
                        <button
                          onClick={handleInfoClick}
                          className="inline-flex items-center gap-1.5 text-sm font-body-bold cursor-pointer hover:opacity-80 transition-opacity"
                          style={{ color: "#693430" }}
                        >
                          <Info className="w-4 h-4" />
                          <span>{t("upload.photoTip")}</span>
                        </button>
                      </div>
                    </div>
                  )}
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

              {/* Hidden File Input for Replacing Images */}
              <input
                ref={replaceImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleReplaceImageChange}
                className="hidden"
              />

              {/* Hidden File Input for Switching Generated Image Slot */}
              <input
                ref={switchImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleSwitchImageFileChange}
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
                        <div className="flex flex-nowrap justify-center gap-1 md:gap-2 w-full max-w-none mx-auto px-6 overflow-visible items-end pt-2">
                          {images.slice(0, 5).map((url, index) => (
                            <SortableImageItem
                              key={url} // Use URL as key to prevent re-renders on reorder
                              id={index.toString()}
                              url={url}
                              index={index}
                              locale={locale}
                              onRemove={handleRemoveImage}
                              isSubmitting={isSubmitting}
                              onTap={bwHasStarted ? () => {} : handleImageTap}
                              onSwitch={bwHasStarted ? handleSwitchImageClick : undefined}
                            />
                          ))}
                        </div>
                      </div>
                    </SortableContext>
                  </DndContext>

                  {/* Action Buttons / Preview */}
                  {images.length >= 5 && !AI_PREVIEW_ENABLED && (
                    <div className="flex flex-col gap-4 max-w-md mx-auto w-full sm:w-auto">
                      {/* Style Selector - Show after images are arranged */}
                      <div className="flex justify-center mt-6 mb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
                        <StyleSelector
                          selectedStyle={selectedStyle}
                          onStyleChange={(s) => {
                            setSelectedStyle(s);
                            selectedStyleRef.current = s;
                          }}
                        />
                      </div>

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddToCart}
                        disabled={isSubmitting || !selectedStyle}
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

              {/* ── AI Preview Sections ─────────────────────────────────────── */}
              {AI_PREVIEW_ENABLED && images.length >= 5 && (
                <div className="flex flex-col gap-10 w-full mt-4">
                  {/* Shimmer CSS */}
                  <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>

                  {/* Generate B&W button */}
                  <div className="flex justify-center">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateBW}
                      disabled={bwHasStarted}
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        py: { xs: 1.5, sm: 2 },
                        px: 5,
                        boxShadow: "none",
                      }}
                    >
                      {locale === "he" ? "צור תצוגה מקדימה" : "Generate Preview"}
                    </Button>
                  </div>

                  {/* Sections 2-4: only after button clicked */}
                  {bwHasStarted && (<>
                  <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-body-bold text-dark-gray flex items-center justify-center gap-2">
                      <span
                        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-body-bold"
                        style={{ backgroundColor: "#e1b093" }}
                      >
                        2
                      </span>
                      {locale === "he"
                        ? "תמונות בשחור לבן"
                        : "Black & White Preview"}
                    </h3>
                    <div className="flex flex-row gap-2 sm:gap-3 justify-center flex-wrap">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const slot = generatedImages.bw[i];
                        const errKey = `bw_${i}`;
                        const errMsg = imageErrors.get(errKey);
                        const isLoading = slot === "loading";
                        const isError = slot === "error";
                        const isReady =
                          typeof slot === "string" &&
                          slot !== "loading" &&
                          slot !== "error";
                        const btnDisabled =
                          isAnyGenerating || isGenLimitReached;
                        return (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div className="relative w-[80px] h-[93px] sm:w-[100px] sm:h-[117px] rounded-lg overflow-hidden bg-gray-100">
                              {isLoading && (
                                <ImageSkeleton className="absolute inset-0" />
                              )}
                              {isError && (
                                <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                                  <ImageIcon className="w-6 h-6 text-red-400" />
                                </div>
                              )}
                              {isReady && (
                                <img
                                  src={slot}
                                  alt={`B&W ${i + 1}`}
                                  className="w-full h-full object-cover"
                                  draggable={false}
                                  onContextMenu={(e) => e.preventDefault()}
                                  style={{ userSelect: "none" }}
                                />
                              )}
                            </div>
                            {errMsg && (
                              <p className="text-xs text-red-500 text-center max-w-[90px]">
                                {errMsg}
                              </p>
                            )}
                            {/* Regenerate button */}
                            <button
                              onClick={() =>
                                generateSingleImage(images[i], "bw", i)
                              }
                              disabled={btnDisabled}
                              className="flex items-center gap-1 text-xs text-dark-gray font-body hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              title={
                                locale === "he"
                                  ? "יצור מחדש"
                                  : "Regenerate"
                              }
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>
                                {locale === "he" ? "יצור מחדש" : "Regenerate"}
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Choose Style */}
                  <div className="flex flex-col items-center gap-4 -mx-4 sm:mx-0 px-4 sm:px-0">
                    <StyleSelector
                      selectedStyle={selectedStyle}
                      onStyleChange={(s) => {
                        setSelectedStyle(s);
                        selectedStyleRef.current = s;
                      }}
                      disabled={isAnyGenerating || isGenLimitReached}
                    />
                    {/* Generate button */}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => selectedStyle && handleAIStyleSelect(selectedStyle)}
                      disabled={isCurrentStyleGenerating || isGenLimitReached}
                      sx={{ borderRadius: "12px", textTransform: "none", fontSize: "1rem", fontWeight: 700, py: { xs: 1.5, sm: 2 }, px: 5, boxShadow: "none" }}
                    >
                      {isCurrentStyleGenerating
                        ? (locale === "he" ? "מייצר תמונות..." : "Generating images...")
                        : (locale === "he"
                          ? `צור ${t(`styleSelector.${selectedStyle ?? "pencil"}`)}`
                          : `Generate ${t(`styleSelector.${selectedStyle ?? "pencil"}`)}`)
                      }
                    </Button>
                  </div>

                  {/* Section 4: Colored Preview (only after style selected) */}
                  {selectedStyle && (
                    <div className="flex flex-col gap-4">
                      <h3 className="text-lg font-body-bold text-dark-gray flex items-center justify-center gap-2">
                        <span
                          className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs text-white font-body-bold"
                          style={{ backgroundColor: "#e1b093" }}
                        >
                          4
                        </span>
                        {locale === "he"
                          ? "תצוגה מקדימה צבעונית"
                          : "Colored Preview"}
                      </h3>
                      <div className="flex flex-row gap-2 sm:gap-3 justify-center flex-wrap">
                        {Array.from({ length: 5 }).map((_, i) => {
                          const slot = generatedImages[selectedStyle][i];
                          const errKey = `${selectedStyle}_${i}`;
                          const errMsg = imageErrors.get(errKey);
                          const isLoading = slot === "loading";
                          const isError = slot === "error";
                          const isReady =
                            typeof slot === "string" &&
                            slot !== "loading" &&
                            slot !== "error";
                          const btnDisabled =
                            isAnyGenerating || isGenLimitReached;
                          return (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div className="relative w-[80px] h-[93px] sm:w-[100px] sm:h-[117px] rounded-lg overflow-hidden bg-gray-100">
                                {isLoading && (
                                  <ImageSkeleton className="absolute inset-0" />
                                )}
                                {isError && (
                                  <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-lg">
                                    <ImageIcon className="w-6 h-6 text-red-400" />
                                  </div>
                                )}
                                {isReady && (
                                  <img
                                    src={slot}
                                    alt={`${selectedStyle} ${i + 1}`}
                                    className="w-full h-full object-cover"
                                    draggable={false}
                                    onContextMenu={(e) => e.preventDefault()}
                                    style={{ userSelect: "none" }}
                                  />
                                )}
                              </div>
                              {errMsg && (
                                <p className="text-xs text-red-500 text-center max-w-[90px]">
                                  {errMsg}
                                </p>
                              )}
                              {/* Regenerate button */}
                              <button
                                onClick={() =>
                                  generateSingleImage(
                                    images[i],
                                    selectedStyle,
                                    i
                                  )
                                }
                                disabled={btnDisabled}
                                className="flex items-center gap-1 text-xs text-dark-gray font-body hover:opacity-70 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                title={
                                  locale === "he" ? "יצור מחדש" : "Regenerate"
                                }
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>
                                  {locale === "he"
                                    ? "יצור מחדש"
                                    : "Regenerate"}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Generation warning / hard limit banners */}
                  {genWarningRemaining !== null && (
                    <div className="w-full p-3 rounded-lg text-center font-body text-sm bg-orange-50 border border-orange-200 text-orange-700">
                      {locale === "he"
                        ? `נותרו רק ${genWarningRemaining} יצירות לשעה הקרובה`
                        : `Only ${genWarningRemaining} generation${genWarningRemaining === 1 ? "" : "s"} left for this hour`}
                    </div>
                  )}
                  {isGenLimitReached && (
                    <div className="w-full p-3 rounded-lg text-center font-body text-sm bg-red-50 border border-red-200 text-red-700">
                      {locale === "he"
                        ? "הגעת למגבלת היצירה. נסה שוב בעוד שעה."
                        : "You've reached the generation limit. Please try again in an hour."}
                    </div>
                  )}

                  {/* Add to Cart + Start Over */}
                  <div className="flex flex-col gap-4 max-w-md mx-auto w-full">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddToCart}
                      disabled={
                        isSubmitting ||
                        isCartUploading ||
                        isAnyGenerating ||
                        !selectedStyle ||
                        !generatedImages.bw.every(
                          (s) =>
                            typeof s === "string" &&
                            s !== "loading" &&
                            s !== "error"
                        ) ||
                        !selectedStyle ||
                        !generatedImages[selectedStyle ?? "cartoon"].every(
                          (s) =>
                            typeof s === "string" &&
                            s !== "loading" &&
                            s !== "error"
                        )
                      }
                      className="w-full cursor-pointer relative z-10 flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      sx={{
                        borderRadius: "12px",
                        textTransform: "none",
                        fontSize: "1rem",
                        fontWeight: 700,
                        py: { xs: 1.5, sm: 2 },
                        boxShadow: "none",
                      }}
                    >
                      {isSubmitting || isCartUploading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {locale === "he"
                            ? "מכין את הספר..."
                            : "Preparing your book..."}
                        </>
                      ) : (
                        t("upload.addToCart")
                      )}
                    </Button>

                    {/* Status message */}
                    {submitStatus.type && (
                      <div
                        className={`w-full p-4 rounded-lg text-center font-body-bold text-sm ${
                          submitStatus.type === "success"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {submitStatus.message}
                      </div>
                    )}

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
                  </div>
                  </>)}
                </div>
              )}

              {/* Image Upload Area - Only show when less than 5 images */}
              {images.length < 5 && (
                <>
                  <div className="text-center">
                    <div
                      className="w-40 h-40 md:w-48 md:h-48 mx-auto rounded-full bg-white border-2 border-gray-300 flex items-center justify-center hover:border-primary-orange transition-all duration-200 cursor-pointer"
                      onClick={handleUploadClick}
                    >
                      <Upload className="w-10 h-10 md:w-12 md:h-12" style={{ color: "#693430" }} />
                    </div>
                  </div>

                  {/* Image Upload Tip */}
                  <div className="text-center">
                    <p className="mt-2 text-sm font-body text-dark-gray">
                      {t("upload.photoNote")}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ color: "#693430" }}
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
      {(editingImageIndex !== null || isInCroppingFlow) && (
        <MobileImageEditor
          imageUrl={
            isInCroppingFlow
              ? pendingCropImages[currentCropIndex]
              : editingImageIndex !== null && editingImageIndex >= 0
                ? (originalUrls.current.get(editingImageIndex) ?? images[editingImageIndex])
                : ""
          }
          initialCrop={
            isInCroppingFlow
              ? undefined
              : editingImageIndex !== null && editingImageIndex >= 0
                ? cropStates.current.get(editingImageIndex)?.crop
                : undefined
          }
          initialZoom={
            isInCroppingFlow
              ? undefined
              : editingImageIndex !== null && editingImageIndex >= 0
                ? cropStates.current.get(editingImageIndex)?.zoom
                : undefined
          }
          onSave={handleSaveCrop}
          onCancel={handleCancelCrop}
          onChangeImage={isInCroppingFlow ? handleChangeImage : undefined}
          currentIndex={isInCroppingFlow ? currentCropIndex : undefined}
          totalImages={isInCroppingFlow ? pendingCropImages.length : undefined}
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
