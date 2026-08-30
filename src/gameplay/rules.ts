export const SLASH_COST = 35 as const;
export const LASER_COST = 15 as const;
export const SLASH_HITBOX_RADIUS = 30 as const;
export const SLASH_BULLET_RADIUS = 30 as const;

export function canTriggerSlash(energy: number, isSlash: boolean): boolean {
  return energy >= SLASH_COST && !isSlash;
}

export function canTriggerLaser(energy: number): boolean {
  return energy >= LASER_COST;
}

export function getEnergyAfterSlash(energy: number): number {
  return energy - SLASH_COST;
}

export function getEnergyAfterLaser(energy: number): number {
  return energy - LASER_COST;
}

export function resolveCollision(distance: number, threshold: number, isSlash: boolean): 'none' | 'destroy' | 'game-over' {
  if (distance > threshold) return 'none';
  return isSlash ? 'destroy' : 'game-over';
}