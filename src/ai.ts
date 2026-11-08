import { loadApiKey } from './storage';

export interface AiModel {
  id: string;
  label: string;
  vendor: string;
}

export const AI_MODELS: AiModel[] = [
  { id: 'nvidia/nemotron-3.5-super-vl:free', label: 'Nemotron 3.5 Super VL (free)', vendor: 'NVIDIA' },
  { id: 'dots-studio/dots-3-note-preview:free', label: 'Dots3-Note Preview (free)', vendor: 'Dots Studio' },
  { id: 'nvidia/nemotron-3.5-lightning:free', label: 'Nemotron 3.5 Lightning (free)', vendor: 'NVIDIA' },
  { id: 'nvidia/nemotron-3.5-content-safety:free', label: 'Nemotron 3.5 Content Safety (free)', vendor: 'NVIDIA' },
];

export interface TestResult {
  ok: boolean;
  message: string;
}

/**
 * Sends a tiny chat request to OpenRouter to verify the API key and chosen model work.
 */
export async function testModelConnection(model: string): Promise<TestResult> {
  const key = loadApiKey();
  if (!key) {
    return { ok: false, message: 'Спочатку введи і збережи API ключ' };
  }
  if (!model) {
    return { ok: false, message: 'Обери модель' };
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'X-Title': 'SplitFlat',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'user', content: 'Відповідь одним словом: працює' },
        ],
        max_tokens: 10,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      const reply = data?.choices?.[0]?.message?.content ?? '';
      return {
        ok: true,
        message: `Зв\u2019язок працює! Модель відповіла: «${String(reply).trim().slice(0, 40) || 'OK'}»`,
      };
    }

    if (res.status === 401) {
      return { ok: false, message: 'Невірний API ключ. Перевір і спробуй знову' };
    }
    if (res.status === 402) {
      return { ok: false, message: 'Недостатньо кредитів на OpenRouter' };
    }
    if (res.status === 404) {
      return { ok: false, message: 'Модель не знайдена. Обери іншу' };
    }
    const errText = await res.text().catch(() => '');
    return {
      ok: false,
      message: `Помилка ${res.status}: ${errText.slice(0, 80) || 'невідома'}`,
    };
  } catch {
    return {
      ok: false,
      message: 'Не вдалося з\u2019єднатися. Перевір інтернет або API ключ',
    };
  }
}
