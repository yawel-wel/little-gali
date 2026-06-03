import type { Area } from "react-easy-crop";

export type CropState = {
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels?: { x: number; y: number; width: number; height: number };
};

export async function getCroppedBlob(
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
