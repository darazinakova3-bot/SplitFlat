import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppState, Member, Expense, Payment } from '@/lib';
import {
  loadState,
  saveState,
  createInitialState,
  ensureMonth,
  createNewMonth,
  newMemberId,
} from '@/storage';
import { uid, getMonthKey, monthKeyToDate } from '@/lib';
import {
  computeBalances,
  computeSettlements,
  getSummary,
} from '@/settlement';
import type { Settlement } from '@/settlement';

import { Header } from '@/components/Header';
import { MembersSection } from '@/components/MembersSection';
import { AddExpenseForm } from '@/components/AddExpenseForm';
import { BalanceCards } from '@/components/BalanceCards';
import { DebtsSection } from '@/components/DebtsSection';
import { HistorySection } from '@/components/HistorySection';
import { CategoryChart } from '@/components/CategoryChart';
import { MonthCompareSection } from '@/components/MonthCompareSection';
import { CalendarSection } from '@/components/CalendarSection';
import { SettingsModal } from '@/components/SettingsModal';
import { EmptyMembersState } from '@/components/EmptyMembersState';
import { ToastContainer } from '@/components/Toast';
import type { ToastMessage, ToastKind } from '@/components/Toast';

function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  // persist
  useEffect(() => {
    saveState(state);
  }, [state]);

  const monthData = state.months[state.currentMonth] ?? {
    members: [],
    expenses: [],
    payments: [],
  };

  const membersMap = useMemo(() => {
    const m = new Map<string, Member>();
    for (const mem of monthData.members) m.set(mem.id, mem);
    return m;
  }, [monthData.members]);

  const balances = useMemo(
    () =>
      computeBalances(monthData.members, monthData.expenses, monthData.payments),
    [monthData.members, monthData.expenses, monthData.payments],
  );

  const settlements = useMemo(
    () => computeSettlements(balances),
    [balances],
  );

  const summary = useMemo(
    () => getSummary(monthData.expenses, balances, state.activeUserId),
    [monthData.expenses, balances, state.activeUserId],
  );

  // --- Toasts ---
  const pushToast = useCallback((text: string, kind: ToastKind = 'success') => {
    const t: ToastMessage = { id: uid(), kind, text };
    setToasts((prev) => [...prev, t]);
  }, []);

  const closeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // --- Members ---
  const addMember = (name: string) => {
    setState((prev) => {
      const next = ensureMonth(prev, prev.currentMonth);
      const month = next.months[prev.currentMonth];
      const colorIndex = month.members.length;
      const member: Member = { id: newMemberId(), name, colorIndex };
      const newMonth = { ...month, members: [...month.members, member] };
      return {
        ...next,
        months: { ...next.months, [prev.currentMonth]: newMonth },
        activeUserId: next.activeUserId ?? member.id,
      };
    });
    pushToast('Мешканця додано');
  };

  const updateMember = (id: string, name: string) => {
    setState((prev) => {
      const month = prev.months[prev.currentMonth];
      if (!month) return prev;
      const newMembers = month.members.map((m) =>
        m.id === id ? { ...m, name } : m,
      );
      return {
        ...prev,
        months: {
          ...prev.months,
          [prev.currentMonth]: { ...month, members: newMembers },
        },
      };
    });
  };

  const deleteMember = (id: string) => {
    setState((prev) => {
      const month = prev.months[prev.currentMonth];
      if (!month) return prev;
      // remove member and any expenses/payments involving them
      const newExpenses = month.expenses.filter(
        (e) => e.paidBy !== id && !e.splitBetween.includes(id),
      );
      const newPayments = month.payments.filter(
        (p) => p.fromMemberId !== id && p.toMemberId !== id,
      );
      const newMembers = month.members.filter((m) => m.id !== id);
      return {
        ...prev,
        months: {
          ...prev.months,
          [prev.currentMonth]: {
            ...month,
            members: newMembers,
            expenses: newExpenses,
            payments: newPayments,
          },
        },
        activeUserId:
          prev.activeUserId === id
            ? (newMembers[0]?.id ?? null)
            : prev.activeUserId,
      };
    });
    pushToast('Мешканця видалено', 'info');
  };

  const setActiveUser = (id: string) => {
    setState((prev) => ({ ...prev, activeUserId: id }));
  };

  // --- Expenses ---
  const addExpense = (exp: Expense) => {
    setState((prev) => {
      const month = prev.months[prev.currentMonth];
      if (!month) return prev;
      return {
        ...prev,
        months: {
          ...prev.months,
          [prev.currentMonth]: {
            ...month,
            expenses: [...month.expenses, exp],
          },
        },
      };
    });
    pushToast('Витрату успішно додано!');
  };

  const updateExpense = (exp: Expense) => {
    setState((prev) => {
      const month = prev.months[prev.currentMonth];
      if (!month) return prev;
      return {
        ...prev,
        months: {
          ...prev.months,
          [prev.currentMonth]: {
            ...month,
            expenses: month.expenses.map((e) => (e.id === exp.id ? exp : e)),
          },
        },
      };
    });
    setEditingExpense(null);
    pushToast('Витрату оновлено');
  };

  const deleteExpense = (id: string) => {
    setState((prev) => {
      const month = prev.months[prev.currentMonth];
      if (!month) return prev;
      return {
        ...prev,
        months: {
          ...prev.months,
          [prev.currentMonth]: {
            ...month,
            expenses: month.expenses.filter((e) => e.id !== id),
          },
        },
      };
    });
    pushToast('Витрату видалено', 'info');
  };

  const startEdit = (exp: Expense) => {
    setEditingExpense(exp);
    // scroll to form
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const cancelEdit = () => setEditingExpense(null);

  // --- Settlements / Payments ---
  const settleDebt = (s: Settlement) => {
    const payment: Payment = {
      id: uid(),
      fromMemberId: s.from,
      toMemberId: s.to,
      amount: s.amount,
      date: new Date().toISOString(),
      createdAt: Date.now(),
      monthKey: state.currentMonth,
    };
    setState((prev) => {
      const month = prev.months[prev.currentMonth];
      if (!month) return prev;
      return {
        ...prev,
        months: {
          ...prev.months,
          [prev.currentMonth]: {
            ...month,
            payments: [...month.payments, payment],
          },
        },
      };
    });
    pushToast('Борг позначено як сплачено');
  };

  // --- Month navigation ---
  const sortedMonthKeys = [...Object.keys(state.months)].sort();
  const monthIdx = sortedMonthKeys.indexOf(state.currentMonth);

  const goPrevMonth = () => {
    if (monthIdx > 0) {
      setState((prev) => ({ ...prev, currentMonth: sortedMonthKeys[monthIdx - 1] }));
      setEditingExpense(null);
    }
  };
  const goNextMonth = () => {
    if (monthIdx < sortedMonthKeys.length - 1) {
      setState((prev) => ({ ...prev, currentMonth: sortedMonthKeys[monthIdx + 1] }));
      setEditingExpense(null);
    }
  };

  const handleNewMonth = () => {
    setState((prev) => {
      const next = createNewMonth(prev);
      return next;
    });
    setEditingExpense(null);
    pushToast('Створено новий місяць', 'info');
  };

  // --- Settings ---
  const handleClearAll = () => {
    const fresh = createInitialState();
    setState(fresh);
    setSettingsOpen(false);
    pushToast('Усі дані очищено', 'info');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `splitflat-${getMonthKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast('Дані експортовано', 'info');
  };

  const hasMembers = monthData.members.length > 0;

  // --- Month comparison (current vs calendar-previous month) ---
  const prevMonthKey = useMemo(() => {
    const d = monthKeyToDate(state.currentMonth);
    d.setMonth(d.getMonth() - 1);
    return getMonthKey(d);
  }, [state.currentMonth]);
  const monthTotal = (data: typeof monthData) =>
    (data?.expenses ?? []).reduce((acc, e) => acc + e.amount, 0);
  const prevMonthData = state.months[prevMonthKey];

  return (
    <div className="min-h-screen bg-canvas">
      <ToastContainer toasts={toasts} onClose={closeToast} />

      <Header
        currentMonth={state.currentMonth}
        months={Object.keys(state.months)}
        onPrevMonth={goPrevMonth}
        onNextMonth={goNextMonth}
        onOpenSettings={() => setSettingsOpen(true)}
        onNewMonth={handleNewMonth}
        monthData={monthData}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-16">
        <div className="flex flex-col gap-5">
          {/* Balance cards always show */}
          <BalanceCards summary={summary} />

          {!hasMembers ? (
            <>
              <EmptyMembersState onAdd={() => setAddMembersOpen(true)} />
              <MembersSection
                members={monthData.members}
                activeUserId={state.activeUserId}
                balances={balances}
                startAdding={addMembersOpen}
                onAddingChange={setAddMembersOpen}
                onAdd={addMember}
                onUpdate={updateMember}
                onDelete={deleteMember}
                onSetActive={setActiveUser}
              />
            </>
          ) : (
            <>
              <MembersSection
                members={monthData.members}
                activeUserId={state.activeUserId}
                balances={balances}
                onAdd={addMember}
                onUpdate={updateMember}
                onDelete={deleteMember}
                onSetActive={setActiveUser}
              />

              <div ref={formRef}>
                <AddExpenseForm
                  members={monthData.members}
                  editingExpense={editingExpense}
                  onAdd={addExpense}
                  onUpdate={updateExpense}
                  onCancelEdit={cancelEdit}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DebtsSection
                  settlements={settlements}
                  members={membersMap}
                  onSettle={settleDebt}
                />
                <CategoryChart expenses={monthData.expenses} />
              </div>

              <MonthCompareSection
                currentMonthKey={state.currentMonth}
                currentTotal={monthTotal(monthData)}
                currentCount={monthData.expenses.length}
                prevMonthKey={prevMonthKey}
                prevTotal={monthTotal(prevMonthData)}
                prevCount={prevMonthData?.expenses.length ?? 0}
              />

              <CalendarSection
                currentMonthKey={state.currentMonth}
                expenses={monthData.expenses}
                members={membersMap}
              />

              <HistorySection
                expenses={monthData.expenses}
                members={membersMap}
                onEdit={startEdit}
                onDelete={deleteExpense}
              />
            </>
          )}
        </div>
      </main>

      <SettingsModal
        open={settingsOpen}
        state={state}
        onClose={() => setSettingsOpen(false)}
        onClearAll={handleClearAll}
        onExport={handleExport}
      />
    </div>
  );
}

export default App;
