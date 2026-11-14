import { useEffect } from 'react';
import { Home, BarChart3, ShoppingCart, X } from 'lucide-react';

export type Section = 'home' | 'analytics' | 'shopping';

interface SideMenuProps {
  open: boolean;
  active: Section;
  onSelect: (section: Section) => void;
  onClose: () => void;
}

const ITEMS: { id: Section; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Головна', icon: Home },
  { id: 'analytics', label: 'Аналітика', icon: BarChart3 },
  { id: 'shopping', label: 'Список покупок', icon: ShoppingCart },
];

export function SideMenu({ open, active, onSelect, onClose }: SideMenuProps) {
  // close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
      aria-hidden="true"
    >
      <nav
        className="absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-white shadow-card rounded-r-3xl p-4 sm:p-5 animate-slide-left flex flex-col"
        onClick={(e) => e.stopPropagation()}
        aria-label="Навігація по розділах"
      >
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <h2 className="text-lg font-bold text-ink leading-tight">
              SplitFlat
            </h2>
            <p className="text-xs text-ink-muted leading-tight">
              Твій спільний бюджет
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-ink-muted hover:bg-canvas hover:text-ink transition-colors"
            aria-label="Закрити меню"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          {ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = id === active;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelect(id)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors text-left ${
                  isActive
                    ? 'bg-brand-soft text-brand'
                    : 'text-ink-muted hover:bg-canvas hover:text-ink'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={19} className="flex-shrink-0" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
