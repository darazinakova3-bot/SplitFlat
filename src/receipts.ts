import { uid } from './lib';

const PREFIX = 'splitflat_receipt:';
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

/** Resize and compress an image file client-side before saving. */
async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  let { width, height } = bitmap;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    if (width >= height) {
      height = Math.round((height / width) * MAX_DIMENSION);
      width = MAX_DIMENSION;
    } else {
      width = Math.round((width / height) * MAX_DIMENSION);
      height = MAX_DIMENSION;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');
  ctx.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Не вдалося прочитати зображення'));
    reader.readAsDataURL(blob);
  });
}

async function saveReceipt(path: string, blob: Blob): Promise<void> {
  const dataUrl = await blobToDataUrl(blob);
  try {
    localStorage.setItem(PREFIX + path, dataUrl);
  } catch {
    throw new Error(
      'Недостатньо місця у сховищі браузера. Видаліть старі чеки та спробуйте ще раз.',
    );
  }
}

/** Save a receipt image and return the storage path. */
export async function uploadReceipt(file: File): Promise<string> {
  const compressed = await resizeImage(file);
  const path = `expenses/${uid()}.jpg`;
  await saveReceipt(path, compressed);
  return path;
}

/** Replace an existing receipt — deletes the old file, saves the new one. */
export async function replaceReceipt(
  file: File,
  oldPath: string,
): Promise<string> {
  await deleteReceipt(oldPath);
  return uploadReceipt(file);
}

/** Delete a receipt from storage. Silently ignores already-removed files. */
export async function deleteReceipt(path: string): Promise<void> {
  try {
    localStorage.removeItem(PREFIX + path);
  } catch {
    // ignore
  }
}

/** Get a URL for viewing a receipt (data URL stored locally). */
export async function getReceiptUrl(path: string): Promise<string> {
  const dataUrl = localStorage.getItem(PREFIX + path);
  if (!dataUrl) throw new Error('Чек не знайдено у локальному сховищі');
  return dataUrl;
}
