import { supabase } from './supabaseClient';
import { uid } from './lib';

const BUCKET = 'receipts';
const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

/** Resize and compress an image file client-side before upload. */
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

/** Upload a receipt image and return the storage path. */
export async function uploadReceipt(file: File): Promise<string> {
  const compressed = await resizeImage(file);
  const path = `expenses/${uid()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed, { contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

/** Replace an existing receipt — deletes the old file, uploads new one. */
export async function replaceReceipt(
  file: File,
  oldPath: string,
): Promise<string> {
  await deleteReceipt(oldPath);
  return uploadReceipt(file);
}

/** Delete a receipt from storage. Silently ignores already-removed files. */
export async function deleteReceipt(path: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error && !error.message.includes('not found')) throw error;
}

/** Get a short-lived signed URL for viewing a receipt. */
export async function getReceiptUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
