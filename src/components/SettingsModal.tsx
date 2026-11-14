import { useEffect, useState } from 'react';
import { X, Trash2, Download, RotateCcw, Key, Eye, EyeOff, Check, Sparkles, Loader2, AlertCircle, Palette } from 'lucide-react';
import type { AppState } from '@/lib';
import { loadApiKey, saveApiKey, loadModel, saveModel, loadTheme, saveTheme, applyTheme } from '@/storage';
import { AI_MODELS, testModelConnection } from '@/ai';
import type { TestResult } from '@/ai';
import { THEMES } from '@/themes';
import type { ThemeId } from '@/themes';

interface SettingsModalProps {
  open: boolean;
  state: AppState;
  onClose: () => void;
  onClearAll: () => void;
  onExport: () => void;
}

export function SettingsModal({
  open,
  state,
  onClose,
  onClearAll,
  onExport,
}: SettingsModalProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);
  const [model, setModel] = useState('');
  const [modelSaved, setModelSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [theme, setTheme] = useState<ThemeId>(() => loadTheme());

  const selectTheme = (id: ThemeId) => {
    saveTheme(id);
    applyTheme(id);
    setTheme(id);
  };

  useEffect(() => {
    if (open) {
      setConfirmClear(false);
      setApiKey(loadApiKey());
      setKeySaved(false);
      const savedModel = loadModel();
      const valid = AI_MODELS.find((m) => m.id === savedModel);
      setModel(valid ? savedModel : AI_MODELS[0].id);
      setModelSaved(false);
      setTestResult(null);
    }
  }, [open]);

  const handleSaveKey = () => {
    saveApiKey(apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleSaveModel = () => {
    saveModel(model);
    setModelSaved(true);
    setTimeout(() => setModelSaved(false), 2000);
  };

  const handleTest = async () => {
    // persist current inputs before testing so the test uses them
    saveApiKey(apiKey.trim());
    saveModel(model);
    setTesting(true);
    setTestResult(null);
    const result = await testModelConnection(model);
    setTestResult(result);
    setTesting(false);
  };

  if (!open) return null;

  const totalExpenses = Object.values(state.months).reduce(
    (acc, m) => acc + m.expenses.length,
    0,
  );
  const totalMembers = Object.values(state.months).reduce(
    (acc, m) => Math.max(acc, m.members.length),
    0,
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm animate-fade-up"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-card max-w-md w-full p-6 animate-pop max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-ink">Налаштування</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-ink-muted hover:bg-canvas"
            aria-label="Закрити"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-canvas/60 p-4">
            <p className="text-2xl font-bold text-brand">{totalMembers}</p>
            <p className="text-xs text-ink-muted mt-1">мешканців</p>
          </div>
          <div className="rounded-2xl bg-canvas/60 p-4">
            <p className="text-2xl font-bold text-mint-dark">{totalExpenses}</p>
            <p className="text-xs text-ink-muted mt-1">витрат</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <Palette size={15} className="text-brand" />
            <h3 className="text-sm font-semibold text-ink">Тема оформлення</h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {THEMES.map((t) => {
              const active = t.id === theme;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => selectTheme(t.id)}
                  aria-pressed={active}
                  className={`rounded-2xl border p-2.5 text-left transition-all ${
                    active
                      ? 'border-brand bg-brand-soft/40 ring-1 ring-brand/40'
                      : 'border-gray-200 hover:border-brand'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-2">
                    <span
                      className="h-5 w-5 rounded-lg border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: t.preview.canvas }}
                      aria-hidden="true"
                    />
                    <span
                      className="h-5 w-5 rounded-lg border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: t.preview.card }}
                      aria-hidden="true"
                    />
                    <span
                      className="h-5 w-5 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: t.preview.accent }}
                      aria-hidden="true"
                    />
                    {active && (
                      <Check size={14} className="text-brand ml-auto flex-shrink-0" />
                    )}
                  </div>
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      active ? 'text-brand' : 'text-ink'
                    }`}
                  >
                    {t.name}
                  </p>
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    {t.kind === 'light' ? 'Світла' : 'Темна'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted mb-1.5">
            <Key size={13} />
            OpenRouter API Key
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full rounded-xl border border-gray-200 bg-canvas/50 px-3.5 py-3 pr-10 text-sm text-ink placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition"
              />
              <button
                type="button"
                onClick={() => setShowKey((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                aria-label={showKey ? 'Сховати' : 'Показати'}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              onClick={handleSaveKey}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                keySaved
                  ? 'bg-mint text-white'
                  : 'bg-brand text-white hover:bg-brand-dark'
              }`}
            >
              {keySaved ? (
                <>
                  <Check size={16} /> Збережено
                </>
              ) : (
                'Зберегти'
              )}
            </button>
          </div>
          <p className="text-xs text-ink-muted mt-1.5">
            Зберігається локально в браузері. Використовується для майбутніх AI-функцій.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-brand/15 bg-brand-soft/40 p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Sparkles size={15} className="text-brand" />
            <h3 className="text-sm font-semibold text-ink">AI налаштування</h3>
          </div>

          <label className="block text-xs font-medium text-ink-muted mb-1.5">
            Модель штучного інтелекту
          </label>
          <select
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setTestResult(null);
            }}
            className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition appearance-none cursor-pointer mb-3"
          >
            {AI_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.vendor} · {m.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-muted mb-3">{model}</p>

          <div className="flex gap-2 mb-2">
            <button
              onClick={handleSaveModel}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                modelSaved
                  ? 'bg-mint text-white'
                  : 'bg-brand text-white hover:bg-brand-dark'
              }`}
            >
              {modelSaved ? (
                <>
                  <Check size={15} /> Збережено
                </>
              ) : (
                'Зберегти модель'
              )}
            </button>
            <button
              onClick={handleTest}
              disabled={testing}
              className="flex items-center gap-1.5 rounded-xl border border-brand/30 bg-white text-brand px-3.5 py-2.5 text-sm font-semibold hover:bg-brand-soft transition-colors disabled:opacity-60"
            >
              {testing ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Перевірка...
                </>
              ) : (
                'Перевірити зв\u2019язок'
              )}
            </button>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium animate-pop ${
                testResult.ok
                  ? 'bg-mint-soft text-mint-dark'
                  : 'bg-danger-soft text-danger'
              }`}
            >
              {testResult.ok ? (
                <Check size={14} className="flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-ink hover:border-brand hover:text-brand transition-colors w-full"
          >
            <Download size={16} />
            Експортувати дані (JSON)
          </button>

          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-3 rounded-2xl border border-gray-200 px-4 py-3 text-sm font-medium text-ink hover:border-brand hover:text-brand transition-colors w-full"
          >
            <RotateCcw size={16} />
            Перезавантажити сторінку
          </button>

          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm font-medium text-danger hover:bg-danger-soft transition-colors w-full"
            >
              <Trash2 size={16} />
              Очистити всі дані
            </button>
          ) : (
            <div className="rounded-2xl border border-danger/30 bg-danger-soft p-3 animate-pop">
              <p className="text-sm text-danger font-medium mb-2">
                Точно видалити всі дані? Це незворотно.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onClearAll}
                  className="flex-1 rounded-xl bg-danger text-white text-sm font-semibold py-2 hover:opacity-90"
                >
                  Так, видалити
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="flex-1 rounded-xl bg-white text-ink-muted text-sm font-medium py-2 border border-gray-200"
                >
                  Скасувати
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
