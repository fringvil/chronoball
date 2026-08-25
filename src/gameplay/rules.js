export const SLASH_COST = 35;

export function canTriggerSlash(energy, isSlash) {
  return energy >= SLASH_COST && !isSlash;
}

export function getEnergyAfterSlash(energy) {
  return energy - SLASH_COST;
}

export function resolveCollision(distance, threshold, isSlash) {
  if (distance >= threshold) return 'none';
  return isSlash ? 'destroy' : 'game-over';
}