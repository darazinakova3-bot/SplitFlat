import { useEffect, useState } from 'react';
import { Users, Plus, Pencil, Trash2, Check, X, Star } from 'lucide-react';
import type { Member } from '@/lib';
import { Avatar } from './Avatar';

interface MembersSectionProps {
  members: Member[];
  activeUserId: string | null;
  balances: Map<string, number>;
  startAdding?: boolean;
  onAdd: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
  onAddingChange?: (open: boolean) => void;
}

export function MembersSection({
  members,
  activeUserId,
  balances,
  startAdding,
  onAdd,
  onUpdate,
  onDelete,
  onSetActive,
  onAddingChange,
}: MembersSectionProps) {
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (startAdding) setAdding(true);
  }, [startAdding]);

  useEffect(() => {
    onAddingChange?.(adding);
  }, [adding, onAddingChange]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = () => {
    const name = newName.trim();
    if (!name) return;
    onAdd(name);
    setNewName('');
    setAdding(false);
  };

  const handleEditStart = (m: Member) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const handleEditSave = () => {
    const name = editName.trim();
    if (name && editingId) onUpdate(editingId, name);
    setEditingId(null);
    setEditName('');
  };

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-brand" />
          <h2 className="font-semibold text-ink">Мешканці квартири</h2>
          <span className="text-sm text-ink-muted">{members.length}</span>
        </div>
        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Додати мешканця</span>
            <span className="sm:hidden">Додати</span>
          </button>
        )}
      </div>

      {adding && (
        <div className="mb-4 flex items-center gap-2 animate-pop">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
              if (e.key === 'Escape') {
                setAdding(false);
                setNewName('');
              }
            }}
            placeholder="Ім'я мешканця"
            autoFocus
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
          />
          <button
            onClick={handleAdd}
            className="p-2.5 rounded-xl bg-brand text-white hover:bg-brand-dark transition-colors"
            aria-label="Зберегти"
          >
            <Check size={18} />
          </button>
          <button
            onClick={() => {
              setAdding(false);
              setNewName('');
            }}
            className="p-2.5 rounded-xl bg-canvas text-ink-muted hover:bg-gray-200 transition-colors"
            aria-label="Скасувати"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {members.length === 0 && !adding ? (
        <p className="text-sm text-ink-muted py-2">
          Поки що нікого не додано. Натисни «Додати», щоб створити першого мешканця.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {members.map((m) => {
            const bal = balances.get(m.id) ?? 0;
            const isActive = m.id === activeUserId;
            return (
              <div
                key={m.id}
                className={`group relative rounded-2xl border p-3 transition-all animate-pop ${
                  isActive
                    ? 'border-brand bg-brand-soft'
                    : 'border-gray-100 bg-canvas/50 hover:border-gray-200'
                }`}
              >
                <button
                  onClick={() => onSetActive(m.id)}
                  className="flex items-center gap-2.5 w-full text-left"
                >
                  <Avatar member={m} ring />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink truncate flex items-center gap-1">
                      {m.name}
                      {isActive && (
                        <Star
                          size={12}
                          className="text-brand fill-brand flex-shrink-0"
                        />
                      )}
                    </p>
                    <p
                      className={`text-xs font-medium ${
                        bal > 1
                          ? 'text-mint-dark'
                          : bal < -1
                            ? 'text-danger'
                            : 'text-ink-muted'
                      }`}
                    >
                      {bal === 0
                        ? 'рівно'
                        : bal > 0
                          ? 'йому винні'
                          : 'він винен'}
                    </p>
                  </div>
                </button>

                {editingId === m.id ? (
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleEditSave();
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="flex-1 min-w-0 rounded-lg border border-gray-200 px-2 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand/40"
                    />
                    <button
                      onClick={handleEditSave}
                      className="p-1.5 rounded-lg bg-brand text-white"
                      aria-label="Зберегти"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 rounded-lg bg-canvas text-ink-muted"
                      aria-label="Скасувати"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditStart(m)}
                      className="p-1.5 rounded-lg bg-white/80 text-ink-muted hover:text-brand"
                      aria-label="Редагувати"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => onDelete(m.id)}
                      className="p-1.5 rounded-lg bg-white/80 text-ink-muted hover:text-danger"
                      aria-label="Видалити"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
