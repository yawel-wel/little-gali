import { randomUUID } from "crypto";
import { formatUnknownError } from "./generation-errors";
import { isR2Configured } from "@/lib/storage/r2-config";
import {
  contentTypeFromFile,
  copyUrlToKey,
  putObject,
  type StorageUploadResult,
} from "@/lib/storage/objects";
import {
  SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH,
  buildStorageDeliveryUrl,
  isAllowedStorageUrl,
  publicIdFromStorageUrl,
} from "@/lib/storage/urls";

export type CloudinaryUploadResult = StorageUploadResult;

export {
  SHOPIFY_LINE_ATTRIBUTE_MAX_LENGTH,
  isAllowedStorageUrl as isAllowedCloudinaryUrl,
  publicIdFromStorageUrl as publicIdFromCloudinaryUrl,
  buildStorageDeliveryUrl as buildCloudinaryDeliveryUrl,
};

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
  return isR2Configured() || getCloudinaryApiCredentials() !== null;
}

async function postCloudinaryUpload(
  cloudName: string,
  formData: FormData,
  headers?: HeadersInit,
): Promise<Response> {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
  try {
    return await fetch(url, { method: "POST", body: formData, headers });
  } catch (error) {
    throw new Error(
      `Cloudinary upload connect failed: ${formatUnknownError(error)}`,
      { cause: error },
    );
  }
}

function normalizeFullPublicId(publicId: string): string {
  return publicId.replace(/\.(jpg|jpeg|png|webp|gif|json)$/i, "");
}

function extensionFromFile(file: File | Blob, fallback = ".jpg"): string {
  const name = file instanceof File && file.name.includes(".")
    ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    : "";
  if (name) return name;
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "application/json") return ".json";
  return fallback;
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

  const response = await postCloudinaryUpload(cloudName, formData);

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
  extraTags: string[] = [],
): Promise<CloudinaryUploadResult> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary is not configured");
  }

  const { folder, fileName } = splitAssetPath(assetPath);
  const extension =
    file instanceof File && file.name.includes(".")
      ? file.name.slice(file.name.lastIndexOf("."))
      : ".jpg";
  const namedFile =
    file instanceof File && file.name.includes(".")
      ? file
      : new File([file], `${fileName}${extension}`, {
          type: file.type || "image/jpeg",
        });

  const sessionIdFromPath = folder.match(/sessions\/([^/]+)\//)?.[1];
  const tags = [
    ...(sessionIdFromPath ? [`preview_session_${sessionIdFromPath}`] : []),
    ...extraTags,
  ];

  const formData = new FormData();
  formData.append("file", namedFile);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);
  formData.append("public_id", fileName);
  if (tags.length > 0) {
    formData.append("tags", tags.join(","));
  }

  const response = await postCloudinaryUpload(cloudName, formData);

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

async function uploadNamed(
  file: File | Blob,
  assetPath: string,
  extraTags: string[] = [],
): Promise<CloudinaryUploadResult> {
  if (isR2Configured()) {
    return putObject(
      assetPath.replace(/^\/+/, ""),
      file,
      contentTypeFromFile(file),
    );
  }
  return uploadNamedToCloudinary(file, assetPath, extraTags);
}

export async function uploadImageFileToCloudinary(
  file: File | Blob,
  folder = "little-gali/uploads",
): Promise<string> {
  if (isR2Configured()) {
    const key = `${folder.replace(/\/+$/, "")}/${randomUUID()}${extensionFromFile(file)}`;
    const uploaded = await putObject(key, file, contentTypeFromFile(file));
    return uploaded.secureUrl;
  }
  return uploadToCloudinary(file, folder);
}

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  filenamePrefix: string,
): Promise<string> {
  const bytes = Uint8Array.from(buffer);
  const file = new File([bytes], `${filenamePrefix}.png`, { type: "image/png" });
  if (isR2Configured()) {
    const uploaded = await putObject(
      `${folder.replace(/\/+$/, "")}/${filenamePrefix}.png`,
      file,
      "image/png",
    );
    return uploaded.secureUrl;
  }
  return uploadToCloudinary(file, folder);
}

export async function uploadBufferToCloudinaryPublicId(
  buffer: Buffer,
  assetPath: string,
  extraTags: string[] = [],
): Promise<CloudinaryUploadResult> {
  const bytes = Uint8Array.from(buffer);
  const file = new File([bytes], `${assetPath.split("/").pop() ?? "image"}.png`, {
    type: "image/png",
  });
  return uploadNamed(file, assetPath, extraTags);
}

export async function uploadFileToCloudinaryPublicId(
  file: File | Blob,
  assetPath: string,
  extraTags: string[] = [],
): Promise<CloudinaryUploadResult> {
  return uploadNamed(file, assetPath, extraTags);
}

export async function uploadJsonToCloudinaryPublicId(
  payload: Record<string, unknown>,
  assetPath: string,
  extraTags: string[] = [],
): Promise<CloudinaryUploadResult> {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  const fileName = assetPath.split("/").pop() ?? "error";
  const file = new File([bytes], `${fileName}.json`, {
    type: "application/json",
  });
  return uploadNamed(file, assetPath, extraTags);
}

export async function overwriteCloudinaryBuffer(
  buffer: Buffer,
  fullPublicId: string,
): Promise<CloudinaryUploadResult> {
  const baseName = fullPublicId.split("/").pop() ?? "image";
  const file = new File([Uint8Array.from(buffer)], `${baseName}.png`, {
    type: "image/png",
  });
  return overwriteCloudinaryAsset(file, fullPublicId);
}

export async function overwriteCloudinaryAsset(
  file: File | Blob,
  fullPublicId: string,
): Promise<CloudinaryUploadResult> {
  if (isR2Configured()) {
    return putObject(
      fullPublicId.replace(/^\/+/, ""),
      file,
      contentTypeFromFile(file),
    );
  }

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

  const response = await postCloudinaryUpload(cloudName, formData, {
    Authorization: `Basic ${basicAuth}`,
  });

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
  if (isR2Configured()) {
    return copyUrlToKey(sourceUrl, assetPath.replace(/^\/+/, ""));
  }

  let response: Response;
  try {
    response = await fetch(sourceUrl);
  } catch (error) {
    throw new Error(
      `Failed to fetch Cloudinary source: ${formatUnknownError(error)}`,
      { cause: error },
    );
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch Cloudinary source: ${response.status}`);
  }
  const blob = await response.blob();
  return uploadNamedToCloudinary(blob, assetPath);
}
