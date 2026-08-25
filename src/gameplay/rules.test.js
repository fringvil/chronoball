import { describe, expect, it } from 'vitest';
import { canTriggerSlash, getEnergyAfterSlash, resolveCollision, SLASH_COST } from './rules';

describe('slash rules', () => {
  it('allows a slash with exactly enough energy', () => {
    expect(canTriggerSlash(SLASH_COST, false)).toBe(true);
  });

  it('does not allow a slash while active or below the energy cost', () => {
    expect(canTriggerSlash(SLASH_COST - 1, false)).toBe(false);
    expect(canTriggerSlash(100, true)).toBe(false);
  });

  it('subtracts the fixed slash cost', () => {
    expect(getEnergyAfterSlash(80)).toBe(45);
  });
});

describe('collision rules', () => {
  it('ignores objects outside the collision threshold', () => {
    expect(resolveCollision(15, 15, false)).toBe('none');
  });

  it('destroys a colliding object during a slash', () => {
    expect(resolveCollision(4, 15, true)).toBe('destroy');
  });

  it('ends the game on an unslashed collision', () => {
    expect(resolveCollision(4, 15, false)).toBe('game-over');
  });
});