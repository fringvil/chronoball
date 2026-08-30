import Phaser from 'phaser';

export class ShopScene extends Phaser.Scene {
  constructor() {
    super('ShopScene');
  }

  create(): void {
    window.__chronoballScene = 'ShopScene';
    const { width, height } = this.scale;
    const currency = this.registry.get('currency') ?? 120;

    this.add.rectangle(width / 2, height / 2, width, height, 0x05050d);
    this.add.text(width / 2, 70, 'ITEM SHOP', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      color: '#00ffcc',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.text(width / 2, 104, `CREDITS: ${currency} CR`, {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#ffb14c',
      fontStyle: 'bold',
      letterSpacing: 1
    }).setOrigin(0.5);

    const shopItems = [
      { name: 'Chrono Battery', cost: 35, effect: '+15% energy start', color: 0x00ffcc },
      { name: 'Prism Gloves', cost: 60, effect: 'Quicker slash recovery', color: 0xff176f },
      { name: 'Aether Boots', cost: 80, effect: 'Better dodge window', color: 0x4fc3ff }
    ];

    shopItems.forEach((item, index) => {
      const y = 180 + index * 120;
      const itemPanel = this.add.container(width / 2, y);
      const panel = this.add.rectangle(0, 0, 240, 84, 0x101828).setStrokeStyle(1, item.color, 0.75);
      const nameText = this.add.text(-90, -18, item.name, {
        fontFamily: 'Trebuchet MS',
        fontSize: '15px',
        color: '#ffffff',
        fontStyle: 'bold'
      });
      const effectText = this.add.text(-90, 8, item.effect, {
        fontFamily: 'Trebuchet MS',
        fontSize: '11px',
        color: '#b9c8de'
      });
      const costText = this.add.text(80, 0, `${item.cost} CR`, {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#ffb14c',
        fontStyle: 'bold'
      });

      itemPanel.add([panel, nameText, effectText, costText]);
      itemPanel.setSize(240, 84);
      itemPanel.setInteractive(new Phaser.Geom.Rectangle(-120, -42, 240, 84), Phaser.Geom.Rectangle.Contains);
      itemPanel.on('pointerdown', () => {
        const currentCurrency = this.registry.get('currency') ?? 0;
        if (currentCurrency < item.cost) {
          this.add.text(width / 2, 560, 'NOT ENOUGH CREDITS', {
            fontFamily: 'Trebuchet MS',
            fontSize: '12px',
            color: '#ff176f',
            fontStyle: 'bold'
          }).setOrigin(0.5);
          return;
        }

        this.registry.set('currency', currentCurrency - item.cost);
        this.registry.set(`item:${item.name}`, true);
        this.scene.restart();
      });
    });

    const backButton = this.add.container(width / 2, 560);
    const backBg = this.add.rectangle(0, 0, 200, 42, 0x0f172a).setStrokeStyle(1, 0x00ffcc, 0.8).setInteractive({ useHandCursor: true });
    const backText = this.add.text(0, 0, 'BACK', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      letterSpacing: 2
    }).setOrigin(0.5);

    backButton.add([backBg, backText]);
    backButton.setSize(200, 42);
    backBg.on('pointerdown', () => this.scene.start('MainMenuScene'));
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (Math.abs(pointer.x - width / 2) < 100 && Math.abs(pointer.y - 560) < 21) {
        this.scene.start('MainMenuScene');
      }
    });
  }
}
