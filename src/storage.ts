import type { AppState, MonthData } from './lib';
import { getMonthKey, uid } from './lib';

const STORAGE_KEY = 'splitflat_state_v1';
const API_KEY_STORAGE = 'splitflat_openrouter_key';
const MODEL_STORAGE = 'splitflat_openrouter_model';

function createInitialMonth(): MonthData {
  return { members: [], expenses: [], payments: [], shopping: [] };
}

export function createInitialState(): AppState {
  const month = getMonthKey();
  return {
    months: { [month]: createInitialMonth() },
    currentMonth: month,
    activeUserId: null,
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed.months || !parsed.currentMonth) return createInitialState();
    // Ensure current month exists
    if (!parsed.months[parsed.currentMonth]) {
      parsed.months[parsed.currentMonth] = createInitialMonth();
    }
    // Migrate older states: ensure shopping array exists
    for (const key of Object.keys(parsed.months)) {
      const m = parsed.months[key];
      if (!m.shopping) m.shopping = [];
    }
    return parsed;
  } catch {
    return createInitialState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export function ensureMonth(state: AppState, monthKey: string): AppState {
  if (state.months[monthKey]) return state;
  return {
    ...state,
    months: { ...state.months, [monthKey]: createInitialMonth() },
  };
}

/** Create a new empty month, carrying over members from the most recent month. */
export function createNewMonth(state: AppState, monthKey?: string): AppState {
  const target = monthKey ?? getMonthKey(new Date(Date.now() + 30 * 24 * 3600 * 1000));
  if (state.months[target]) {
    return { ...state, currentMonth: target };
  }
  // carry over members from current month
  const current = state.months[state.currentMonth];
  const newMonth: MonthData = {
    members: current?.members.map((m) => ({ ...m })) ?? [],
    expenses: [],
    payments: [],
    shopping: [],
  };
  return {
    ...state,
    months: { ...state.months, [target]: newMonth },
    currentMonth: target,
  };
}

/** Generate stable-ish IDs for new members. */
export function newMemberId(): string {
  return 'm_' + uid();
}

export function loadApiKey(): string {
  try {
    return localStorage.getItem(API_KEY_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function saveApiKey(key: string): void {
  try {
    if (key) localStorage.setItem(API_KEY_STORAGE, key);
    else localStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // ignore
  }
}

export function loadModel(): string {
  try {
    return localStorage.getItem(MODEL_STORAGE) ?? '';
  } catch {
    return '';
  }
}

export function saveModel(model: string): void {
  try {
    if (model) localStorage.setItem(MODEL_STORAGE, model);
    else localStorage.removeItem(MODEL_STORAGE);
  } catch {
    // ignore
  }
}
