const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png"]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

/** iOS / macOS Photos often use HEIC; not supported for upload. */
export function isHeicLikeFile(file: File): boolean {
  const mime = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    mime === "image/heic" ||
    mime === "image/heif" ||
    mime.includes("heic") ||
    mime.includes("heif") ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

export const UPLOAD_IMAGE_ACCEPT =
  "image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png";

export function isAllowedUploadImageType(file: File): boolean {
  if (isHeicLikeFile(file)) {
    return false;
  }
  const mime = file.type.toLowerCase();
  if (mime && ALLOWED_MIME_TYPES.has(mime)) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && ALLOWED_EXTENSIONS.has(ext));
}

export function findDisallowedUploadImage(
  files: File[],
): File | undefined {
  return files.find((file) => !isAllowedUploadImageType(file));
}
