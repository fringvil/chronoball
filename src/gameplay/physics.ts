export type ArcadeVelocity = {
  x: number;
  y: number;
};

export function getArcadeVelocity(dx: number, dy: number, speed: number): ArcadeVelocity {
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: (dx / length) * speed,
    y: (dy / length) * speed
  };
}
