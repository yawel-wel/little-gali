export const CONTACT_ATTACHMENT_MAX_FILES = 5;
export const CONTACT_ATTACHMENT_MAX_FILE_BYTES = 2 * 1024 * 1024;
export const CONTACT_ATTACHMENT_MAX_TOTAL_BYTES = 10 * 1024 * 1024;

import { isAllowedUploadImageType } from "./allowed-image-types";

export function isAllowedContactImageType(file: File): boolean {
  return isAllowedUploadImageType(file);
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
