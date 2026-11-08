import type { Member, Expense, Payment, ExpenseShare } from './lib';
import { sumShares } from './lib';

/**
 * Compute each member's net balance (in kopiykas) for a set of expenses & payments.
 * Balance = (total paid by member) - (total share owed by member) + (received payments) - (sent payments)
 *
 * Positive => member is owed money. Negative => member owes money. Sum of all balances == 0.
 */
export function computeBalances(
  members: Member[],
  expenses: Expense[],
  payments: Payment[],
): Map<string, number> {
  const balances = new Map<string, number>();
  for (const m of members) balances.set(m.id, 0);

  for (const exp of expenses) {
    const paidBy = balances.get(exp.paidBy) ?? 0;
    balances.set(exp.paidBy, paidBy + exp.amount);
    for (const share of exp.shares) {
      const cur = balances.get(share.memberId) ?? 0;
      balances.set(share.memberId, cur - share.amount);
    }
  }

  // Apply recorded payments: sender's balance increases (they paid off debt),
  // receiver's balance decreases (they got the owed money back).
  for (const p of payments) {
    const from = balances.get(p.fromMemberId) ?? 0;
    const to = balances.get(p.toMemberId) ?? 0;
    balances.set(p.fromMemberId, from + p.amount);
    balances.set(p.toMemberId, to - p.amount);
  }

  return balances;
}

export interface Settlement {
  from: string; // member id (owes)
  to: string; // member id (is owed)
  amount: number; // kopiykas
}

/**
 * Greedy min-transfer settlement: pair the biggest debtor with the biggest creditor
 * repeatedly until all balances are ~0. Returns the minimal set of transfers.
 */
export function computeSettlements(balances: Map<string, number>): Settlement[] {
  const debtors: { id: string; amount: number }[] = [];
  const creditors: { id: string; amount: number }[] = [];

  for (const [id, bal] of balances) {
    if (bal < -1) debtors.push({ id, amount: -bal });
    else if (bal > 1) creditors.push({ id, amount: bal });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const transfer = Math.min(debtors[i].amount, creditors[j].amount);
    if (transfer > 1) {
      settlements.push({
        from: debtors[i].id,
        to: creditors[j].id,
        amount: transfer,
      });
    }
    debtors[i].amount -= transfer;
    creditors[j].amount -= transfer;
    if (debtors[i].amount <= 1) i++;
    if (creditors[j].amount <= 1) j++;
  }

  return settlements;
}

export interface BalanceSummary {
  totalSpent: number;
  userPaid: number;
  userBalance: number;
}

export function getSummary(
  expenses: Expense[],
  balances: Map<string, number>,
  activeUserId: string | null,
): BalanceSummary {
  const totalSpent = expenses.reduce((acc, e) => acc + e.amount, 0);
  const userPaid = expenses
    .filter((e) => e.paidBy === activeUserId)
    .reduce((acc, e) => acc + e.amount, 0);
  const userBalance = activeUserId ? balances.get(activeUserId) ?? 0 : 0;
  return { totalSpent, userPaid, userBalance };
}

/** Validate that manual shares sum exactly to the expense amount. */
export function validateManualShares(
  shares: ExpenseShare[],
  totalKopiykas: number,
): boolean {
  return sumShares(shares) === totalKopiykas;
}
