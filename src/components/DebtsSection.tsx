import { ArrowRight, Copy, Check, HandCoins, PartyPopper } from 'lucide-react';
import { useState } from 'react';
import type { Member } from '@/lib';
import { formatMoney } from '@/lib';
import type { Settlement } from '@/settlement';
import { Avatar } from './Avatar';

interface DebtsSectionProps {
  settlements: Settlement[];
  members: Map<string, Member>;
  onSettle: (s: Settlement) => void;
}

export function DebtsSection({
  settlements,
  members,
  onSettle,
}: DebtsSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (settlements.length === 0) return;
    const lines = settlements.map((s) => {
      const from = members.get(s.from)?.name ?? '?';
      const to = members.get(s.to)?.name ?? '?';
      return `${from} → ${to}: ${formatMoney(s.amount)}`;
    });
    const text = `SplitFlat — борги:\n${lines.join('\n')}`;
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <section className="bg-white rounded-3xl shadow-card p-5 sm:p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HandCoins size={18} className="text-brand" />
          <h2 className="font-semibold text-ink">Хто кому винен</h2>
        </div>
        {settlements.length > 0 && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-brand transition-colors"
          >
            {copied ? (
              <>
                <Check size={14} className="text-mint-dark" />
                <span className="text-mint-dark">Скопійовано</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Копіювати</span>
              </>
            )}
          </button>
        )}
      </div>

      {settlements.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center animate-pop">
          <div className="h-14 w-14 rounded-2xl bg-mint-soft flex items-center justify-center mb-3">
            <PartyPopper size={26} className="text-mint-dark" />
          </div>
          <p className="font-semibold text-ink">Усі розрахунки закриті!</p>
          <p className="text-sm text-ink-muted mt-1">
            Ніхто нікому не винен. Чудова робота!
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {settlements.map((s, i) => {
            const from = members.get(s.from);
            const to = members.get(s.to);
            if (!from || !to) return null;
            return (
              <div
                key={`${s.from}-${s.to}-${i}`}
                className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-canvas/40 p-3 hover:border-gray-200 transition-all animate-slide-in group"
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar member={from} size="sm" ring />
                  <span className="text-sm font-medium text-ink truncate max-w-[70px] sm:max-w-[90px]">
                    {from.name}
                  </span>
                </div>

                <div className="flex flex-col items-center px-1 flex-shrink-0 min-w-0">
                  <ArrowRight size={16} className="text-ink-muted" />
                  <span className="text-xs font-semibold text-ink mt-0.5 truncate max-w-[80px] sm:max-w-[110px]">
                    {formatMoney(s.amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                  <span className="text-sm font-medium text-ink truncate max-w-[70px] sm:max-w-[90px] text-right">
                    {to.name}
                  </span>
                  <Avatar member={to} size="sm" ring />
                </div>

                <button
                  onClick={() => onSettle(s)}
                  className="flex-shrink-0 rounded-xl bg-mint text-white text-xs font-semibold px-3 py-2 hover:bg-mint-dark transition-colors opacity-90 group-hover:opacity-100"
                >
                  Сплачено
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
