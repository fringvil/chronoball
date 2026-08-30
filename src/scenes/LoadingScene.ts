import Phaser from 'phaser';

export class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  create(): void {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x05050d);

    const title = this.add.text(width / 2, height * 0.38, 'CHRONOBALL', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#00ffcc',
      fontStyle: 'bold',
      letterSpacing: 3,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 10, stroke: true, fill: true }
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, height * 0.52, 'LOADING...', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#dce7ff',
      letterSpacing: 2
    }).setOrigin(0.5);

    this.add.rectangle(width / 2, height * 0.6, 220, 12, 0x101828).setStrokeStyle(1, 0x00ffcc, 0.4);
    const fill = this.add.rectangle(width / 2 - 110, height * 0.6, 0, 8, 0x00ffcc);
    fill.setOrigin(0, 0.5);

    this.tweens.add({
      targets: fill,
      width: 220,
      duration: 700,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        this.tweens.add({
          targets: [title, loadingText],
          alpha: 0.65,
          duration: 200,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            this.time.delayedCall(200, () => this.scene.start('MainMenuScene'));
          }
        });
      }
    });
  }
}
