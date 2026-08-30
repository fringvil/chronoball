import Phaser from 'phaser';
import { loadHighScores } from '../gameplay/highScores';

export class HighScoreScene extends Phaser.Scene {
  constructor() {
    super('HighScoreScene');
  }

  create(data: { score?: number } = {}): void {
    window.__chronoballScene = 'HighScoreScene';
    const { width, height } = this.scale;
    const highScores = this.registry.get('highScores') ?? loadHighScores();
    const lastScore = data.score ?? this.registry.get('lastScore') ?? 0;

    this.add.rectangle(width / 2, height / 2, width, height, 0x05050d);
    this.add.text(width / 2, 80, 'HIGH SCORE TABLE', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#00ffcc',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, `LAST RUN: ${lastScore}m`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#ffb14c',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);

    const entries = highScores.length > 0 ? highScores : [0, 0, 0, 0, 0];

    entries.forEach((score: number | string, index: number) => {
      const y = 180 + index * 54;
      this.add.text(width / 2 - 80, y, `${index + 1}.`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: '#dce7ff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      this.add.text(width / 2, y, `${score}m`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: Number(score) === lastScore && Number(score) > 0 ? '#00ffcc' : '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
    });

    this.createButton(width / 2, 560, 'MAIN MENU', () => this.scene.start('MainMenuScene'));
    this.createButton(width / 2, 610, 'NEW RUN', () => this.scene.start('GameScene'));
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 190, 40, 0x101828).setStrokeStyle(1, 0x00ffcc, 0.8).setInteractive({ useHandCursor: true });
    const text = this.add.text(x, y, label, {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    bg.on('pointerdown', onClick);
  }
}
