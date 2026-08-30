export const MAX_HIGH_SCORES = 5 as const;

export function normaliseHighScores(scores: Array<number | string> = []): number[] {
  return [...scores]
    .filter((score) => Number.isFinite(Number(score)))
    .map((score) => Number(score))
    .sort((a, b) => b - a)
    .slice(0, MAX_HIGH_SCORES);
}

export function addHighScore(existingScores: Array<number | string> = [], newScore: number | string): number[] {
  const parsedScore = Number(newScore);
  if (!Number.isFinite(parsedScore)) {
    return normaliseHighScores(existingScores);
  }

  return normaliseHighScores([...existingScores, parsedScore]);
}

export function loadHighScores(storage: Storage | undefined = globalThis.localStorage): number[] {
  try {
    const rawValue = storage?.getItem('chronoball.highScores');
    if (!rawValue) return [];

    const parsed = JSON.parse(rawValue);
    return normaliseHighScores(Array.isArray(parsed) ? parsed : []);
  } catch {
    return [];
  }
}

export function saveHighScores(scores: Array<number | string>, storage: Storage | undefined = globalThis.localStorage): number[] {
  const normalised = normaliseHighScores(scores);

  try {
    storage?.setItem('chronoball.highScores', JSON.stringify(normalised));
  } catch {
    // Ignore storage failures so the game still runs if localStorage is unavailable.
  }

  return normalised;
}
