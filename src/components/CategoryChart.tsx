import { useMemo } from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import type { Expense } from '@/lib';
import { formatMoneyShort } from '@/lib';
import { CATEGORIES } from '@/types';

interface CategoryChartProps {
  expenses: Expense[];
}

export function CategoryChart({ expenses }: CategoryChartProps) {
  const segments = useMemo(() => {
    const totals = new Map<string, number>();
    let grandTotal = 0;
    for (const e of expenses) {
      totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
      grandTotal += e.amount;
    }
    const segs = [...totals.entries()]
      .map(([catId, amount]) => ({
        cat: CATEGORIES[catId as keyof typeof CATEGORIES],
        amount,
        pct: grandTotal > 0 ? (amount / grandTotal) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
    return { segs, grandTotal };
  }, [expenses]);

  if (expenses.length === 0 || segments.grandTotal === 0) {
    return (
      <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
        <div className="flex items-center gap-2 mb-4">
          <PieChartIcon size={18} className="text-brand" />
          <h2 className="font-semibold text-ink">Статистика</h2>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="h-12 w-12 rounded-full border-4 border-dashed border-gray-200 mb-3" />
          <p className="text-sm text-ink-muted">
            Додай витрати, щоб побачити розподіл за категоріями
          </p>
        </div>
      </section>
    );
  }

  // build donut segments
  const radius = 60;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <PieChartIcon size={18} className="text-brand" />
        <h2 className="font-semibold text-ink">Статистика за категоріями</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            className="-rotate-90"
          >
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="#EEF1F6"
              strokeWidth={stroke}
            />
            {segments.segs.map((seg, i) => {
              const len = (seg.pct / 100) * circumference;
              const dash = `${len} ${circumference - len}`;
              const el = (
                <circle
                  key={i}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="none"
                  stroke={seg.cat.color}
                  strokeWidth={stroke}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  className="transition-all duration-500"
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
            <span className="text-base sm:text-lg font-bold text-ink truncate max-w-full">
              {formatMoneyShort(segments.grandTotal)}
            </span>
            <span className="text-xs text-ink-muted">загалом</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full flex flex-col gap-2">
          {segments.segs.map((seg) => (
            <div key={seg.cat.id} className="flex items-center gap-2.5 min-w-0">
              <span
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.cat.color }}
              />
              <span className="text-sm text-ink flex-1 truncate">{seg.cat.label}</span>
              <span className="text-sm font-semibold text-ink truncate max-w-[90px] sm:max-w-none">
                {formatMoneyShort(seg.amount)}
              </span>
              <span className="text-xs text-ink-muted w-10 text-right">
                {seg.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
