export const CONTACT_ATTACHMENT_MAX_FILES = 5;
export const CONTACT_ATTACHMENT_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const CONTACT_ATTACHMENT_MAX_TOTAL_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png"]);

export function isAllowedContactImageType(file: File): boolean {
  const mime = file.type.toLowerCase();
  if (ALLOWED_MIME_TYPES.has(mime)) {
    return true;
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  return Boolean(ext && ALLOWED_EXTENSIONS.has(ext));
}

export function validateContactAttachments(
  files: File[],
): { ok: true } | { ok: false; errorKey: string; error?: string } {
  if (files.length > CONTACT_ATTACHMENT_MAX_FILES) {
    return { ok: false, errorKey: "contact.attachmentsTooMany" };
  }

  let totalSize = 0;
  for (const file of files) {
    if (!isAllowedContactImageType(file)) {
      return { ok: false, errorKey: "contact.attachmentsInvalidType" };
    }
    if (file.size > CONTACT_ATTACHMENT_MAX_FILE_BYTES) {
      return { ok: false, errorKey: "contact.attachmentsFileTooLarge" };
    }
    totalSize += file.size;
  }

  if (totalSize > CONTACT_ATTACHMENT_MAX_TOTAL_BYTES) {
    return { ok: false, errorKey: "contact.attachmentsTotalTooLarge" };
  }

  return { ok: true };
}
