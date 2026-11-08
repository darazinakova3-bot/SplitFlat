import { Home, Plus, ArrowDown } from 'lucide-react';

interface EmptyMembersStateProps {
  onAdd: () => void;
}

export function EmptyMembersState({ onAdd }: EmptyMembersStateProps) {
  return (
    <section className="bg-white rounded-3xl shadow-card p-8 sm:p-12 text-center animate-fade-up">
      <div className="mx-auto h-20 w-20 rounded-3xl bg-brand-soft flex items-center justify-center mb-5">
        <Home size={38} className="text-brand" />
      </div>
      <h2 className="text-xl font-bold text-ink mb-2">
        Ласкаво просимо до SplitFlat!
      </h2>
      <p className="text-ink-muted max-w-md mx-auto mb-6">
        Додай мешканців, щоб почати вести спільний бюджет. Ти зможеш записувати
        витрати, ділити їх порівну і бачити, хто кому винен.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-xl bg-brand text-white font-semibold px-6 py-3.5 hover:bg-brand-dark active:scale-[0.99] transition-all shadow-glow"
      >
        <Plus size={18} />
        Додати першого мешканця
      </button>
      <div className="mt-8 flex items-center justify-center gap-1.5 text-ink-muted animate-pulse">
        <ArrowDown size={16} />
        <span className="text-sm">або почни з форми витрат нижче</span>
      </div>
    </section>
  );
}
