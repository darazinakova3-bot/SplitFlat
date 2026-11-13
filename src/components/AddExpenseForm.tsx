import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, AlertCircle, Calculator, Camera, ImagePlus, Trash2, Loader2, X } from 'lucide-react';
import type { Member, Expense } from '@/lib';
import { CATEGORY_LIST } from '@/types';
import type { CategoryId, SplitMode } from '@/types';
import {
  parseAmountToKopiykas,
  formatMoneyShort,
  splitEqual,
  sumShares,
  uid,
  getMonthKey,
} from '@/lib';
import { uploadReceipt, replaceReceipt, deleteReceipt, getReceiptUrl } from '@/receipts';

interface AddExpenseFormProps {
  members: Member[];
  onAdd: (exp: Expense) => void;
  editingExpense: Expense | null;
  onUpdate: (exp: Expense) => void;
  onCancelEdit: () => void;
}

interface FieldErrors {
  amount?: string;
  title?: string;
  paidBy?: string;
  splitBetween?: string;
  shares?: string;
}

export function AddExpenseForm({
  members,
  onAdd,
  editingExpense,
  onUpdate,
  onCancelEdit,
}: AddExpenseFormProps) {
  const [amountStr, setAmountStr] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryId>('groceries');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<SplitMode>('equal');
  const [manualShares, setManualShares] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [receiptPath, setReceiptPath] = useState<string | undefined>(undefined);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [receiptUploading, setReceiptUploading] = useState(false);
  const [receiptError, setReceiptError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<
    'closed' | 'starting' | 'active' | 'error'
  >('closed');
  const [cameraErrorMsg, setCameraErrorMsg] = useState('');

  // sync form when editing starts / clears
  useEffect(() => {
    if (editingExpense) {
      setAmountStr(String((editingExpense.amount / 100).toFixed(2)));
      setTitle(editingExpense.title);
      setCategory(editingExpense.category);
      setPaidBy(editingExpense.paidBy);
      setSplitBetween(editingExpense.splitBetween);
      setSplitMode(editingExpense.splitMode);
      if (editingExpense.splitMode === 'manual') {
        const map: Record<string, string> = {};
        for (const s of editingExpense.shares) {
          map[s.memberId] = (s.amount / 100).toFixed(2);
        }
        setManualShares(map);
      } else {
        setManualShares({});
      }
    } else {
      resetForm();
    }
    setReceiptPath(editingExpense?.receiptPath);
    setReceiptPreview(null);
    setReceiptError(null);
  }, [editingExpense]);

  const resetForm = () => {
    setAmountStr('');
    setTitle('');
    setCategory('groceries');
    setPaidBy('');
    setSplitBetween([]);
    setSplitMode('equal');
    setManualShares({});
    setErrors({});
    setReceiptPath(undefined);
    setReceiptPreview(null);
    setReceiptError(null);
  };

  // default select all members when none chosen
  useEffect(() => {
    if (members.length > 0 && splitBetween.length === 0 && !editingExpense) {
      setSplitBetween(members.map((m) => m.id));
    }
  }, [members, editingExpense, splitBetween]);

  const totalKop = useMemo(() => parseAmountToKopiykas(amountStr), [amountStr]);

  const computedShares = useMemo(() => {
    if (splitMode === 'equal') {
      return splitEqual(totalKop || 0, splitBetween);
    }
    return splitBetween.map((id) => ({
      memberId: id,
      amount: parseAmountToKopiykas(manualShares[id] || '0'),
    }));
  }, [splitMode, splitBetween, manualShares, totalKop]);

  const sharesSum = useMemo(() => sumShares(computedShares), [computedShares]);
  const sharesDiff = totalKop - sharesSum;

  const toggleSplit = (id: string) => {
    setSplitBetween((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const validate = (): boolean => {
    const e: FieldErrors = {};
    if (!totalKop || totalKop <= 0) e.amount = 'Введи правильну суму витрати';
    if (!title.trim()) e.title = 'Введи назву витрати';
    if (!paidBy) e.paidBy = 'Обери, хто оплатив покупку';
    if (splitBetween.length === 0)
      e.splitBetween = 'Обери хоча б одного учасника';
    if (splitMode === 'manual' && totalKop > 0 && sharesDiff !== 0) {
      e.shares = 'Сума часток не збігається із сумою витрати';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (members.length === 0) return;
    if (!validate()) return;

    const shares =
      splitMode === 'equal'
        ? splitEqual(totalKop, splitBetween)
        : splitBetween.map((id) => ({
            memberId: id,
            amount: parseAmountToKopiykas(manualShares[id] || '0'),
          }));

    if (editingExpense) {
      onUpdate({
        ...editingExpense,
        amount: totalKop,
        title: title.trim(),
        category,
        paidBy,
        splitBetween,
        splitMode,
        shares,
        receiptPath,
      });
    } else {
      const now = new Date().toISOString();
      onAdd({
        id: uid(),
        amount: totalKop,
        title: title.trim(),
        category,
        paidBy,
        splitBetween,
        splitMode,
        shares,
        date: now,
        createdAt: Date.now(),
        monthKey: getMonthKey(),
        receiptPath,
      });
    }
    resetForm();
  };

  const handleReceiptSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setReceiptError('Обери зображення (фото)');
      return;
    }
    setReceiptUploading(true);
    setReceiptError(null);
    try {
      const localPreview = URL.createObjectURL(file);
      setReceiptPreview(localPreview);
      const newPath = receiptPath
        ? await replaceReceipt(file, receiptPath)
        : await uploadReceipt(file);
      setReceiptPath(newPath);
    } catch {
      setReceiptError('Не вдалося завантажити фото. Спробуй ще раз.');
      setReceiptPreview(null);
    } finally {
      setReceiptUploading(false);
    }
  };

  const handleReceiptRemove = async () => {
    if (receiptPath) {
      try {
        await deleteReceipt(receiptPath);
      } catch {
        // ignore — file may already be gone
      }
    }
    setReceiptPath(undefined);
    setReceiptPreview(null);
  };

  const handleReceiptPreviewClick = async () => {
    if (!receiptPath) return;
    try {
      const url = await getReceiptUrl(receiptPath);
      window.open(url, '_blank');
    } catch {
      setReceiptError('Не вдалося відкрити чек');
    }
  };

  const stopCameraStream = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  const closeCamera = () => {
    stopCameraStream();
    setCameraState('closed');
  };

  const openCamera = async () => {
    // On mobile devices the native capture input opens the system camera app
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      cameraInputRef.current?.click();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraErrorMsg(
        'Камера недоступна в цьому браузері. Обери фото з файлів.',
      );
      setCameraState('error');
      return;
    }
    setCameraErrorMsg('');
    setCameraState('starting');
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1440 },
          },
          audio: false,
        });
      } catch {
        // no rear-facing camera — fall back to any available camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = stream;
      setCameraState('active');
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCameraErrorMsg(
          'Доступ до камери заборонено. Дозволь камеру в налаштуваннях браузера або обери фото вручну.',
        );
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCameraErrorMsg('Камеру не знайдено на цьому пристрої.');
      } else if (name === 'NotReadableError') {
        setCameraErrorMsg(
          'Камера зайнята іншою програмою. Закрий її та спробуй ще раз.',
        );
      } else {
        setCameraErrorMsg('Не вдалося відкрити камеру. Обери фото з файлів.');
      }
      setCameraState('error');
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          closeCamera();
          setReceiptError('Не вдалося зробити фото. Спробуй ще раз.');
          return;
        }
        const file = new File([blob], `receipt-${Date.now()}.jpg`, {
          type: 'image/jpeg',
        });
        closeCamera();
        handleReceiptSelect(file);
      },
      'image/jpeg',
      0.9,
    );
  };

  // attach the stream once the preview is rendered
  useEffect(() => {
    if (cameraState === 'active' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraState]);

  // release the camera when the form unmounts
  useEffect(() => () => stopCameraStream(), []);

  if (members.length === 0) return null;

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-ink flex items-center gap-2">
          <Plus size={18} className="text-brand" />
          {editingExpense ? 'Редагувати витрату' : 'Додати витрату'}
        </h2>
        {editingExpense && (
          <button
            onClick={() => {
              onCancelEdit();
              resetForm();
            }}
            className="text-sm text-ink-muted hover:text-ink"
          >
            Скасувати
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Amount */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-ink-muted mb-1.5">
            Сума витрати
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="0"
              className={`w-full rounded-xl border bg-canvas/50 px-3.5 py-3 pr-9 text-base font-semibold text-ink placeholder:text-ink-muted/60 placeholder:font-normal focus:outline-none focus:ring-2 transition ${
                errors.amount
                  ? 'border-danger focus:ring-danger/30'
                  : 'border-gray-200 focus:ring-brand/40 focus:border-brand'
              }`}
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted text-sm font-medium">
              ₴
            </span>
          </div>
          {errors.amount && (
            <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.amount}
            </p>
          )}
        </div>

        {/* Title */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-ink-muted mb-1.5">
            Назва витрати
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Наприклад, продукти на тиждень"
            className={`w-full rounded-xl border bg-canvas/50 px-3.5 py-3 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 transition ${
              errors.title
                ? 'border-danger focus:ring-danger/30'
                : 'border-gray-200 focus:ring-brand/40 focus:border-brand'
            }`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.title}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-ink-muted mb-1.5">
            Категорія
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryId)}
            className="w-full rounded-xl border border-gray-200 bg-canvas/50 px-3.5 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition appearance-none cursor-pointer"
          >
            {CATEGORY_LIST.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Paid by */}
        <div className="sm:col-span-1">
          <label className="block text-xs font-medium text-ink-muted mb-1.5">
            Хто заплатив
          </label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className={`w-full rounded-xl border bg-canvas/50 px-3.5 py-3 text-sm text-ink focus:outline-none focus:ring-2 transition ${
              errors.paidBy
                ? 'border-danger focus:ring-danger/30'
                : 'border-gray-200 focus:ring-brand/40 focus:border-brand'
            }`}
          >
            <option value="">Обери учасника</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {errors.paidBy && (
            <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.paidBy}
            </p>
          )}
        </div>
      </div>

      {/* Split between */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-ink-muted mb-1.5">
          Між ким поділити
        </label>
        <div className="flex flex-wrap gap-2">
          {members.map((m) => {
            const selected = splitBetween.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => toggleSplit(m.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                  selected
                    ? 'border-brand bg-brand-soft text-brand'
                    : 'border-gray-200 bg-white text-ink-muted hover:border-gray-300'
                }`}
              >
                <span
                  className={`flex items-center justify-center h-4 w-4 rounded ${
                    selected ? 'bg-brand' : 'bg-gray-200'
                  }`}
                >
                  {selected && (
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                    >
                      <path
                        d="M1 5L4 8L9 2"
                        stroke="white"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {m.name}
              </button>
            );
          })}
        </div>
        {errors.splitBetween && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <AlertCircle size={12} /> {errors.splitBetween}
          </p>
        )}
      </div>

      {/* Split mode */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-ink-muted mb-1.5">
          Спосіб розподілу
        </label>
        <div className="inline-flex rounded-xl bg-canvas p-1">
          <button
            onClick={() => setSplitMode('equal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              splitMode === 'equal'
                ? 'bg-white text-brand shadow-soft'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Порівну
          </button>
          <button
            onClick={() => setSplitMode('manual')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              splitMode === 'manual'
                ? 'bg-white text-brand shadow-soft'
                : 'text-ink-muted hover:text-ink'
            }`}
          >
            Вручну
          </button>
        </div>
      </div>

      {/* Manual shares inputs */}
      {splitMode === 'manual' && splitBetween.length > 0 && (
        <div className="mt-3 rounded-2xl bg-canvas/60 p-3 animate-fade-up">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-ink-muted">
              Частка кожного учасника
            </span>
            <span
              className={`text-xs font-semibold flex items-center gap-1 ${
                sharesDiff === 0 && totalKop > 0
                  ? 'text-mint-dark'
                  : 'text-ink-muted'
              }`}
            >
              <Calculator size={12} />
              {formatMoneyShort(sharesSum)} / {formatMoneyShort(totalKop || 0)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {splitBetween.map((id) => {
              const m = members.find((x) => x.id === id);
              if (!m) return null;
              return (
                <div key={id} className="flex items-center gap-2">
                  <span className="text-sm text-ink w-20 truncate flex-1">
                    {m.name}
                  </span>
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={manualShares[id] || ''}
                      onChange={(e) =>
                        setManualShares((prev) => ({
                          ...prev,
                          [id]: e.target.value,
                        }))
                      }
                      placeholder="0"
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 pr-7 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs">
                      ₴
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          {errors.shares && (
            <p className="mt-2 text-xs text-danger flex items-center gap-1">
              <AlertCircle size={12} /> {errors.shares}
            </p>
          )}
        </div>
      )}

      {/* Receipt attachment */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-ink-muted mb-1.5">
          Чек
        </label>

        {receiptPath || receiptPreview ? (
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-canvas/40 p-2.5">
            <button
              type="button"
              onClick={handleReceiptPreviewClick}
              className="h-16 w-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 hover:border-brand transition-colors"
              disabled={receiptUploading}
            >
              {receiptPreview ? (
                <img src={receiptPreview} alt="Чек" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-canvas">
                  {receiptUploading ? (
                    <Loader2 size={18} className="text-ink-muted animate-spin" />
                  ) : (
                    <ImagePlus size={18} className="text-ink-muted" />
                  )}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink">
                {receiptUploading ? 'Завантаження...' : 'Чек прикріплено'}
              </p>
              <p className="text-xs text-ink-muted mt-0.5">
                Натисни на фото, щоб переглянути
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleReceiptSelect(e.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleReceiptSelect(e.target.files?.[0])}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={receiptUploading}
                className="p-2 rounded-lg text-ink-muted hover:text-brand hover:bg-brand-soft transition-colors"
                aria-label="Замінити з галереї"
              >
                <ImagePlus size={16} />
              </button>
              <button
                type="button"
                onClick={handleReceiptRemove}
                disabled={receiptUploading}
                className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-soft transition-colors"
                aria-label="Видалити чек"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleReceiptSelect(e.target.files?.[0])}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleReceiptSelect(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={receiptUploading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-canvas/50 px-3 py-3 text-sm font-medium text-ink-muted hover:border-gray-300 hover:text-ink transition-all"
            >
              {receiptUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <ImagePlus size={16} />
              )}
              З галереї
            </button>
            <button
              type="button"
              onClick={openCamera}
              disabled={receiptUploading}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-canvas/50 px-3 py-3 text-sm font-medium text-ink-muted hover:border-gray-300 hover:text-ink transition-all"
            >
              {receiptUploading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Camera size={16} />
              )}
              Камера
            </button>
          </div>
        )}
        {receiptError && (
          <p className="mt-1.5 text-xs text-danger flex items-center gap-1">
            <AlertCircle size={12} /> {receiptError}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-brand text-white font-semibold py-3.5 hover:bg-brand-dark active:scale-[0.99] transition-all shadow-glow"
      >
        <Plus size={18} />
        {editingExpense ? 'Зберегти зміни' : 'Додати витрату'}
      </button>

      {/* Camera capture modal */}
      {cameraState !== 'closed' && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-up"
          onClick={closeCamera}
        >
          <div
            className="bg-white rounded-3xl shadow-card max-w-sm w-full p-6 animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {cameraState === 'error' ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-danger-soft flex items-center justify-center">
                      <Camera size={17} className="text-danger" />
                    </div>
                    <h3 className="text-lg font-bold text-ink">Камера</h3>
                  </div>
                  <button
                    onClick={closeCamera}
                    className="p-2 rounded-lg text-ink-muted hover:bg-canvas"
                    aria-label="Закрити"
                  >
                    <X size={18} />
                  </button>
                </div>
                <p className="text-sm text-danger flex items-start gap-1.5 mb-5">
                  <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                  {cameraErrorMsg}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      closeCamera();
                      fileInputRef.current?.click();
                    }}
                    className="flex-1 rounded-xl bg-brand text-white text-sm font-semibold py-2.5 hover:bg-brand-dark transition-colors"
                  >
                    Обрати фото з файлів
                  </button>
                  <button
                    onClick={closeCamera}
                    className="flex-1 rounded-xl bg-white text-ink-muted text-sm font-medium py-2.5 border border-gray-200 hover:text-ink transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-brand-soft flex items-center justify-center">
                      <Camera size={17} className="text-brand" />
                    </div>
                    <h3 className="text-lg font-bold text-ink">
                      Зробити фото чека
                    </h3>
                  </div>
                  <button
                    onClick={closeCamera}
                    className="p-2 rounded-lg text-ink-muted hover:bg-canvas"
                    aria-label="Закрити"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-ink/90 mb-4 aspect-[3/4]">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  {cameraState === 'starting' && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
                      <Loader2 size={26} className="animate-spin" />
                      <p className="text-sm">Запитуємо доступ до камери...</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={capturePhoto}
                    disabled={cameraState !== 'active'}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-brand text-white text-sm font-semibold py-2.5 hover:bg-brand-dark transition-colors disabled:opacity-60"
                  >
                    <Camera size={16} /> Зробити фото
                  </button>
                  <button
                    onClick={closeCamera}
                    className="flex-1 rounded-xl bg-white text-ink-muted text-sm font-medium py-2.5 border border-gray-200 hover:text-ink transition-colors"
                  >
                    Скасувати
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
