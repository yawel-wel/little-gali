import {
  CONTACT_ATTACHMENT_MAX_FILES,
  isAllowedContactImageType,
  validateContactAttachments,
} from "./contact-attachment-rules";

export {
  CONTACT_ATTACHMENT_MAX_FILES,
  CONTACT_ATTACHMENT_MAX_FILE_BYTES,
  CONTACT_ATTACHMENT_MAX_TOTAL_BYTES,
  isAllowedContactImageType,
  validateContactAttachments,
} from "./contact-attachment-rules";

export async function buildContactEmailAttachments(
  files: File[],
): Promise<Array<{ filename: string; content: Buffer }>> {
  return Promise.all(
    files.map(async (file, index) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const ext =
        file.type === "image/png"
          ? "png"
          : file.name.toLowerCase().endsWith(".png")
            ? "png"
            : "jpg";
      const originalName = file.name?.trim();
      const filename =
        originalName && /\.(jpe?g|png)$/i.test(originalName)
          ? originalName
          : `attachment-${index + 1}.${ext}`;
      return { filename, content: buffer };
    }),
  );
}
