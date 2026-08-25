import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game',
  backgroundColor: '#05050d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: [GameScene]
};

new Phaser.Game(config);
