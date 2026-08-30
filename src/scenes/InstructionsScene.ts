import Phaser from 'phaser';

export class InstructionsScene extends Phaser.Scene {
  constructor() {
    super('InstructionsScene');
  }

  create(): void {
    window.__chronoballScene = 'InstructionsScene';
    const { width, height } = this.scale;

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

    const cardWidth = Math.min(width - 30, 440);
    const cardHeight = Math.min(height - 52, 610);
    const cardX = width / 2 - cardWidth / 2;
    const cardY = (height - cardHeight) / 2;
    const card = this.add.graphics();
    card.fillStyle(0x0d1722, 0.9);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 30);
    card.lineStyle(1.3, 0x7ef9ff, 0.18);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 30);

    const title = this.add.text(width / 2, cardY + 48, 'HOW TO PLAY', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '28px',
      color: '#edf5ff',
      fontStyle: 'bold',
      letterSpacing: 2,
      stroke: '#7ef9ff',
      strokeThickness: 2.2
    }).setOrigin(0.5);

    const intro = this.add.text(width / 2, cardY + 88, 'Survive the loop, keep moving, and turn incoming danger into score.', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '11px',
      color: '#b7d2ff',
      letterSpacing: 1,
      wordWrap: { width: cardWidth - 60 }
    }).setOrigin(0.5);

    const controls = [
      ['Move', 'WASD / arrows'],
      ['Slash', 'Space or touch slash'],
      ['Laser', 'J key after unlock'],
      ['Score', 'Break blocks + bullets']
    ];

    const listY = cardY + 140;
    controls.forEach(([label, value], index) => {
      const rowY = listY + index * 48;
      const panel = this.add.graphics();
      panel.fillStyle(0x101d2a, 0.86);
      panel.fillRoundedRect(cardX + 20, rowY, cardWidth - 40, 34, 12);
      panel.lineStyle(1, 0x7ef9ff, 0.28);
      panel.strokeRoundedRect(cardX + 20, rowY, cardWidth - 40, 34, 12);

      this.add.text(cardX + 32, rowY + 17, label, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#7ef9ff',
        fontStyle: 'bold',
        letterSpacing: 1.2
      }).setOrigin(0, 0.5);

      this.add.text(cardX + 140, rowY + 17, value, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        color: '#edf5ff',
        letterSpacing: 0.8,
        wordWrap: { width: cardWidth - 180 }
      }).setOrigin(0, 0.5);
    });

    const powerLabel = this.add.text(width / 2, cardY + 392, 'POWERUPS', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '18px',
      color: '#ffd84d',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    const boostRows = [
      ['E Power', 'Invincible for 5s'],
      ['Laser Blaster', 'Unlocks J-shot in shop'],
      ['Shop Items', 'Permanent upgrades']
    ];

    boostRows.forEach(([label, value], index) => {
      const rowY = cardY + 418 + index * 28;
      this.add.text(cardX + 28, rowY, `• ${label}:`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        color: '#ffd84d',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5);
      this.add.text(cardX + 150, rowY, value, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        color: '#dfe9ff',
        wordWrap: { width: cardWidth - 180 }
      }).setOrigin(0, 0.5);
    });

    const startButton = this.add.container(width / 2, cardY + cardHeight - 46);
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x101b29, 0.96);
    buttonBg.fillRoundedRect(-96, -20, 192, 40, 14);
    buttonBg.lineStyle(1.2, 0x7ef9ff, 0.8);
    buttonBg.strokeRoundedRect(-96, -20, 192, 40, 14);
    const labelText = this.add.text(0, 0, 'BACK', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);
    const hitbox = this.add.zone(0, 0, 192, 40).setInteractive({ useHandCursor: true }).setOrigin(0.5);
    startButton.add([buttonBg, labelText, hitbox]);

    hitbox.on('pointerdown', () => this.scene.start('MainMenuScene'));
    hitbox.on('pointerover', () => this.tweens.add({ targets: startButton, scale: 1.03, duration: 100, ease: 'Cubic.easeOut' }));
    hitbox.on('pointerout', () => this.tweens.add({ targets: startButton, scale: 1, duration: 100, ease: 'Cubic.easeOut' }));
  }
}
