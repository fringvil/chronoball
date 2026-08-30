import { describe, expect, it } from 'vitest';
import { getArcadeVelocity } from './physics';

describe('arcade velocity helpers', () => {
  it('normalizes movement to the configured speed while preserving direction', () => {
    expect(getArcadeVelocity(30, 40, 100)).toEqual({ x: 60, y: 80 });
  });

  it('returns zero velocity when no movement vector is provided', () => {
    expect(getArcadeVelocity(0, 0, 100)).toEqual({ x: 0, y: 0 });
  });
});
