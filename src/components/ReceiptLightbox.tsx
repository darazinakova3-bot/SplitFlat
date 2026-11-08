import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getReceiptUrl } from '@/receipts';

interface ReceiptLightboxProps {
  path: string;
  onClose: () => void;
}

export function ReceiptLightbox({ path, onClose }: ReceiptLightboxProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReceiptUrl(path)
      .then((signedUrl) => {
        if (!cancelled) setUrl(signedUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-up p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
        aria-label="Закрити"
      >
        <X size={20} />
      </button>
      {error ? (
        <p className="text-white/70 text-sm">
          Не вдалося завантажити зображення чека
        </p>
      ) : url ? (
        <img
          src={url}
          alt="Чек"
          className="max-h-[90vh] max-w-full rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      )}
    </div>
  );
}
