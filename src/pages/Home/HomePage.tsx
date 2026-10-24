import { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router";
import { Crop as CropIcon } from "lucide-react";
import { useDragDrop } from "@/hooks/useDragDrop";
import { usePaste } from "@/hooks/usePaste";
import { preloadAnimatedProcessor } from "@/utils/gifProcessor";
import {
  getUploadValidationError,
  saveCropSession,
} from "@/utils/sessionStorage";
import { Footer } from "./components/Footer";
import { DragOverlay } from "./components/DragOverlay";
import { UploadCard } from "./components/UploadCard";
import { FeatureGrid } from "./components/FeatureGrid";

export function HomePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const processFile = useCallback(
    async (file: File) => {
      const validationError = getUploadValidationError(file);
      if (validationError) {
        setUploadError(validationError);
        return;
      }

      try {
        await saveCropSession(file);
        setUploadError(null);
        navigate("/crop");
      } catch (error) {
        console.error("Erro ao salvar a imagem:", error);
        setUploadError("Não foi possível preparar a imagem. Tente novamente.");
      }
    },
    [navigate],
  );

  usePaste({ onFilePaste: processFile });

  useEffect(() => {
    document.title = "Cropin — Recorte de imagens";
  }, []);

  useEffect(() => {
    type IdleWindow = Window & {
      requestIdleCallback?: (callback: () => void) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    const idleWindow = window as IdleWindow;
    if (idleWindow.requestIdleCallback) {
      const id = idleWindow.requestIdleCallback(() => {
        void preloadAnimatedProcessor().catch((error) => {
          console.warn("Não foi possível pré-carregar o processador WASM:", error);
        });
      });

      return () => idleWindow.cancelIdleCallback?.(id);
    }

    const timeoutId = window.setTimeout(() => {
      void preloadAnimatedProcessor().catch((error) => {
        console.warn("Não foi possível pré-carregar o processador WASM:", error);
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const { isDragging, handlers } = useDragDrop({
    onFileDrop: processFile,
    listenOnDocument: true,
  });

  useEffect(() => {
    const doc = document;
    doc.addEventListener(
      "dragenter",
      handlers.handleDragEnter as EventListener,
    );
    doc.addEventListener(
      "dragleave",
      handlers.handleDragLeave as EventListener,
    );
    doc.addEventListener("dragover", handlers.handleDragOver as EventListener);
    doc.addEventListener("drop", handlers.handleDrop as EventListener);

    return () => {
      doc.removeEventListener(
        "dragenter",
        handlers.handleDragEnter as EventListener,
      );
      doc.removeEventListener(
        "dragleave",
        handlers.handleDragLeave as EventListener,
      );
      doc.removeEventListener(
        "dragover",
        handlers.handleDragOver as EventListener,
      );
      doc.removeEventListener("drop", handlers.handleDrop as EventListener);
    };
  }, [handlers]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative background">
      <DragOverlay isDragging={isDragging} />

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 z-20">
        <div className="max-w-xl w-full">
          <header className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <CropIcon className="w-7 h-7 text-[#3b82f6]" aria-hidden="true" />
              <h1 className="text-2xl font-semibold tracking-tight text-[#ededed]">
                Cropin
              </h1>
            </div>
            <p className="mt-2 text-sm text-[#888888]">
              Recorte imagens e GIFs com precisão
            </p>
          </header>
          <UploadCard
            fileInputRef={fileInputRef}
            onFileSelect={handleFileSelect}
          />
          {uploadError && (
            <p className="mt-3 text-center text-sm text-red-400" role="alert">
              {uploadError}
            </p>
          )}
          <FeatureGrid />
        </div>
      </main>

      <Footer />
    </div>
  );
}
