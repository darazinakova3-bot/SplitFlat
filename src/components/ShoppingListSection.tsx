import { useState } from 'react';
import { ShoppingCart, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { Member, ShoppingItem } from '@/lib';
import { uid } from '@/lib';

interface ShoppingListSectionProps {
  members: Member[];
  items: ShoppingItem[];
  onAdd: (item: ShoppingItem) => void;
  onUpdate: (item: ShoppingItem) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function ShoppingListSection({
  members,
  items,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
}: ShoppingListSectionProps) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newAssignee, setNewAssignee] = useState<string>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editQty, setEditQty] = useState('');
  const [editAssignee, setEditAssignee] = useState<string>('');

  const memberName = (id?: string | null) =>
    members.find((m) => m.id === id)?.name ?? '—';

  const resetAdd = () => {
    setNewTitle('');
    setNewQty('');
    setNewAssignee('');
    setAdding(false);
  };

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    onAdd({
      id: uid(),
      title,
      quantity: newQty.trim() || undefined,
      assignedTo: newAssignee || null,
      purchased: false,
      createdAt: Date.now(),
    });
    resetAdd();
  };

  const startEdit = (item: ShoppingItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditQty(item.quantity ?? '');
    setEditAssignee(item.assignedTo ?? '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditQty('');
    setEditAssignee('');
  };

  const saveEdit = () => {
    const title = editTitle.trim();
    if (!title || !editingId) return;
    const original = items.find((i) => i.id === editingId);
    if (!original) return;
    onUpdate({
      ...original,
      title,
      quantity: editQty.trim() || undefined,
      assignedTo: editAssignee || null,
    });
    cancelEdit();
  };

  const active = items.filter((i) => !i.purchased);
  const done = items.filter((i) => i.purchased);

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShoppingCart size={18} className="text-brand" />
          <h2 className="font-semibold text-ink">Список покупок</h2>
          <span className="text-sm text-ink-muted">{active.length}</span>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Додати покупку</span>
            <span className="sm:hidden">Додати</span>
          </button>
        )}
      </div>

      {/* Add form */}
      {adding && (
        <div className="mb-4 rounded-2xl bg-brand-soft/40 p-3 sm:p-4 flex flex-col gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') resetAdd();
            }}
            placeholder="Назва товару"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            autoFocus
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={newQty}
              onChange={(e) => setNewQty(e.target.value)}
              placeholder="Кількість (необов'язково)"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
            <select
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
            >
              <option value="">Відповідальний (необов'язково)</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={resetAdd}
              className="text-sm text-ink-muted hover:text-ink px-3 py-1.5"
            >
              Скасувати
            </button>
            <button
              onClick={handleAdd}
              disabled={!newTitle.trim()}
              className="rounded-xl bg-brand text-white text-sm font-medium px-4 py-1.5 disabled:opacity-50 hover:bg-brand-dark transition-colors"
            >
              Додати
            </button>
          </div>
        </div>
      )}

      {/* Active list */}
      {active.length === 0 && !adding ? (
        <p className="text-sm text-ink-muted py-4 text-center">
          Список покупок порожній. Додай перший товар!
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {active.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 rounded-2xl border border-slate-100 px-3 py-2"
            >
              <button
                onClick={() => onToggle(item.id)}
                className="h-5 w-5 rounded-md border border-slate-300 flex items-center justify-center hover:border-brand transition-colors"
                aria-label="Позначити купленим"
              >
                {item.purchased && <Check size={12} className="text-brand" />}
              </button>

              {editingId === item.id ? (
                <div className="flex-1 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    placeholder="Кількість"
                    className="w-24 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                  />
                  <select
                    value={editAssignee}
                    onChange={(e) => setEditAssignee(e.target.value)}
                    className="w-32 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                  >
                    <option value="">—</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-1">
                    <button
                      onClick={saveEdit}
                      className="text-brand hover:text-brand-dark"
                      aria-label="Зберегти"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="text-ink-muted hover:text-ink"
                      aria-label="Скасувати"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-ink truncate">
                      {item.title}
                      {item.quantity ? (
                        <span className="text-ink-muted font-normal">
                          {' '}
                          · {item.quantity}
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs text-ink-muted">
                      Відповідальний: {memberName(item.assignedTo)}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(item)}
                    className="text-ink-muted hover:text-ink"
                    aria-label="Редагувати"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-ink-muted hover:text-red-500"
                    aria-label="Видалити"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Purchased list */}
      {done.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-ink-muted mb-2">
            Куплено
          </h3>
          <ul className="flex flex-col gap-2">
            {done.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-2xl border border-slate-100 px-3 py-2 opacity-60"
              >
                <button
                  onClick={() => onToggle(item.id)}
                  className="h-5 w-5 rounded-md bg-brand flex items-center justify-center"
                  aria-label="Позначити некупленим"
                >
                  <Check size={12} className="text-white" />
                </button>
                {editingId === item.id ? (
                  <div className="flex-1 flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                    />
                    <input
                      type="text"
                      value={editQty}
                      onChange={(e) => setEditQty(e.target.value)}
                      placeholder="Кількість"
                      className="w-24 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                    />
                    <select
                      value={editAssignee}
                      onChange={(e) => setEditAssignee(e.target.value)}
                      className="w-32 rounded-xl border border-slate-200 px-2 py-1 text-sm"
                    >
                      <option value="">—</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                    <div className="flex gap-1">
                      <button
                        onClick={saveEdit}
                        className="text-brand hover:text-brand-dark"
                        aria-label="Зберегти"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-ink-muted hover:text-ink"
                        aria-label="Скасувати"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-ink line-through truncate">
                        {item.title}
                        {item.quantity ? ` · ${item.quantity}` : ''}
                      </div>
                      <div className="text-xs text-ink-muted">
                        Відповідальний: {memberName(item.assignedTo)}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(item)}
                      className="text-ink-muted hover:text-ink"
                      aria-label="Редагувати"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      className="text-ink-muted hover:text-red-500"
                      aria-label="Видалити"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
