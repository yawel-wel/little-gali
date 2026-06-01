"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Title } from "@/components/title";
import { UploadModal } from "@/components/upload-modal";
import { StyleSelector, StyleType } from "@/components/style-selector";
import { Upload, Info, X, Loader2 } from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import { PreviewInitialLoadingScreen } from "@/components/preview-initial-loading-screen";
import { MobileImageEditor, type CropState } from "@/components/mobile-image-editor";
import type { Area } from "react-easy-crop";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUploadImages } from "@/lib/UploadImagesContext";
import { useCart } from "@/lib/CartContext";
import { SENTRY_REPLAY_BLOCK_USER_IMAGE } from "@/lib/sentry-privacy";
import { compressImage, prepareImageForCrop, cn } from "@/lib/utils";
import { arrayMove } from "@dnd-kit/sortable";
import {
  UploadImageDragSurface,
  UploadSortableImages,
  type UploadDragActivator,
} from "@/components/upload-sortable-images";
import { reorderIndexMaps } from "@/lib/reorder-indexed-maps";
import { isAiPreviewEnabled } from "@/lib/feature-flags";
import { useLanguage } from "@/lib/LanguageContext";
import { getOrCreateLgSessionId, persistLgSessionId } from "@/lib/session-id";
import {
  getGenerationRateLimitMessage,
  isGenerationRateLimited,
} from "@/lib/preview-session/handle-generation-response";
import { logPreviewFullGenerationRateLimited } from "@/lib/preview-session/log-preview-rate-limit";
import { PREVIEW_RATE_LIMIT_ERROR_CODE } from "@/lib/preview-session/constants";
import { usePreviewLimits } from "@/lib/PreviewLimitsContext";
import {
  formatLastFullGenerationWarning,
  formatPreviewRateLimitMessage,
} from "@/lib/preview-session/preview-limit-messages";
import { buildPreviewRateLimitContactHref } from "@/lib/preview-session/preview-contact-url";
import {
  getKnownPreviewSessionIds,
  recordPreviewSessionId,
} from "@/lib/preview-session/preview-session-id-history";
import {
  persistUploadPreviewBlocked,
  readUploadPreviewBlocked,
  type UploadPreviewBlockedCode,
} from "@/lib/preview-session/upload-preview-blocked-storage";
import Button from "@mui/material/Button";

const PREVIEW_LOADING_IMAGES_STORAGE_PREFIX = "little-gali-preview-loading-images";

// ─── Upload Image Item ────────────────────────────────────────────────────────

interface UploadImageItemProps {
  url: string;
  index: number;
  locale: string;
  onRemove: (index: number) => void;
  isSubmitting: boolean;
  onTap: (index: number) => void;
  dragActivator?: UploadDragActivator;
}

function UploadImageItem({
  url,
  index,
  locale,
  onRemove,
  isSubmitting,
  onTap,
  dragActivator,
}: UploadImageItemProps) {
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

  const thumbnail = (
    <img
      src={url}
      alt={
        locale === "en"
          ? `Selected photo ${index + 1}`
          : `תמונה נבחרת ${index + 1}`
      }
      className={cn(
        SENTRY_REPLAY_BLOCK_USER_IMAGE,
        "w-full h-full object-cover border-2 border-primary-orange rounded-lg pointer-events-none",
      )}
      loading="eager"
      decoding="async"
      draggable={false}
    />
  );

  const thumbClassName =
    "relative w-[72px] h-[84px] sm:w-[80px] sm:h-[93px] md:w-[120px] md:h-[140px] lg:w-[140px] lg:h-[163px] cursor-pointer rounded-lg overflow-hidden";

  return (
    <div className="relative flex-shrink-0 pt-1.5 pl-1.5">
      <div
        style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)" }}
        className={thumbClassName}
      >
        {dragActivator ? (
          <UploadImageDragSurface
            dragActivator={dragActivator}
            onTap={() => onTap(index)}
            className="relative h-full w-full"
          >
            {thumbnail}
          </UploadImageDragSurface>
        ) : (
          <div
            className="relative h-full w-full"
            onClick={() => onTap(index)}
          >
            {thumbnail}
          </div>
        )}
      </div>
      <button
        type="button"
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
        className="absolute top-0 left-0 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 hover:opacity-90 cursor-pointer"
        disabled={isSubmitting}
        style={{ pointerEvents: "auto" }}
        aria-label={
          locale === "en"
            ? `Remove photo ${index + 1}`
            : `הסרת תמונה ${index + 1}`
        }
      >
        <X className="h-3 w-3" strokeWidth={2.5} />
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
  const { limits, refreshLimits } = usePreviewLimits();
  const [showModal, setShowModal] = useState(false);
  const [isFromUploadButton, setIsFromUploadButton] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReorderingImages, setIsReorderingImages] = useState(false);
  const [showPreviewLoader, setShowPreviewLoader] = useState(false);
  const [previewLoaderLineIndex, setPreviewLoaderLineIndex] = useState(0);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
    errorCode?: UploadPreviewBlockedCode;
  }>({ type: null, message: "" });
  const [previewBlockedCode, setPreviewBlockedCode] =
    useState<UploadPreviewBlockedCode | null>(() => readUploadPreviewBlocked());
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(
    new Set(),
  );
  const [selectedStyle, setSelectedStyle] = useState<StyleType>("pencil");
  const selectedStyleRef = useRef<StyleType>("pencil");
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
  const [smartCropLoading, setSmartCropLoading] = useState(false);
  const [smartCropArea, setSmartCropArea] = useState<Area | undefined>(
    undefined,
  );
  const [editorFaceBoxes, setEditorFaceBoxes] = useState<Area[]>([]);

  const pendingBlobForVision =
    isInCroppingFlow && pendingCropImages[currentCropIndex]
      ? pendingCropImages[currentCropIndex]
      : null;

  const editCropImageUrl =
    !isInCroppingFlow &&
    editingImageIndex !== null &&
    editingImageIndex >= 0
      ? originalUrls.current.get(editingImageIndex) ??
        images[editingImageIndex] ??
        null
      : null;

  const suggestCropTargetUrl = pendingBlobForVision ?? editCropImageUrl;

  // Turn on loading before paint so we never flash the Cropper without a suggestion
  // (smartCropLoading defaults to false, so the first paint would otherwise match production).
  useLayoutEffect(() => {
    if (!pendingBlobForVision) {
      setSmartCropLoading(false);
      setSmartCropArea(undefined);
      return;
    }
    setSmartCropLoading(true);
    setSmartCropArea(undefined);
  }, [pendingBlobForVision]);

  useEffect(() => {
    if (!suggestCropTargetUrl) {
      setEditorFaceBoxes([]);
      return;
    }

    const ac = new AbortController();
    setEditorFaceBoxes([]);

    (async () => {
      try {
        const blob = await fetch(suggestCropTargetUrl).then((r) => r.blob());
        const fd = new FormData();
        fd.append("image", blob, "photo.jpg");
        const res = await fetch("/api/suggest-crop", {
          method: "POST",
          body: fd,
          signal: ac.signal,
        });
        const data = await res.json();
        if (ac.signal.aborted) return;
        setEditorFaceBoxes(Array.isArray(data.faceBoxes) ? data.faceBoxes : []);
        if (isInCroppingFlow) {
          const pixels = data.croppedAreaPixels as Area | undefined;
          const hasValidSuggestion =
            !data.fallback &&
            pixels &&
            pixels.width > 0 &&
            pixels.height > 0;
          setSmartCropArea(hasValidSuggestion ? pixels : undefined);
        }
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        if (!ac.signal.aborted) {
          setEditorFaceBoxes([]);
          if (isInCroppingFlow) setSmartCropArea(undefined);
        }
      } finally {
        if (!ac.signal.aborted) {
          setSmartCropLoading(false);
        }
      }
    })();

    return () => ac.abort();
  }, [suggestCropTargetUrl, isInCroppingFlow]);

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
    const blockedOnMount = readUploadPreviewBlocked();
    if (blockedOnMount) {
      setPreviewBlockedCode(blockedOnMount);
      setSubmitStatus({ type: "error", errorCode: blockedOnMount, message: "" });
    } else {
      setSubmitStatus({ type: null, message: "" });
    }
    setIsSubmitting(false);
    cloudinaryUrls.current.clear();
    originalUrls.current.clear();
    cropStates.current.clear();
    setPendingCropImages([]);
    setCurrentCropIndex(0);
    setIsInCroppingFlow(false);
    setEditingImageIndex(null);

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
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );
    const currentCount = images.length;
    const availableSlots = 5 - currentCount;
    if (availableSlots <= 0) return;

    const filesToProcess = imageFiles.slice(0, availableSlots);
    setSmartCropLoading(true);
    setSmartCropArea(undefined);
    setIsInCroppingFlow(true);
    setEditingImageIndex(-1);

    try {
      const preparedBlobs = await Promise.all(
        filesToProcess.map((file) => prepareImageForCrop(file)),
      );
      const blobUrls = preparedBlobs.map((blob) => URL.createObjectURL(blob));
      setPendingCropImages(blobUrls);
      setCurrentCropIndex(0);
    } catch (error) {
      console.error("Failed to prepare images for cropping:", error);
      setSmartCropLoading(false);
      setIsInCroppingFlow(false);
      setEditingImageIndex(null);
      setSubmitStatus({
        type: "error",
        message: t("upload.serverError"),
      });
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

  // Open the mobile editor for a specific image
  const handleImageTap = useCallback((index: number) => {
    setEditingImageIndex(index);
  }, []);

  const handleImagesReorder = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (oldIndex === newIndex) {
        return;
      }
      setImages(arrayMove(images, oldIndex, newIndex));
      reorderIndexMaps(
        [
          originalUrls.current,
          cropStates.current,
          cloudinaryUrls.current,
        ],
        oldIndex,
        newIndex,
        images.length,
      );
    },
    [images, setImages],
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
      }
    },
    [isInCroppingFlow, currentCropIndex, pendingCropImages, images, editingImageIndex, setImages],
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
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files || files.length === 0 || !isInCroppingFlow) return;

      const file = files[0];
      if (!file.type.startsWith("image/")) return;

      const oldUrl = pendingCropImages[currentCropIndex];
      if (oldUrl && oldUrl.startsWith("blob:")) {
        URL.revokeObjectURL(oldUrl);
      }

      setSmartCropLoading(true);
      setSmartCropArea(undefined);

      try {
        const prepared = await prepareImageForCrop(file);
        const newBlobUrl = URL.createObjectURL(prepared);
        const newPendingImages = [...pendingCropImages];
        newPendingImages[currentCropIndex] = newBlobUrl;
        setPendingCropImages(newPendingImages);
      } catch (error) {
        console.error("Failed to prepare replacement image:", error);
        setSmartCropLoading(false);
        setSubmitStatus({
          type: "error",
          message: t("upload.serverError"),
        });
      } finally {
        if (replaceImageInputRef.current) {
          replaceImageInputRef.current.value = "";
        }
      }
    },
    [isInCroppingFlow, currentCropIndex, pendingCropImages, t],
  );

  const previewEnabled = isAiPreviewEnabled();
  const showWithoutPreviewCartPath =
    previewBlockedCode === "preview_rate_limit" ||
    previewBlockedCode === "generation_rate_limit";

  const previewRateLimitMessage = useMemo(
    () =>
      formatPreviewRateLimitMessage(t, {
        windowHours: limits.windowHours,
        fullGenerationLimit: limits.fullGenerationLimit,
      }),
    [t, limits.windowHours, limits.fullGenerationLimit],
  );

  const lastGenerationWarning = useMemo(() => {
    if (!limits.isLastFullGenerationAvailable) {
      return null;
    }
    return formatLastFullGenerationWarning(
      t,
      { windowHours: limits.windowHours, resetAt: limits.resetAt },
      locale,
    );
  }, [
    t,
    locale,
    limits.isLastFullGenerationAvailable,
    limits.windowHours,
    limits.resetAt,
  ]);

  const previewRateLimitContactHref = useMemo(
    () => buildPreviewRateLimitContactHref(getKnownPreviewSessionIds()),
    [limits.fullGenerationsRemaining, limits.fullGenerationsUsed],
  );

  useEffect(() => {
    if (limits.isLoading || !previewEnabled) {
      return;
    }
    if (limits.limitsBypassed || !limits.limitsEnforced) {
      setPreviewBlockedCode((current: UploadPreviewBlockedCode | null) => {
        if (current === "preview_rate_limit") {
          persistUploadPreviewBlocked(null);
          setSubmitStatus((status) =>
            status.errorCode === "preview_rate_limit"
              ? { type: null, message: "" }
              : status,
          );
          return null;
        }
        return current;
      });
      return;
    }
    if (limits.fullGenerationsRemaining > 0) {
      setPreviewBlockedCode((current: UploadPreviewBlockedCode | null) => {
        if (current === "preview_rate_limit") {
          persistUploadPreviewBlocked(null);
          setSubmitStatus((status) =>
            status.errorCode === "preview_rate_limit"
              ? { type: null, message: "" }
              : status,
          );
          return null;
        }
        return current;
      });
      return;
    }
    setPreviewBlockedCode("preview_rate_limit");
    setSubmitStatus({
      type: "error",
      errorCode: "preview_rate_limit",
      message: "",
    });
    persistUploadPreviewBlocked("preview_rate_limit");
  }, [
    limits.isLoading,
    limits.limitsBypassed,
    limits.limitsEnforced,
    limits.fullGenerationsRemaining,
    previewEnabled,
  ]);

  const bwLoadingLines = useMemo(
    () => [
      t("preview.bwLoadingLine1"),
      t("preview.bwLoadingLine2"),
      t("preview.bwLoadingLine3"),
      t("preview.bwLoadingLine4"),
      t("preview.bwLoadingLine5"),
    ],
    [t],
  );

  useEffect(() => {
    if (!showPreviewLoader || bwLoadingLines.length === 0) {
      return;
    }
    const interval = setInterval(() => {
      setPreviewLoaderLineIndex(
        (current) => (current + 1) % bwLoadingLines.length,
      );
    }, 3500);
    return () => clearInterval(interval);
  }, [bwLoadingLines.length, showPreviewLoader]);

  const applyPreviewStartBlockedState = (
    response: Response,
    data: { error?: string; sessionId?: string },
    previewSessionId: string,
    source: "upload_client" | "upload_client_check",
  ) => {
    if (data.sessionId && typeof window !== "undefined") {
      persistLgSessionId(data.sessionId);
    }
    const isGenerationLimited = isGenerationRateLimited(response, data);
    const isPreviewRateLimited =
      response.status === 429 &&
      (data.error === PREVIEW_RATE_LIMIT_ERROR_CODE ||
        data.error === "preview_rate_limit");
    if (isPreviewRateLimited) {
      logPreviewFullGenerationRateLimited(source, previewSessionId);
    }
    const blockedCode: UploadPreviewBlockedCode | null = isGenerationLimited
      ? "generation_rate_limit"
      : isPreviewRateLimited
        ? "preview_rate_limit"
        : response.status === 429
          ? "preview_rate_limit"
          : null;
    if (blockedCode) {
      setPreviewBlockedCode(blockedCode);
      persistUploadPreviewBlocked(blockedCode);
      void refreshLimits();
    }
    setSubmitStatus({
      type: "error",
      message: isGenerationLimited
        ? ""
        : isPreviewRateLimited
          ? previewRateLimitMessage
          : data.error || t("upload.serverError"),
      errorCode: blockedCode ?? undefined,
    });
  };

  const handleContinueToPreview = async () => {
    if (!images || images.length !== 5) {
      setSubmitStatus({
        type: "error",
        message: t("upload.selectExactly5"),
      });
      return;
    }

    setIsSubmitting(true);
    if (!previewBlockedCode && !readUploadPreviewBlocked()) {
      setSubmitStatus({ type: null, message: "" });
    }

    try {
      const previewSessionId = getOrCreateLgSessionId();
      const checkResponse = await fetch("/api/preview-session/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: previewSessionId }),
      });
      const checkData = (await checkResponse.json()) as {
        allowed?: boolean;
        error?: string;
        sessionId?: string;
      };
      if (!checkResponse.ok || checkData.allowed === false) {
        applyPreviewStartBlockedState(
          checkResponse,
          checkData,
          previewSessionId,
          "upload_client_check",
        );
        setIsSubmitting(false);
        return;
      }

      setPreviewLoaderLineIndex(0);
      setShowPreviewLoader(true);
      setUploadingImages(new Set([0, 1, 2, 3, 4]));
      const compressedImages = await Promise.all(
        images.map((url) => compressImage(url)),
      );
      const previewFormData = new FormData();
      previewFormData.append("sessionId", previewSessionId);
      compressedImages.forEach((file) => {
        previewFormData.append("images", file);
      });

      const previewResponse = await fetch("/api/preview-session", {
        method: "POST",
        body: previewFormData,
      });
      const previewData = (await previewResponse.json()) as {
        session?: { id: string; generationStatus?: string };
        error?: string;
        sessionId?: string;
      };
      if (!previewResponse.ok) {
        if (previewData.sessionId && typeof window !== "undefined") {
          persistLgSessionId(previewData.sessionId);
        }
        setUploadingImages(new Set());
        setIsSubmitting(false);
        setShowPreviewLoader(false);
        applyPreviewStartBlockedState(
          previewResponse,
          previewData,
          previewSessionId,
          "upload_client",
        );
        return;
      }

      if (!previewData.session?.id) {
        setUploadingImages(new Set());
        setIsSubmitting(false);
        setShowPreviewLoader(false);
        setSubmitStatus({
          type: "error",
          message: t("upload.serverError"),
        });
        return;
      }

      setUploadingImages(new Set());
      setPreviewBlockedCode(null);
      persistUploadPreviewBlocked(null);
      if (typeof window !== "undefined") {
        persistLgSessionId(previewData.session.id);
        recordPreviewSessionId(previewData.session.id);
        sessionStorage.setItem(
          `${PREVIEW_LOADING_IMAGES_STORAGE_PREFIX}:${previewData.session.id}`,
          JSON.stringify(images.slice(0, 5)),
        );
      }
      router.push(`/preview/${previewData.session.id}`);
      return;
    } catch (error) {
      console.error("Preview start error:", error);
      setUploadingImages(new Set());
      setShowPreviewLoader(false);
      setSubmitStatus({
        type: "error",
        message: t("upload.serverError"),
      });
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    setIsSubmitting(true);
    setPreviewBlockedCode(null);
    persistUploadPreviewBlocked(null);
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
      const styleToAdd = selectedStyleRef.current || selectedStyle || "pencil";
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

  const withoutPreviewStartedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("withoutPreview") !== "1") return;
    if (withoutPreviewStartedRef.current) return;
    if (images.length !== 5 || isSubmitting) return;

    withoutPreviewStartedRef.current = true;
    router.replace("/upload");
    void handleAddToCart();
  }, [handleAddToCart, images.length, isSubmitting, router]);

  return (
    <div
      className="min-h-screen overflow-x-hidden"
      style={{ backgroundColor: "#F3EEE8" }}
    >
      <Header />

      <main
        id="main-content"
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
                {images.length > 0 ? (
                  <Title
                    highlightText={t("upload.titleReadyHighlight")}
                    size="xl"
                    roundedUnderline
                    className="text-2xl md:text-4xl font-bold"
                  >
                    {t("upload.titleReady")}
                  </Title>
                ) : (
                  <Title
                    highlightText={t("upload.titleHighlight")}
                    size="xl"
                    roundedUnderline
                    className="text-2xl md:text-4xl font-bold"
                  >
                    {t("upload.title")}
                  </Title>
                )}
              </div>

              {/* First Paragraph */}
              <div className="text-center mb-8 -mt-4">
                <p className="text-base font-body text-dark-gray leading-relaxed text-center">
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
                    className={`text-dark-gray font-body-bold text-sm md:text-base ${
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

              {/* Selected Images Display */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div>
                    {images.length === 5 && (
                      <p className="mb-4 text-center font-body text-sm text-dark-gray px-4">
                        {t("upload.dragToReorder")}
                      </p>
                    )}
                    <div
                      className={cn(
                        "w-full py-1 md:overflow-visible",
                        isReorderingImages
                          ? "overflow-x-hidden"
                          : "overflow-x-auto overscroll-x-contain",
                      )}
                    >
                      <div className="mx-auto flex w-max min-w-full flex-nowrap items-end justify-center gap-0.5 overflow-visible px-3 pt-1 sm:px-4 md:gap-1">
                      {images.length === 5 ? (
                        <UploadSortableImages
                          count={5}
                          disabled={isSubmitting}
                          onDraggingChange={setIsReorderingImages}
                          onReorder={handleImagesReorder}
                          renderItem={(index, { dragActivator }) => (
                            <UploadImageItem
                              key={index}
                              url={images[index]}
                              index={index}
                              locale={locale}
                              onRemove={handleRemoveImage}
                              isSubmitting={isSubmitting}
                              onTap={handleImageTap}
                              dragActivator={dragActivator}
                            />
                          )}
                        />
                      ) : (
                        images.map((url, index) => (
                          <UploadImageItem
                            key={url}
                            url={url}
                            index={index}
                            locale={locale}
                            onRemove={handleRemoveImage}
                            isSubmitting={isSubmitting}
                            onTap={handleImageTap}
                          />
                        ))
                      )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {images.length >= 5 && (
                    <div className="mt-10 flex flex-col gap-4 max-w-md mx-auto w-full sm:w-auto">
                      {(!previewEnabled || showWithoutPreviewCartPath) && (
                        <div className="flex justify-center mt-6 mb-4 -mx-4 sm:mx-0 px-4 sm:px-0">
                          <StyleSelector
                            selectedStyle={selectedStyle}
                            onStyleChange={setSelectedStyle}
                          />
                        </div>
                      )}

                      {lastGenerationWarning &&
                        previewEnabled &&
                        !showWithoutPreviewCartPath &&
                        images.length === 5 && (
                          <div className="w-full rounded-lg border border-amber-200 bg-amber-50 p-4 text-center font-body text-sm text-dark-gray">
                            {lastGenerationWarning}
                          </div>
                        )}

                      <Button
                        variant="contained"
                        color="primary"
                        onClick={
                          showWithoutPreviewCartPath || !previewEnabled
                            ? handleAddToCart
                            : handleContinueToPreview
                        }
                        disabled={isSubmitting}
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
                        {isSubmitting ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : showWithoutPreviewCartPath ? (
                          t("upload.continueWithoutPreview")
                        ) : previewEnabled ? (
                          t("upload.continueToPreview")
                        ) : (
                          t("upload.addToCart")
                        )}
                      </Button>
                      {showWithoutPreviewCartPath && (
                        <p className="text-center font-body text-sm text-medium-gray -mt-2">
                          {t("upload.withoutPreviewReassurance")}
                        </p>
                      )}
                      {/* Status Message */}
                      {(submitStatus.type ||
                        previewBlockedCode === "preview_rate_limit") && (
                        <div
                          className={cn(
                            "w-full rounded-lg p-4 text-center",
                            submitStatus.type === "success"
                              ? "border border-green-200 bg-green-50 font-body-bold text-green-700"
                              : submitStatus.errorCode === "generation_rate_limit"
                                ? "border border-gray-200 bg-[#F9F7EE] font-body text-dark-gray"
                                : "border border-red-200 bg-red-50 font-body-bold text-red-700",
                          )}
                        >
                          {(submitStatus.errorCode ?? previewBlockedCode) ===
                          "generation_rate_limit" ? (
                            <span className="font-body text-dark-gray">
                              {getGenerationRateLimitMessage(t)}
                            </span>
                          ) : (submitStatus.errorCode ?? previewBlockedCode) ===
                            "preview_rate_limit" ? (
                            <div className="space-y-2 font-body text-dark-gray">
                              <p>{previewRateLimitMessage}</p>
                              <p className="text-sm text-medium-gray">
                                {t("upload.previewRateLimitWithoutPreviewHint")}
                              </p>
                              <p>
                                {t("upload.previewRateLimitOr")}
                                <Link
                                  href={previewRateLimitContactHref}
                                  className="underline underline-offset-2 hover:opacity-80"
                                >
                                  {t("upload.previewRateLimitContactLink")}
                                </Link>
                              </p>
                            </div>
                          ) : (
                            submitStatus.message
                          )}
                        </div>
                      )}
                    </div>
                  )}
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
          key={
            isInCroppingFlow
              ? `crop-pending-${currentCropIndex}-${pendingCropImages[currentCropIndex] ?? ""}-${smartCropLoading ? "loading" : smartCropArea ? `${smartCropArea.x}-${smartCropArea.y}-${smartCropArea.width}-${smartCropArea.height}` : "fallback"}`
              : `crop-edit-${editingImageIndex ?? "x"}`
          }
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
          isSmartCropLoading={Boolean(isInCroppingFlow && smartCropLoading)}
          initialSmartCropPixels={
            isInCroppingFlow ? smartCropArea : undefined
          }
          referenceFaceBoxes={editorFaceBoxes}
          onSave={handleSaveCrop}
          onCancel={handleCancelCrop}
          onChangeImage={isInCroppingFlow ? handleChangeImage : undefined}
          currentIndex={isInCroppingFlow ? currentCropIndex : undefined}
          totalImages={isInCroppingFlow ? pendingCropImages.length : undefined}
        />
      )}

      {showPreviewLoader && (
        <PreviewInitialLoadingScreen
          variant="overlay"
          imageUrls={images.slice(0, 5)}
          isExiting={false}
          isComplete={false}
          loadingLine={
            bwLoadingLines[previewLoaderLineIndex % bwLoadingLines.length] ??
            bwLoadingLines[0]
          }
          slowText={t("preview.loadingSlow")}
          standardText={t("preview.loadingDuration")}
          title={t("preview.bwLoadingTitle")}
          locale={locale}
        />
      )}

      <Footer />
    </div>
  );
}

export default function UploadPage() {
  return <UploadPageContent />;
}
