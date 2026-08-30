import { describe, expect, it } from 'vitest';
import { addHighScore, normaliseHighScores } from './highScores';

describe('high score helpers', () => {
  it('keeps a sorted list of the best five scores', () => {
    expect(normaliseHighScores([120, 450, 200, 999, 300, 50, 800])).toEqual([999, 800, 450, 300, 200]);
  });

  it('adds a new score and trims extras', () => {
    expect(addHighScore([1200, 900, 700, 500, 400], 650)).toEqual([1200, 900, 700, 650, 500]);
  });
});
