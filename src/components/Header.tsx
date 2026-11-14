import { Menu, Settings, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { formatMonthLabel } from '@/lib';
import type { MonthData } from '@/lib';

interface HeaderProps {
  currentMonth: string;
  months: string[];
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onOpenSettings: () => void;
  onNewMonth: () => void;
  onOpenMenu: () => void;
  monthData: MonthData;
}

export function Header({
  currentMonth,
  months,
  onPrevMonth,
  onNextMonth,
  onOpenSettings,
  onNewMonth,
  onOpenMenu,
}: HeaderProps) {
  const sortedMonths = [...months].sort();
  const idx = sortedMonths.indexOf(currentMonth);
  const canPrev = idx > 0;
  const canNext = idx < sortedMonths.length - 1;

  return (
    <header className="sticky top-0 z-30 bg-canvas/80 backdrop-blur-md border-b border-gray-200/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onOpenMenu}
            className="h-10 w-10 rounded-2xl bg-brand flex items-center justify-center shadow-glow flex-shrink-0 text-white hover:bg-brand-dark transition-colors"
            aria-label="Відкрити меню"
            title="Меню"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-ink leading-tight truncate">
              SplitFlat
            </h1>
            <p className="text-xs text-ink-muted leading-tight truncate">
              Твій спільний бюджет
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-white rounded-xl shadow-soft px-1.5 py-1">
            <button
              onClick={onPrevMonth}
              disabled={!canPrev}
              className="p-1.5 rounded-lg text-ink-muted hover:bg-canvas hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Попередній місяць"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm font-semibold text-ink px-1 min-w-[110px] text-center">
              {formatMonthLabel(currentMonth)}
            </span>
            <button
              onClick={onNextMonth}
              disabled={!canNext}
              className="p-1.5 rounded-lg text-ink-muted hover:bg-canvas hover:text-ink transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Наступний місяць"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={onNewMonth}
            className="hidden sm:flex items-center gap-1.5 bg-white text-ink-muted hover:text-brand rounded-xl shadow-soft px-3 py-2 text-sm font-medium transition-colors"
            title="Створити новий місяць"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Новий місяць</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 rounded-xl bg-white shadow-soft text-ink-muted hover:text-brand transition-colors"
            aria-label="Налаштування"
            title="Налаштування"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
