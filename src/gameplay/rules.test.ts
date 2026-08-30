import { describe, expect, it } from 'vitest';
import {
  canTriggerLaser,
  canTriggerSlash,
  getEnergyAfterLaser,
  getEnergyAfterSlash,
  LASER_COST,
  resolveCollision,
  SLASH_BULLET_RADIUS,
  SLASH_COST,
  SLASH_HITBOX_RADIUS
} from './rules';

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

describe('laser rules', () => {
  it('allows a laser shot with exactly enough energy', () => {
    expect(canTriggerLaser(LASER_COST)).toBe(true);
  });

  it('does not allow a laser shot below the energy cost', () => {
    expect(canTriggerLaser(LASER_COST - 1)).toBe(false);
  });

  it('subtracts the fixed laser cost', () => {
    expect(getEnergyAfterLaser(80)).toBe(65);
  });
});

describe('collision rules', () => {
  it('ignores objects outside the collision threshold', () => {
    expect(resolveCollision(16, 15, false)).toBe('none');
  });

  it('destroys a colliding object during a slash', () => {
    expect(resolveCollision(4, 15, true)).toBe('destroy');
  });

  it('ends the game on an unslashed collision', () => {
    expect(resolveCollision(4, 15, false)).toBe('game-over');
  });

  it('destroys a brick that is exactly touching the slash radius', () => {
    expect(resolveCollision(SLASH_HITBOX_RADIUS, SLASH_HITBOX_RADIUS, true)).toBe('destroy');
    expect(resolveCollision(SLASH_BULLET_RADIUS, SLASH_BULLET_RADIUS, true)).toBe('destroy');
  });

  it('keeps the slash hitbox wide enough to match the animated slice', () => {
    expect(resolveCollision(29, SLASH_HITBOX_RADIUS, true)).toBe('destroy');
    expect(resolveCollision(29, SLASH_BULLET_RADIUS, true)).toBe('destroy');
  });
});