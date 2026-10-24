import type { PixelCrop } from "react-image-crop";
import type { OutputFormat } from "@/types";

export interface CropResult {
  blob: Blob;
  url: string;
}

export function getCroppedImage(
  image: HTMLImageElement,
  crop: PixelCrop,
  imageType: string,
  outputFormat?: OutputFormat,
  outputQuality?: number,
): Promise<CropResult> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Failed to get canvas context"));
      return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const actualWidth = Math.round(crop.width * scaleX);
    const actualHeight = Math.round(crop.height * scaleY);

    canvas.width = actualWidth;
    canvas.height = actualHeight;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      actualWidth,
      actualHeight,
    );

    const resolvedType = (!outputFormat || outputFormat === "original")
      ? imageType
      : outputFormat;

    const resolvedQuality = (resolvedType === "image/png" || resolvedType === "image/bmp")
      ? undefined
      : (outputQuality ?? 0.95);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      },
      resolvedType,
      resolvedQuality,
    );
  });
}

export function downloadBlob(url: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function getFileExtension(imageType: string): string {
  return imageType.split("/")[1] || "png";
}

const MIME_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/bmp": "bmp",
};

export function getExtensionForMime(mime: string): string {
  return MIME_TO_EXT[mime] || "png";
}
