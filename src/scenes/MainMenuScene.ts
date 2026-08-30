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
    grid.setDepth(0);

    const cardWidth = Math.min(width - 30, 320);
    const cardHeight = 420;
    const cardX = width / 2 - cardWidth / 2;
    const cardY = Math.max(40, (height - cardHeight) / 2 - 8);
    const card = this.add.graphics();
    card.fillStyle(0x0d1722, 0.9);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 28);
    card.lineStyle(1.3, 0x7ef9ff, 0.18);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 28);
    card.setDepth(1);

    const headerTagY = cardY + 48;
    const titleY = cardY + 92;
    const chipY = cardY + 152;
    const firstButtonY = cardY + 214;

    const headerTag = this.add.text(width / 2, headerTagY, 'TIMELOCK // SYSTEM ONLINE', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '10px',
      color: '#b9d9ff',
      letterSpacing: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    const title = this.add.text(width / 2, titleY, 'CHRONOBALL', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '36px',
      color: '#f0f7ff',
      fontStyle: 'bold',
      letterSpacing: 4,
      stroke: '#7ef9ff',
      strokeThickness: 2.2,
      shadow: { offsetX: 0, offsetY: 0, color: '#7ef9ff', blur: 18, stroke: true, fill: true }
    }).setOrigin(0.5).setDepth(5);

    const missionText = this.add.text(width / 2, titleY + 42, 'ENTER THE LOOP. SURVIVE THE DEADLINE.', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '10px',
      color: '#9fd7ff',
      letterSpacing: 2.5,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    const chipWidth = 192;
    const chipHeight = 34;
    const chipX = width / 2 - chipWidth / 2;
    const chip = this.add.graphics();
    chip.fillStyle(0x101d2a, 0.92);
    chip.fillRoundedRect(chipX, chipY, chipWidth, chipHeight, 17);
    chip.lineStyle(1.2, 0x7ef9ff, 0.38);
    chip.strokeRoundedRect(chipX, chipY, chipWidth, chipHeight, 17);
    chip.setDepth(2);
    this.add.text(width / 2, chipY + 17, `HIGH SCORE ${highScore}m`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '12px',
      color: '#dfe9ff',
      letterSpacing: 1,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    this.createMenuButton(width / 2, firstButtonY, 'START RUN', () => {
      this.scene.start('GameScene');
    });
    this.createMenuButton(width / 2, firstButtonY + 72, 'ITEM SHOP', () => {
      this.scene.start('ShopScene');
    });
    this.createMenuButton(width / 2, firstButtonY + 144, 'HIGH SCORES', () => {
      this.scene.start('HighScoreScene');
    });

    const footerY = height - 105;
    const credits = this.add.graphics();
    credits.fillStyle(0x0f172a, 0.9);
    credits.fillRoundedRect(width / 2 - 115, footerY - 23, 230, 46, 23);
    credits.lineStyle(1.5, 0xffb14c, 0.7);
    credits.strokeRoundedRect(width / 2 - 115, footerY - 23, 230, 46, 23);
    credits.setDepth(2);
    this.add.text(width / 2, footerY, `CREDITS: ${this.registry.get('currency')} CR`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#ffb14c',
      fontStyle: 'bold',
      stroke: '#ff8b3d',
      strokeThickness: 1
    }).setOrigin(0.5).setDepth(5);

    this.add.text(width / 2, height - 32, 'Move, slash, survive, repeat.', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '12px',
      color: '#a6b8d8',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(5);

    this.tweens.add({
      targets: [title, missionText],
      y: '+=10',
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: card,
      alpha: { from: 0.7, to: 0.9 },
      duration: 2200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: headerTag,
      alpha: { from: 0.8, to: 1 },
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    this.tweens.add({
      targets: chip,
      scaleY: { from: 1, to: 1.06 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createMenuButton(x: number, y: number, label: string, onClick: () => void): void {
    const buttonWidth = 220;
    const buttonHeight = 48;
    const button = this.add.container(x, y);
    button.setDepth(3);

    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x101b29, 0.96);
    bgGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
    bgGraphics.lineStyle(1.5, 0x7ef9ff, 0.7);
    bgGraphics.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
    button.add(bgGraphics);

    const glow = this.add.graphics();
    glow.fillStyle(0x7ef9ff, 0.08);
    glow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
    glow.setDepth(2);
    button.add(glow);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '15px',
      color: '#f4fbff',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#00ffcc',
      strokeThickness: 1.2
    }).setOrigin(0.5).setDepth(4);
    button.add(text);

    const hitbox = this.add.zone(0, 0, buttonWidth, buttonHeight)
      .setInteractive({ useHandCursor: true })
      .setOrigin(0.5)
      .setDepth(5);
    button.add(hitbox);

    hitbox.on('pointerdown', () => {
      this.tweens.add({
        targets: button,
        scale: 0.97,
        duration: 80,
        yoyo: true,
        repeat: 0,
        ease: 'Cubic.easeOut',
        onComplete: onClick
      });
    });

    hitbox.on('pointerover', () => {
      this.tweens.add({ targets: button, scale: 1.03, duration: 120, ease: 'Cubic.easeOut' });
      bgGraphics.clear();
      bgGraphics.fillStyle(0x12243d, 0.98);
      bgGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
      bgGraphics.lineStyle(1.5, 0x7ef9ff, 0.9);
      bgGraphics.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
      glow.clear();
      glow.fillStyle(0x7ef9ff, 0.14);
      glow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
    });

    hitbox.on('pointerout', () => {
      this.tweens.add({ targets: button, scale: 1, duration: 120, ease: 'Cubic.easeOut' });
      bgGraphics.clear();
      bgGraphics.fillStyle(0x101b29, 0.96);
      bgGraphics.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
      bgGraphics.lineStyle(1.5, 0x7ef9ff, 0.7);
      bgGraphics.strokeRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
      glow.clear();
      glow.fillStyle(0x7ef9ff, 0.08);
      glow.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
    });
  }
}
