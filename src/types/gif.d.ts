declare module "gif.js" {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    background?: string;
    repeat?: number;
    transparent?: number | null;
    dither?: boolean | string;
  }

  interface FrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image:
        | CanvasRenderingContext2D
        | HTMLCanvasElement
        | HTMLImageElement
        | ImageData,
      options?: FrameOptions,
    ): void;
    on(event: "finished", callback: (blob: Blob) => void): void;
    on(event: "error", callback: (error: Error) => void): void;
    on(event: "progress", callback: (progress: number) => void): void;
    on(event: "start" | "abort", callback: () => void): void;
    render(): void;
    abort(): void;
  }

  export default GIF;
}

declare module "gifuct-js" {
  interface GIFData {
    header: unknown;
    lsd: unknown;
    gct: unknown;
    frames: unknown[];
  }

  interface Frame {
    patch: Uint8ClampedArray;
    delay: number;
    dims: {
      width: number;
      height: number;
      top: number;
      left: number;
    };
    disposalType: number;
    transparentIndex?: number;
  }

  export function parseGIF(arrayBuffer: ArrayBuffer): GIFData;
  export function decompressFrames(gif: GIFData, buildPatch: boolean): Frame[];
}

declare module "gifenc" {
  interface WriteFrameOptions {
    palette?: number[][];
    delay?: number;
    transparent?: boolean;
    transparentIndex?: number;
    dispose?: number;
  }

  interface GIFEncoderInstance {
    writeFrame(
      indexedPixels: Uint8Array,
      width: number,
      height: number,
      options?: WriteFrameOptions,
    ): void;
    finish(): void;
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
  }

  export function GIFEncoder(): GIFEncoderInstance;
  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: { format?: string },
  ): number[][];
  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: number[][],
    format?: string,
  ): Uint8Array;
}
