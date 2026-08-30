import { normaliseHighScores } from './highScores';

const STORAGE_KEY = 'chronoball.save';

export type PersistedGameData = {
  currency: number;
  lastScore: number;
  highScores: number[];
  items: Record<string, boolean>;
};

const defaultData = (): PersistedGameData => ({
  currency: 120,
  lastScore: 0,
  highScores: [],
  items: {}
});

function readRegistryItems(registry: { get: (key: string) => unknown; values?: Record<string, unknown>; list?: Record<string, unknown> } | undefined): Record<string, boolean> {
  const values = registry && ((registry.values ?? registry.list) ?? {});
  const items: Record<string, boolean> = {};

  Object.entries(values ?? {}).forEach(([key, value]) => {
    if (key.startsWith('item:') && value === true) {
      items[key] = true;
    }
  });

  if (!Object.keys(items).length && registry) {
    Object.keys(registry as Record<string, unknown>).forEach((key) => {
      const value = (registry as Record<string, unknown>)[key];
      if (key.startsWith('item:') && value === true) {
        items[key] = true;
      }
    });
  }

  return items;
}

export function loadGameData(storage: Storage | undefined = globalThis.localStorage): PersistedGameData {
  const fallback = defaultData();

  try {
    const rawValue = storage?.getItem(STORAGE_KEY);
    if (!rawValue) {
      return fallback;
    }

    const parsed = JSON.parse(rawValue) as Partial<PersistedGameData>;
    const highScores = normaliseHighScores(Array.isArray(parsed.highScores) ? parsed.highScores : []);
    const items = parsed.items && typeof parsed.items === 'object' ? Object.fromEntries(
      Object.entries(parsed.items).filter(([, value]) => value === true)
    ) : {};

    return {
      currency: Number(parsed.currency) || fallback.currency,
      lastScore: Number(parsed.lastScore) || fallback.lastScore,
      highScores,
      items
    };
  } catch {
    return fallback;
  }
}

export function saveGameData(
  registry: { get: (key: string) => unknown; values?: Record<string, unknown>; list?: Record<string, unknown> } | undefined,
  storage: Storage | undefined = globalThis.localStorage
): PersistedGameData {
  const currency = Number(registry?.get('currency') ?? 120);
  const lastScore = Number(registry?.get('lastScore') ?? 0);
  const highScores = normaliseHighScores(Array.isArray(registry?.get('highScores')) ? (registry?.get('highScores') as Array<number | string>) : []);
  const items = readRegistryItems(registry);
  const result: PersistedGameData = {
    currency,
    lastScore,
    highScores,
    items
  };

  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch {
    // Ignore storage failures so the game still runs if localStorage is unavailable.
  }

  return result;
}
