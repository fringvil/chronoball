import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import { LoadingScene } from './scenes/LoadingScene';
import { MainMenuScene } from './scenes/MainMenuScene';
import { ShopScene } from './scenes/ShopScene';
import { HighScoreScene } from './scenes/HighScoreScene';

const config: Phaser.Types.Core.GameConfig = {
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
  scene: [LoadingScene, MainMenuScene, GameScene, ShopScene, HighScoreScene]
};

const game = new Phaser.Game(config);
window.__game = game;
