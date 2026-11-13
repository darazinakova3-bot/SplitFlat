import { ArrowUpDown, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatMoneyShort, formatMonthLabel } from '@/lib';

interface MonthCompareSectionProps {
  currentMonthKey: string;
  currentTotal: number; // kopiykas
  currentCount: number;
  prevMonthKey: string;
  prevTotal: number; // kopiykas
  prevCount: number;
}

/** Ukrainian plural form for expense counts. */
const pluralExpenses = (n: number): string => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} витрата`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
    return `${n} витрати`;
  return `${n} витрат`;
};

export function MonthCompareSection({
  currentMonthKey,
  currentTotal,
  currentCount,
  prevMonthKey,
  prevTotal,
  prevCount,
}: MonthCompareSectionProps) {
  const diff = currentTotal - prevTotal;
  const percent =
    prevTotal === 0 ? null : Math.round((diff / prevTotal) * 100);
  const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';

  const trendColor =
    trend === 'up'
      ? 'text-danger'
      : trend === 'down'
        ? 'text-mint-dark'
        : 'text-ink-muted';
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendText =
    prevTotal === 0 && currentTotal === 0
      ? 'витрат не було в обох місяцях'
      : percent === null
        ? 'у попередньому місяці витрат не було'
        : trend === 'flat'
          ? 'без змін порівняно з попереднім місяцем'
          : trend === 'up'
            ? `витрати зросли на ${percent}%`
            : `витрати зменшилися на ${Math.abs(percent)}%`;

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center gap-2 mb-4">
        <ArrowUpDown size={18} className="text-brand" />
        <h2 className="font-semibold text-ink">Порівняння місяців</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl bg-canvas/60 p-4">
          <p className="text-xs font-medium text-ink-muted">
            {formatMonthLabel(currentMonthKey)}
          </p>
          <p className="text-2xl font-bold text-brand mt-1">
            {formatMoneyShort(currentTotal)}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {pluralExpenses(currentCount)}
          </p>
        </div>

        <div className="rounded-2xl bg-canvas/60 p-4">
          <p className="text-xs font-medium text-ink-muted">
            {formatMonthLabel(prevMonthKey)}
          </p>
          <p className="text-2xl font-bold text-mint-dark mt-1">
            {formatMoneyShort(prevTotal)}
          </p>
          <p className="text-xs text-ink-muted mt-1">
            {pluralExpenses(prevCount)}
          </p>
        </div>

        <div className="rounded-2xl bg-canvas/60 p-4">
          <p className="text-xs font-medium text-ink-muted">Різниця</p>
          <p className={`text-2xl font-bold mt-1 ${trendColor}`}>
            {diff > 0 ? '+' : ''}
            {formatMoneyShort(diff)}
          </p>
          <p
            className={`text-xs mt-1 flex items-center gap-1 flex-wrap ${trendColor}`}
          >
            <TrendIcon size={13} className="flex-shrink-0" />
            {trendText}
          </p>
        </div>
      </div>
    </section>
  );
}
