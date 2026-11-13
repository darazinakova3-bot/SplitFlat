import { useMemo, useState } from 'react';
import { CalendarDays, ChevronDown } from 'lucide-react';
import type { Expense, Member } from '@/lib';
import { formatMoneyShort } from '@/lib';
import { CATEGORIES } from '@/types';

interface CalendarSectionProps {
  currentMonthKey: string; // YYYY-MM
  expenses: Expense[];
  members: Map<string, Member>;
}

interface DayData {
  total: number; // kopiykas
  items: Expense[];
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

const pad2 = (n: number) => String(n).padStart(2, '0');

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

/** Ukrainian plural form for expense counts. */
const pluralExpenses = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} витрата`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} витрати`;
  return `${n} витрат`;
};

export function CalendarSection({
  currentMonthKey,
  expenses,
  members,
}: CalendarSectionProps) {
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // group expenses by local calendar day
  const days = useMemo(() => {
    const map = new Map<string, DayData>();
    for (const e of expenses) {
      const key = dayKey(new Date(e.date));
      const cur = map.get(key) ?? { total: 0, items: [] };
      cur.total += e.amount;
      cur.items.push(e);
      map.set(key, cur);
    }
    return map;
  }, [expenses]);

  // month grid metadata
  const grid = useMemo(() => {
    const [y, m] = currentMonthKey.split('-').map(Number);
    const first = new Date(y, m - 1, 1);
    const daysInMonth = new Date(y, m, 0).getDate();
    // Monday-first offset
    const offset = (first.getDay() + 6) % 7;
    const todayKey = dayKey(new Date());
    return {
      offset,
      daysInMonth,
      todayKey,
      monthLabel: first.toLocaleDateString('uk-UA', {
        month: 'long',
        year: 'numeric',
      }),
    };
  }, [currentMonthKey]);

  const cells = useMemo(() => {
    const arr: (number | null)[] = Array(grid.offset).fill(null);
    for (let d = 1; d <= grid.daysInMonth; d++) arr.push(d);
    return arr;
  }, [grid]);

  const selected = selectedDay ? days.get(selectedDay) : undefined;

  return (
    <section className="bg-white rounded-3xl shadow-card p-4 sm:p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays size={18} className="text-brand" />
        <h2 className="font-semibold text-ink">Календар витрат</h2>
        <span className="text-sm text-ink-muted">{days.size}</span>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] sm:text-xs font-medium text-ink-muted py-1"
          >
            {w}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const key = `${currentMonthKey}-${pad2(day)}`;
          const data = days.get(key);
          const hasExpenses = Boolean(data);
          const isToday = key === grid.todayKey;
          const isSelected = key === selectedDay;
          return (
            <button
              key={key}
              type="button"
              disabled={!hasExpenses}
              onClick={() => setSelectedDay(isSelected ? null : key)}
              className={`rounded-lg sm:rounded-xl p-0.5 sm:p-1.5 text-center transition-colors min-w-0 ${
                isSelected
                  ? 'bg-brand text-white'
                  : hasExpenses
                    ? 'bg-brand-soft hover:bg-brand-soft/70 cursor-pointer'
                    : 'cursor-default'
              } ${isToday && !isSelected ? 'ring-1 ring-brand/50' : ''}`}
              aria-label={
                hasExpenses
                  ? `Витрати за ${day} число: ${formatMoneyShort(data!.total)}`
                  : `${day} число, без витрат`
              }
            >
              <span
                className={`block text-[11px] sm:text-sm font-semibold leading-tight ${
                  isSelected
                    ? 'text-white'
                    : hasExpenses
                      ? 'text-brand'
                      : 'text-ink-muted'
                }`}
              >
                {day}
              </span>
              {data && (
                <span
                  className={`hidden sm:block text-[10px] font-medium truncate leading-tight ${
                    isSelected ? 'text-white/90' : 'text-brand/80'
                  }`}
                >
                  {formatMoneyShort(data.total)}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day expenses */}
      {selectedDay && selected && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-canvas/40 p-3 animate-pop">
          <button
            type="button"
            onClick={() => setSelectedDay(null)}
            className="w-full flex items-center justify-between gap-2 mb-2 group"
          >
            <p className="text-sm font-semibold text-ink text-left">
              {new Date(selectedDay).toLocaleDateString('uk-UA', {
                day: 'numeric',
                month: 'long',
                weekday: 'long',
              })}
              <span className="text-ink-muted font-normal">
                {' '}
                · {pluralExpenses(selected.items.length)} ·{' '}
                {formatMoneyShort(selected.total)}
              </span>
            </p>
            <ChevronDown
              size={15}
              className="text-ink-muted group-hover:text-ink transition-colors flex-shrink-0"
            />
          </button>

          <div className="flex flex-col divide-y divide-gray-100">
            {selected.items
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((exp) => {
                const cat = CATEGORIES[exp.category];
                const Icon = cat.icon;
                const payer = members.get(exp.paidBy);
                return (
                  <div
                    key={exp.id}
                    className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                  >
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: cat.bg }}
                    >
                      <Icon size={16} style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink truncate">
                        {exp.title}
                      </p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {cat.label}
                        {payer && ` · ${payer.name}`}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-ink flex-shrink-0">
                      {formatMoneyShort(exp.amount)}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </section>
  );
}
