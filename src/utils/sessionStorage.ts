const DATABASE_NAME = "cropin";
const DATABASE_VERSION = 1;
const STORE_NAME = "sessions";
const SESSION_KEY = "current";

const LEGACY_KEYS = [
  "cropImage",
  "cropFileName",
  "cropFileType",
  "cropFileSize",
];

export const MAX_UPLOAD_SIZE = 50 * 1024 * 1024;
export const MAX_UPLOAD_SIZE_LABEL = "50 MB";

export interface CropSessionData {
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
}

interface StoredCropSession {
  file: Blob;
  fileName: string;
  fileType: string;
  fileSize: number;
}

function clearLegacySessionStorage(): void {
  for (const key of LEGACY_KEYS) {
    sessionStorage.removeItem(key);
  }
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Failed to open image storage"));
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("Image storage operation failed"));
    transaction.onabort = () => reject(transaction.error ?? new Error("Image storage operation was aborted"));
  });
}

export function getUploadValidationError(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Selecione um arquivo de imagem.";
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return `O arquivo excede o limite de ${MAX_UPLOAD_SIZE_LABEL}.`;
  }

  return null;
}

export async function saveCropSession(file: File): Promise<void> {
  clearLegacySessionStorage();

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).put(
    {
      file,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
    } satisfies StoredCropSession,
    SESSION_KEY,
  );

  try {
    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}

export async function loadCropSession(): Promise<CropSessionData | null> {
  clearLegacySessionStorage();

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readonly");
  const request = transaction.objectStore(STORE_NAME).get(SESSION_KEY);

  try {
    const stored = await new Promise<StoredCropSession | undefined>(
      (resolve, reject) => {
        request.onsuccess = () => resolve(request.result as StoredCropSession | undefined);
        request.onerror = () => reject(request.error ?? new Error("Failed to load image storage"));
      },
    );

    if (!stored) return null;

    return {
      file: new File([stored.file], stored.fileName, { type: stored.fileType }),
      fileName: stored.fileName,
      fileType: stored.fileType,
      fileSize: stored.fileSize,
    };
  } finally {
    database.close();
  }
}

export async function clearCropSession(): Promise<void> {
  clearLegacySessionStorage();

  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, "readwrite");
  transaction.objectStore(STORE_NAME).delete(SESSION_KEY);

  try {
    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}
