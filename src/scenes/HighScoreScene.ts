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

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x050b13, 0x050b13, 0x0c1724, 0x0a111a, 1);
    bg.fillRect(0, 0, width, height);
    bg.fillStyle(0x7ef9ff, 0.08);
    bg.fillCircle(width * 0.22, 180, 130);
    bg.fillStyle(0x93a9ff, 0.06);
    bg.fillCircle(width * 0.82, 170, 150);
    bg.fillStyle(0x72f5d0, 0.04);
    bg.fillCircle(width * 0.5, 640, 180);

    const grid = this.add.graphics();
    grid.lineStyle(1, 0x8bb7ff, 0.05);
    for (let x = 0; x <= width; x += 24) {
      grid.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y <= height; y += 24) {
      grid.lineBetween(0, y, width, y);
    }

    const cardWidth = Math.min(width - 28, 338);
    const cardHeight = 640;
    const cardX = width / 2 - cardWidth / 2;
    const cardY = 26;
    const card = this.add.graphics();
    card.fillStyle(0x0d1722, 0.9);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 28);
    card.lineStyle(1.3, 0x7ef9ff, 0.18);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 28);
    card.setDepth(1);

    const headerTag = this.add.text(width / 2, 70, 'ARCHIVE // RECORDS', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '10px',
      color: '#b9d9ff',
      letterSpacing: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    const title = this.add.text(width / 2, 108, 'HIGH SCORE TABLE', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '28px',
      color: '#edf5ff',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#7ef9ff',
      strokeThickness: 2.2
    }).setOrigin(0.5).setDepth(5);

    const pod = this.add.graphics();
    pod.fillStyle(0x101d2a, 0.95);
    pod.fillRoundedRect(width / 2 - 120, 136, 240, 34, 17);
    pod.lineStyle(1.2, 0xffb14c, 0.45);
    pod.strokeRoundedRect(width / 2 - 120, 136, 240, 34, 17);
    pod.setDepth(2);
    this.add.text(width / 2, 153, `LAST RUN: ${lastScore}m`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '12px',
      color: '#ffb14c',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(5);

    const entries = highScores.length > 0 ? highScores : [0, 0, 0, 0, 0];
    const list = this.add.container(width / 2, 210);
    entries.forEach((score: number | string, index: number) => {
      const rowGraphics = this.add.graphics();
      rowGraphics.fillStyle(0x0d1425, 0.8);
      rowGraphics.fillRoundedRect(-136, index * 52 - 18, 272, 38, 16);
      rowGraphics.lineStyle(1, Number(score) === lastScore && Number(score) > 0 ? 0x00ffcc : 0x334b74, 0.8);
      rowGraphics.strokeRoundedRect(-136, index * 52 - 18, 272, 38, 16);
      const rank = this.add.text(-110, index * 52, `${index + 1}.`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '18px',
        color: '#dce7ff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      const value = this.add.text(0, index * 52, `${score}m`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '18px',
        color: Number(score) === lastScore && Number(score) > 0 ? '#00ffcc' : '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5, 0.5);
      list.add([rowGraphics, rank, value]);
    });

    this.createButton(width / 2, 570, 'MAIN MENU', () => this.scene.start('MainMenuScene'));
    this.createButton(width / 2, 625, 'NEW RUN', () => this.scene.start('GameScene'));
    pod.setDepth(1);
    list.setDepth(2);

    this.tweens.add({
      targets: title,
      y: 102,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): void {
    const button = this.add.container(x, y);
    button.setDepth(20);
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x101828, 0.95);
    bgGraphics.fillRoundedRect(-105, -21, 210, 42, 18);
    bgGraphics.lineStyle(1.2, 0x00ffcc, 0.8);
    bgGraphics.strokeRoundedRect(-105, -21, 210, 42, 18);
    const bg = this.add.zone(0, 0, 210, 42).setInteractive({ useHandCursor: true });
    bg.setDepth(21);
    const text = this.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);
    text.setDepth(22);
    button.add([bgGraphics, bg, text]);

    bg.on('pointerdown', onClick);
    bg.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: 1.03, duration: 110, ease: 'Cubic.easeOut' });
    });
    bg.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 110, ease: 'Cubic.easeOut' });
    });
  }
}
