export const SLASH_COST = 35 as const;

export function canTriggerSlash(energy: number, isSlash: boolean): boolean {
  return energy >= SLASH_COST && !isSlash;
}

export function getEnergyAfterSlash(energy: number): number {
  return energy - SLASH_COST;
}

export function resolveCollision(distance: number, threshold: number, isSlash: boolean): 'none' | 'destroy' | 'game-over' {
  if (distance >= threshold) return 'none';
  return isSlash ? 'destroy' : 'game-over';
}