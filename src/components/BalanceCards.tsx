import { TrendingUp, Wallet, Scale } from 'lucide-react';
import { formatMoney } from '@/lib';
import type { BalanceSummary } from '@/settlement';

interface BalanceCardsProps {
  summary: BalanceSummary;
}

export function BalanceCards({ summary }: BalanceCardsProps) {
  const { totalSpent, userPaid, userBalance } = summary;
  const balancePositive = userBalance > 1;
  const balanceNegative = userBalance < -1;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Total spent */}
      <div className="bg-white rounded-3xl shadow-card p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-ink-muted">
            Загальні витрати
          </span>
          <div className="h-9 w-9 rounded-xl bg-brand-soft flex items-center justify-center">
            <TrendingUp size={18} className="text-brand" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-ink truncate">{formatMoney(totalSpent)}</p>
        <p className="text-xs text-ink-muted mt-1">за поточний місяць</p>
      </div>

      {/* User paid */}
      <div className="bg-white rounded-3xl shadow-card p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-ink-muted">Я заплатив</span>
          <div className="h-9 w-9 rounded-xl bg-mint-soft flex items-center justify-center">
            <Wallet size={18} className="text-mint-dark" />
          </div>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-ink truncate">{formatMoney(userPaid)}</p>
        <p className="text-xs text-ink-muted mt-1">фактично сплачено</p>
      </div>

      {/* User balance */}
      <div
        className={`rounded-3xl shadow-card p-5 animate-fade-up ${
          balancePositive
            ? 'bg-gradient-to-br from-mint to-mint-dark text-white'
            : balanceNegative
              ? 'bg-gradient-to-br from-danger to-red-600 text-white'
              : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-xs font-medium ${
              balancePositive || balanceNegative
                ? 'text-white/80'
                : 'text-ink-muted'
            }`}
          >
            Мій баланс
          </span>
          <div
            className={`h-9 w-9 rounded-xl flex items-center justify-center ${
              balancePositive || balanceNegative
                ? 'bg-white/20'
                : 'bg-canvas'
            }`}
          >
            <Scale
              size={18}
              className={
                balancePositive || balanceNegative
                  ? 'text-white'
                  : 'text-ink-muted'
              }
            />
          </div>
        </div>
        <p
          className={`text-xl sm:text-2xl font-bold truncate ${
            balancePositive || balanceNegative ? 'text-white' : 'text-ink'
          }`}
        >
          {userBalance > 1
            ? '+' + formatMoney(userBalance)
            : userBalance < -1
              ? formatMoney(userBalance)
              : formatMoney(0)}
        </p>
        <p
          className={`text-xs mt-1 ${
            balancePositive || balanceNegative ? 'text-white/80' : 'text-ink-muted'
          }`}
        >
          {balancePositive
            ? 'тобі мають повернути'
            : balanceNegative
              ? 'ти винен'
              : 'розрахунки завершені'}
        </p>
      </div>
    </div>
  );
}
