import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(): void {
    window.__chronoballScene = 'ShopScene';
    const { width, height } = this.scale;
    const currency = this.registry.get('currency') ?? 120;

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

    const cardWidth = Math.min(width - 28, 332);
    const cardHeight = 610;
    const cardX = width / 2 - cardWidth / 2;
    const cardY = 28;
    const card = this.add.graphics();
    card.fillStyle(0x0d1722, 0.9);
    card.fillRoundedRect(cardX, cardY, cardWidth, cardHeight, 28);
    card.lineStyle(1.3, 0x7ef9ff, 0.18);
    card.strokeRoundedRect(cardX, cardY, cardWidth, cardHeight, 28);
    card.setDepth(1);

    const headerTag = this.add.text(width / 2, 70, 'RESEARCH // LOADOUT', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '10px',
      color: '#b9d9ff',
      letterSpacing: 3,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(5);

    const title = this.add.text(width / 2, 108, 'ITEM SHOP', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '30px',
      color: '#f0f7ff',
      fontStyle: 'bold',
      letterSpacing: 3,
      stroke: '#7ef9ff',
      strokeThickness: 2.2
    }).setOrigin(0.5).setDepth(5);

    const wallet = this.add.graphics();
    wallet.fillStyle(0x101d2a, 0.95);
    wallet.fillRoundedRect(width / 2 - 110, 136, 220, 34, 17);
    wallet.lineStyle(1.2, 0xffb14c, 0.45);
    wallet.strokeRoundedRect(width / 2 - 110, 136, 220, 34, 17);
    wallet.setDepth(2);
    this.add.text(width / 2, 153, `CREDITS: ${currency} CR`, {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '12px',
      color: '#ffb14c',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5).setDepth(5);

    const shopItems = [
      { name: 'Chrono Battery', cost: 35, effect: '+15% energy start', color: 0x00ffcc },
      { name: 'Prism Gloves', cost: 60, effect: 'Quicker slash recovery', color: 0xff176f },
      { name: 'Aether Boots', cost: 80, effect: 'Better dodge window', color: 0x4fc3ff },
      { name: 'Laser Blaster', cost: 120, effect: 'Unlock J-key laser shots', color: 0x7ae6ff }
    ];

    shopItems.forEach((item, index) => {
      const y = 198 + index * 88;
      const itemPanel = this.add.container(width / 2, y);
      itemPanel.setDepth(10);
      const panelGraphics = this.add.graphics();
      panelGraphics.fillStyle(0x0d1425, 0.82);
      panelGraphics.fillRoundedRect(-150, -34, 300, 68, 18);
      panelGraphics.lineStyle(1.5, item.color, 0.9);
      panelGraphics.strokeRoundedRect(-150, -34, 300, 68, 18);
      itemPanel.add(panelGraphics);

      const nameText = this.add.text(-118, -10, item.name, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0, 0.5).setDepth(5);
      const effectText = this.add.text(-118, 14, item.effect, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '11px',
        color: '#b9c8de'
      }).setOrigin(0, 0.5).setDepth(5);
      const costText = this.add.text(95, 0, `${item.cost} CR`, {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '13px',
        color: '#ffb14c',
        fontStyle: 'bold'
      }).setOrigin(0.5).setDepth(5);

      const buyButton = this.add.container(118, 0);
      buyButton.setDepth(20);
      const buyBgGraphics = this.add.graphics();
      buyBgGraphics.fillStyle(0x0f172a, 0.95);
      buyBgGraphics.fillRoundedRect(-40, -15, 80, 30, 15);
      buyBgGraphics.lineStyle(1.4, item.color, 1);
      buyBgGraphics.strokeRoundedRect(-40, -15, 80, 30, 15);
      const buyBg = this.add.zone(0, 0, 80, 30).setInteractive({ useHandCursor: true });
      buyBg.setDepth(21);
      const buyText = this.add.text(0, 0, 'BUY', {
        fontFamily: 'Trebuchet MS, sans-serif',
        fontSize: '12px',
        color: '#ffffff',
        fontStyle: 'bold',
        letterSpacing: 1
      }).setOrigin(0.5);
      buyText.setDepth(22);
      buyButton.add([buyBgGraphics, buyBg, buyText]);

      const purchaseItem = () => {
        const currentCurrency = this.registry.get('currency') ?? 0;
        if (currentCurrency < item.cost) {
          this.add.text(width / 2, 560, 'NOT ENOUGH CREDITS', {
            fontFamily: 'Trebuchet MS, sans-serif',
            fontSize: '12px',
            color: '#ff176f',
            fontStyle: 'bold'
          }).setOrigin(0.5).setDepth(6);
          return;
        }

        this.registry.set('currency', currentCurrency - item.cost);
        this.registry.set(`item:${item.name}`, true);
        this.scene.restart();
      };

      buyBg.on('pointerdown', purchaseItem);
      buyBg.on('pointerover', () => {
        this.tweens.add({ targets: buyButton, scale: 1.05, duration: 120, ease: 'Cubic.easeOut' });
      });
      buyBg.on('pointerout', () => {
        this.tweens.add({ targets: buyButton, scale: 1, duration: 120, ease: 'Cubic.easeOut' });
      });

      itemPanel.add([nameText, effectText, costText, buyButton]);
      itemPanel.setSize(300, 68);
    });

    const backButton = this.add.container(width / 2, 575);
    backButton.setDepth(20);
    const backBgGraphics = this.add.graphics();
    backBgGraphics.fillStyle(0x0f172a, 0.9);
    backBgGraphics.fillRoundedRect(-100, -21, 200, 42, 18);
    backBgGraphics.lineStyle(1.2, 0x00ffcc, 0.8);
    backBgGraphics.strokeRoundedRect(-100, -21, 200, 42, 18);
    const backBg = this.add.zone(0, 0, 200, 42).setInteractive({ useHandCursor: true });
    backBg.setDepth(21);
    const backText = this.add.text(0, 0, 'BACK', {
      fontFamily: 'Trebuchet MS, sans-serif',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);
    backText.setDepth(22);
    backButton.add([backBgGraphics, backBg, backText]);

    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'));
    backBg.on('pointerover', () => {
      this.tweens.add({ targets: backButton, scale: 1.03, duration: 100, ease: 'Cubic.easeOut' });
    });
    backBg.on('pointerout', () => {
      this.tweens.add({ targets: backButton, scale: 1, duration: 100, ease: 'Cubic.easeOut' });
    });

    this.tweens.add({
      targets: title,
      y: 102,
      duration: 1800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
