export type ArcadeVelocity = {
  x: number;
  y: number;
};

export function getDeltaFactor(deltaMs: number, referenceMs = 1000 / 60): number {
  if (!Number.isFinite(deltaMs) || deltaMs <= 0) {
    return 1;
  }

  return deltaMs / referenceMs;
}

export function getArcadeVelocity(dx: number, dy: number, speed: number): ArcadeVelocity {
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (dx / length) * speed,
    y: (dy / length) * speed
  };
}
