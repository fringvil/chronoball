import { describe, expect, it } from 'vitest';
import { loadGameData, saveGameData } from './persistence';

describe('browser persistence', () => {
  it('saves and restores the registry state in localStorage', () => {
    const storage: Storage & { data: Record<string, string> } = {
      data: {},
      getItem(key: string) {
        return this.data[key] ?? null;
      },
      setItem(key: string, value: string) {
        this.data[key] = value;
      },
      removeItem(key: string) {
        delete this.data[key];
      },
      clear() {
        this.data = {};
      },
      key() {
        return null;
      },
      length: 0
    } as Storage & { data: Record<string, string> };

    const registry = {
      values: {
        currency: 180,
        'item:Laser Blaster': true,
        lastScore: 420,
        highScores: [999, 420, 180],
      },
      get: (key: string) => ({
        currency: 180,
        'item:Laser Blaster': true,
        lastScore: 420,
        highScores: [999, 420, 180],
      }[key]),
      set: (key: string, value: unknown) => {
        (registry as any)._state ??= {};
        (registry as any)._state[key] = value;
        (registry as any).values[key] = value;
      }
    } as any;

    saveGameData(registry, storage);
    const restored = loadGameData(storage);

    expect(restored.currency).toBe(180);
    expect(restored.lastScore).toBe(420);
    expect(restored.highScores).toEqual([999, 420, 180]);
    expect(restored.items['item:Laser Blaster']).toBe(true);
  });
});
