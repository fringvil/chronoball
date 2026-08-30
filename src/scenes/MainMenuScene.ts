import Phaser from 'phaser';
import { loadHighScores } from '../gameplay/highScores';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create(): void {
    window.__chronoballScene = 'MainMenuScene';
    const { width, height } = this.scale;
    const highScore = loadHighScores()[0] ?? 0;

    this.registry.set('highScores', loadHighScores());
    this.registry.set('lastScore', this.registry.get('lastScore') ?? 0);
    this.registry.set('currency', this.registry.get('currency') ?? 120);

    this.add.rectangle(width / 2, height / 2, width, height, 0x05050d).setDepth(0);

    const title = this.add.text(width / 2, 120, 'CHRONOBALL', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '34px',
      color: '#f3fbff',
      fontStyle: 'bold',
      letterSpacing: 4,
      stroke: '#00ffcc',
      strokeThickness: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 12, stroke: true, fill: true }
    }).setOrigin(0.5).setDepth(5).setVisible(true);

    this.add.text(width / 2, 155, 'NEON TIMELINE // READY', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#00ffcc',
      letterSpacing: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, 200, `HIGH SCORE: ${highScore}m`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#dfe9ff',
      letterSpacing: 1,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.createMenuButton(width / 2, 280, 'START RUN', () => {
      this.scene.start('GameScene');
    });
    this.createMenuButton(width / 2, 340, 'ITEM SHOP', () => {
      this.scene.start('ShopScene');
    });
    this.createMenuButton(width / 2, 400, 'HIGH SCORES', () => {
      this.scene.start('HighScoreScene');
    });

    this.add.text(width / 2, 520, `CREDITS: ${this.registry.get('currency')} CR`, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '14px',
      color: '#ffb14c',
      fontStyle: 'bold',
      stroke: '#ff8b3d',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, 560, 'Move, slash, survive, repeat.', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#a6b8d8',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(5);

    this.tweens.add({
      targets: title,
      y: 116,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createMenuButton(x: number, y: number, label: string, onClick: () => void): void {
    const bg = this.add.rectangle(x, y, 220, 46, 0x101828).setStrokeStyle(2, 0x00ffcc, 0.8).setInteractive({ useHandCursor: true }).setDepth(3);
    const text = this.add.text(x, y, label, {
      fontFamily: 'Arial, sans-serif',
      fontSize: '15px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#00ffcc',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(4);

    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => bg.setFillStyle(0x0f1d33));
    bg.on('pointerout', () => bg.setFillStyle(0x101828));
  }
}
