import { useEffect, useMemo, useState } from 'react';
import { Pencil, Trash2, History, ShoppingBag, X, Receipt as ReceiptIcon } from 'lucide-react';
import type { Member, Expense } from '@/lib';
import { formatMoneyShort, formatDate } from '@/lib';
import { CATEGORIES, CATEGORY_LIST } from '@/types';
import type { CategoryId } from '@/types';
import { getReceiptUrl } from '@/receipts';
import { ReceiptLightbox } from './ReceiptLightbox';

interface HistorySectionProps {
  expenses: Expense[];
  members: Map<string, Member>;
  onEdit: (exp: Expense) => void;
  onDelete: (id: string) => void;
}

export function HistorySection({
  expenses,
  members,
  onEdit,
  onDelete,
}: HistorySectionProps) {
  const [filterCategory, setFilterCategory] = useState<CategoryId | 'all'>(
    'all',
  );
  const [filterMember, setFilterMember] = useState<string>('all');
  const [lightboxPath, setLightboxPath] = useState<string | null>(null);
  const [receiptThumbs, setReceiptThumbs] = useState<Record<string, string>>({});
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => filterCategory === 'all' || e.category === filterCategory)
      .filter((e) => filterMember === 'all' || e.paidBy === filterMember)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [expenses, filterCategory, filterMember]);

  const hasFilters = filterCategory !== 'all' || filterMember !== 'all';

  const openLightbox = (path: string) => setLightboxPath(path);

  const closeLightbox = () => setLightboxPath(null);

  const loadReceiptThumb = (expenseId: string, path: string) => {
    if (receiptThumbs[expenseId]) return;
    getReceiptUrl(path)
      .then((url) => setReceiptThumbs((prev) => ({ ...prev, [expenseId]: url })))
      .catch(() => {});
  };

  const closePendingDelete = () => setPendingDelete(null);

  useEffect(() => {
    if (!pendingDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePendingDelete();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [pendingDelete]);

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <History size={18} className="text-brand" />
        <h2 className="font-semibold text-ink">Історія витрат</h2>
        <span className="text-sm text-ink-muted">{filtered.length}</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={filterCategory}
          onChange={(e) =>
            setFilterCategory(e.target.value as CategoryId | 'all')
          }
          className="rounded-xl border border-gray-200 bg-canvas/50 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer"
        >
          <option value="all">Усі категорії</option>
          {CATEGORY_LIST.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
        <select
          value={filterMember}
          onChange={(e) => setFilterMember(e.target.value)}
          className="rounded-xl border border-gray-200 bg-canvas/50 px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer"
        >
          <option value="all">Усі учасники</option>
          {[...members.values()].map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button
            onClick={() => {
              setFilterCategory('all');
              setFilterMember('all');
            }}
            className="flex items-center gap-1 text-sm text-ink-muted hover:text-ink px-2 py-2"
          >
            <X size={14} /> Скинути
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="h-14 w-14 rounded-2xl bg-brand-soft flex items-center justify-center mb-3">
            <ShoppingBag size={26} className="text-brand" />
          </div>
          <p className="font-medium text-ink">
            {expenses.length === 0
              ? 'Поки що витрат немає'
              : 'Нічого не знайдено за фільтрами'}
          </p>
          <p className="text-sm text-ink-muted mt-1 max-w-xs">
            {expenses.length === 0
              ? 'Додай першу покупку та забудь про плутанину з грошима'
              : 'Спробуй змінити фільтри або скинути їх'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-gray-100">
          {filtered.map((exp) => {
            const cat = CATEGORIES[exp.category];
            const Icon = cat.icon;
            const payer = members.get(exp.paidBy);
            return (
              <div
                key={exp.id}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 group"
              >
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: cat.bg }}
                >
                  <Icon size={18} style={{ color: cat.color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">
                    {exp.title}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs text-ink-muted">{cat.label}</span>
                    <span className="text-ink-muted text-xs">·</span>
                    <span className="text-xs text-ink-muted">
                      {formatDate(exp.date)}
                    </span>
                    {payer && (
                      <>
                        <span className="text-ink-muted text-xs">·</span>
                        <span className="text-xs text-ink-muted truncate">
                          {payer.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {exp.receiptPath && (
                  <button
                    onClick={() => openLightbox(exp.receiptPath!)}
                    onMouseEnter={() => loadReceiptThumb(exp.id, exp.receiptPath!)}
                    className="h-10 w-10 rounded-xl flex-shrink-0 overflow-hidden border border-gray-200 hover:border-brand transition-colors"
                    aria-label="Переглянути чек"
                  >
                    {receiptThumbs[exp.id] ? (
                      <img src={receiptThumbs[exp.id]} alt="Чек" className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-canvas">
                        <ReceiptIcon size={16} className="text-ink-muted" />
                      </div>
                    )}
                  </button>
                )}

                <div className="text-right flex-shrink-0 min-w-0 max-w-[120px] sm:max-w-none">
                  <p className="text-sm font-bold text-ink truncate">
                    {formatMoneyShort(exp.amount)}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {exp.splitBetween.length} ос.
                  </p>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button
                    onClick={() => onEdit(exp)}
                    className="p-2 rounded-lg text-ink-muted hover:text-brand hover:bg-brand-soft"
                    aria-label="Редагувати"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => setPendingDelete(exp)}
                    className="p-2 rounded-lg text-ink-muted hover:text-danger hover:bg-danger-soft"
                    aria-label="Видалити"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lightboxPath && (
        <ReceiptLightbox path={lightboxPath} onClose={closeLightbox} />
      )}

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-up"
          onClick={closePendingDelete}
        >
          <div
            className="bg-white rounded-3xl shadow-card max-w-sm w-full p-6 animate-pop"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-danger-soft flex items-center justify-center">
                  <Trash2 size={17} className="text-danger" />
                </div>
                <h3 className="text-lg font-bold text-ink">
                  Видалити витрату?
                </h3>
              </div>
              <button
                onClick={closePendingDelete}
                className="p-2 rounded-lg text-ink-muted hover:bg-canvas"
                aria-label="Закрити"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-canvas/60 p-4 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: CATEGORIES[pendingDelete.category].bg }}
                >
                  {(() => {
                    const Icon = CATEGORIES[pendingDelete.category].icon;
                    return (
                      <Icon
                        size={18}
                        style={{ color: CATEGORIES[pendingDelete.category].color }}
                      />
                    );
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">
                    {pendingDelete.title}
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {CATEGORIES[pendingDelete.category].label}
                  </p>
                </div>
                <p className="text-sm font-bold text-ink flex-shrink-0">
                  {formatMoneyShort(pendingDelete.amount)}
                </p>
              </div>
            </div>

            <p className="text-sm text-ink-muted mb-5">
              Витрату буде видалено з історії, а баланси та борги учасників —
              перераховано. Дію не можна скасувати.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDelete(pendingDelete.id);
                  closePendingDelete();
                }}
                className="flex-1 rounded-xl bg-danger text-white text-sm font-semibold py-2.5 hover:opacity-90 transition-opacity"
              >
                Видалити
              </button>
              <button
                onClick={closePendingDelete}
                className="flex-1 rounded-xl bg-white text-ink-muted text-sm font-medium py-2.5 border border-gray-200 hover:text-ink transition-colors"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
