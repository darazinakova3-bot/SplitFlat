import type { CategoryId, SplitMode } from './types';

export interface Member {
  id: string;
  name: string;
  colorIndex: number;
}

export interface ExpenseShare {
  memberId: string;
  /** amount in kopiykas */
  amount: number;
}

export interface Expense {
  id: string;
  /** amount in kopiykas */
  amount: number;
  title: string;
  category: CategoryId;
  paidBy: string; // member id
  splitBetween: string[]; // member ids
  splitMode: SplitMode;
  shares: ExpenseShare[];
  date: string; // ISO date string
  createdAt: number;
  monthKey: string; // YYYY-MM
  receiptPath?: string; // Local storage path for receipt image
}

export interface Payment {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  /** amount in kopiykas */
  amount: number;
  expenseId?: string; // settled against a specific expense (optional)
  date: string;
  createdAt: number;
  monthKey: string;
}

export interface MonthData {
  members: Member[];
  expenses: Expense[];
  payments: Payment[];
}

export interface AppState {
  months: Record<string, MonthData>; // key: YYYY-MM
  currentMonth: string; // YYYY-MM
  activeUserId: string | null; // "me" member id
}

// --- ID & date helpers ---

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

export function getMonthKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function monthKeyToDate(monthKey: string): Date {
  const [y, m] = monthKey.split('-').map(Number);
  return new Date(y, m - 1, 1);
}

const MONTH_NAMES_UK = [
  'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
  'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень',
];

export function formatMonthLabel(monthKey: string): string {
  const d = monthKeyToDate(monthKey);
  return `${MONTH_NAMES_UK[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
}

// --- Money helpers: all stored in kopiykas (integers) ---

export function formatMoney(kopiykas: number): string {
  const sign = kopiykas < 0 ? '-' : '';
  const abs = Math.abs(kopiykas);
  const hryvnias = Math.floor(abs / 100);
  const kop = abs % 100;
  const kopStr = kop === 0 ? '' : ',' + String(kop).padStart(2, '0');
  return `${sign}${hryvnias.toLocaleString('uk-UA')}${kopStr} ₴`;
}

export function formatMoneyShort(kopiykas: number): string {
  const sign = kopiykas < 0 ? '-' : '';
  const abs = Math.abs(kopiykas);
  const hryvnias = (abs / 100).toLocaleString('uk-UA', {
    minimumFractionDigits: abs % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${sign}${hryvnias} ₴`;
}

/** Parse a user-entered amount string into kopiykas (integer). Returns NaN on failure. */
export function parseAmountToKopiykas(input: string): number {
  if (!input) return NaN;
  const cleaned = input.replace(/\s/g, '').replace(/,/g, '.').replace(/₴/g, '');
  const num = Number(cleaned);
  if (!isFinite(num) || num <= 0) return NaN;
  return Math.round(num * 100);
}

/** Split an amount equally among N participants, distributing the remainder. */
export function splitEqual(totalKopiykas: number, memberIds: string[]): ExpenseShare[] {
  if (memberIds.length === 0 || totalKopiykas <= 0) {
    return memberIds.map((memberId) => ({ memberId, amount: 0 }));
  }
  const base = Math.floor(totalKopiykas / memberIds.length);
  const remainder = totalKopiykas - base * memberIds.length;
  return memberIds.map((memberId, i) => ({
    memberId,
    amount: base + (i < remainder ? 1 : 0),
  }));
}

export function sumShares(shares: ExpenseShare[]): number {
  return shares.reduce((acc, s) => acc + s.amount, 0);
}
