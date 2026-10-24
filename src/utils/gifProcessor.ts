import type { PixelCrop } from "react-image-crop";
import type { CropResult } from "./imageProcessor";

type MagickModule = typeof import("@imagemagick/magick-wasm");

let magickModulePromise: Promise<MagickModule> | null = null;

export interface GifProcessingOptions {
  onProgress?: (progress: number) => void;
  colors?: number; // default 256
  skipFrames?: number;
}

async function loadMagickModule(): Promise<MagickModule> {
  if (!magickModulePromise) {
    magickModulePromise = (async () => {
      const [module, wasmAsset] = await Promise.all([
        import("@imagemagick/magick-wasm"),
        import("@imagemagick/magick-wasm/magick.wasm?url"),
      ]);

      const wasmResponse = await fetch(wasmAsset.default);
      if (!wasmResponse.ok) {
        throw new Error("Failed to load ImageMagick WASM");
      }

      await module.initializeImageMagick(
        new Uint8Array(await wasmResponse.arrayBuffer()),
      );

      return module;
    })().catch((error) => {
      magickModulePromise = null;
      throw error;
    });
  }

  return magickModulePromise;
}

export async function preloadAnimatedProcessor(): Promise<void> {
  await loadMagickModule();
}

export async function cropAnimatedImage(
  image: HTMLImageElement,
  crop: PixelCrop,
  file: File,
  inputType: string,
  options: GifProcessingOptions = {},
): Promise<CropResult> {
  const { onProgress } = options;

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  const cropX = Math.round(crop.x * scaleX);
  const cropY = Math.round(crop.y * scaleY);
  const cropWidth = Math.round(crop.width * scaleX);
  const cropHeight = Math.round(crop.height * scaleY);

  onProgress?.(0.1);
  const {
    ImageMagick,
    MagickFormat,
    MagickGeometry,
  } = await loadMagickModule();

  onProgress?.(0.25);
  const inputBytes = new Uint8Array(await file.arrayBuffer());
  const inputFormat = inputType === "image/webp" ? MagickFormat.WebP : MagickFormat.Gif;
  const outputFormat = inputType === "image/webp" ? MagickFormat.WebP : MagickFormat.Gif;

  const outputBytes = ImageMagick.readCollection(
    inputBytes,
    inputFormat,
    (images) => {
      images.coalesce();
      const geometry = new MagickGeometry(cropX, cropY, cropWidth, cropHeight);

      images.forEach((frame) => frame.crop(geometry));
      images.resetPage();
      images.optimize();

      return images.write(outputFormat, (data) => new Uint8Array(data));
    },
  );

  onProgress?.(0.9);
  const blob = new Blob([outputBytes], {
    type: inputType === "image/webp" ? "image/webp" : "image/gif",
  });
  const url = URL.createObjectURL(blob);

  onProgress?.(1);

  return { blob, url };
}

export function isGifFile(file: File): boolean {
  return file.type === "image/gif";
}

export async function isAnimatedWebP(file: File): Promise<boolean> {
  if (file.type !== "image/webp") return false;

  const buffer = await file.slice(0, Math.min(file.size, 65536)).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Search for "ANIM" chunk which indicates animated WebP
  for (let i = 0; i < bytes.length - 4; i++) {
    if (
      bytes[i] === 0x41 &&     // A
      bytes[i + 1] === 0x4e && // N
      bytes[i + 2] === 0x49 && // I
      bytes[i + 3] === 0x4d    // M
    ) {
      return true;
    }
  }

  return false;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
