export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

function getCloudinaryApiCredentials(): {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
} | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }
  return { cloudName, apiKey, apiSecret };
}

export function canSignCloudinaryUploads(): boolean {
  return getCloudinaryApiCredentials() !== null;
}

function normalizeFullPublicId(publicId: string): string {
  return publicId.replace(/\.(jpg|jpeg|png)$/i, "");
}

export function isAllowedCloudinaryUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    if (!cloudName) return false;
    return (
      parsed.protocol === "https:" &&
      parsed.hostname === "res.cloudinary.com" &&
      parsed.pathname.startsWith(`/${cloudName}/`)
    );
  } catch {
    return false;
  }
}

async function uploadToCloudinary(
  file: File | Blob,
  folder: string,
): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}

function splitAssetPath(assetPath: string): { folder: string; fileName: string } {
  const segments = assetPath.split("/");
  const fileName = segments.pop() ?? "image";
  return { folder: segments.join("/"), fileName };
}

async function uploadNamedToCloudinary(
  file: File | Blob,
  assetPath: string,
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured");
  }

  const { folder, fileName } = splitAssetPath(assetPath);
  const namedFile = new File([file], `${fileName}.jpg`, {
    type: file.type || "image/jpeg",
  });

  const sessionIdFromPath = folder.match(/sessions\/([^/]+)\//)?.[1];

  const formData = new FormData();
  formData.append("file", namedFile);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  // Unsigned presets often ignore folder for the stored public_id; setting public_id + tags
  // keeps session-scoped assets findable in Media Library search (incl. color outputs).
  formData.append("public_id", fileName);
  if (sessionIdFromPath) {
    formData.append("tags", `preview_session_${sessionIdFromPath}`);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };
  return { secureUrl: data.secure_url, publicId: data.public_id };
}

export async function uploadImageFileToCloudinary(
  file: File | Blob,
  folder = "little-gali",
): Promise<string> {
  return uploadToCloudinary(file, folder);
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  filenamePrefix: string,
): Promise<string> {
  const bytes = Uint8Array.from(buffer);
  const file = new File([bytes], `${filenamePrefix}.png`, { type: "image/png" });
  return uploadToCloudinary(file, folder);
}

export async function uploadBufferToCloudinaryPublicId(
  buffer: Buffer,
  assetPath: string,
): Promise<CloudinaryUploadResult> {
  const bytes = Uint8Array.from(buffer);
  const file = new File([bytes], `${assetPath.split("/").pop() ?? "image"}.png`, {
    type: "image/png",
  });
  return uploadNamedToCloudinary(file, assetPath);
}

export async function uploadFileToCloudinaryPublicId(
  file: File | Blob,
  assetPath: string,
): Promise<CloudinaryUploadResult> {
  return uploadNamedToCloudinary(file, assetPath);
}

/**
 * Replaces an existing Cloudinary asset in place (requires API secret).
 * Unsigned presets cannot pass overwrite; use this for preview crop saves.
 */
export async function overwriteCloudinaryAsset(
  file: File | Blob,
  fullPublicId: string,
): Promise<CloudinaryUploadResult> {
  const credentials = getCloudinaryApiCredentials();
  if (!credentials) {
    throw new Error("Cloudinary signed upload is not configured");
  }
  const { cloudName, apiKey, apiSecret } = credentials;

  const publicId = normalizeFullPublicId(fullPublicId);
  const baseName = publicId.split("/").pop() ?? "image";
  const namedFile =
    file instanceof File
      ? file
      : new File([file], `${baseName}.jpg`, {
          type: file.type || "image/jpeg",
        });

  const sessionIdFromPath = publicId.match(/sessions\/([^/]+)\//)?.[1];

  const formData = new FormData();
  formData.append("file", namedFile);
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");
  formData.append("invalidate", "true");
  if (sessionIdFromPath) {
    formData.append("tags", `preview_session_${sessionIdFromPath}`);
  }

  const basicAuth = Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      headers: { Authorization: `Basic ${basicAuth}` },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Cloudinary overwrite upload failed: ${errorText}`);
  }

  const data = (await response.json()) as {
    secure_url: string;
    public_id: string;
  };
  return { secureUrl: data.secure_url, publicId: data.public_id };
}

export async function copyCloudinaryUrlToPublicId(
  sourceUrl: string,
  assetPath: string,
): Promise<CloudinaryUploadResult> {
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch Cloudinary source: ${response.status}`);
  }
  const blob = await response.blob();
  return uploadNamedToCloudinary(blob, assetPath);
}
