import Phaser from 'phaser';
import { addHighScore, saveHighScores } from '../gameplay/highScores';
import { getArcadeVelocity } from '../gameplay/physics';
import { canTriggerSlash, getEnergyAfterSlash, resolveCollision } from '../gameplay/rules';

type TrailPoint = {
  x: number;
  y: number;
  alpha: number;
};

type ParticleEffect = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  life: number;
};

type CollisionBody = Phaser.GameObjects.Rectangle & {
  width: number;
  height: number;
  x: number;
  y: number;
  destroy: () => void;
};

export class GameScene extends Phaser.Scene {
  private score = 0;
  private energy = 100;
  private timeScale = 0.1;
  private baseSpeed = 4.5;
  private isSlash = false;
  private slashTimer = 0;
  private isGameOver = false;
  private isStarted = true;
  private shakeTime = 0;
  private impactPulse = 0;
  private trail: TrailPoint[] = [];
  private particles: ParticleEffect[] = [];
  private player!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body; x: number; y: number };
  private obstacles!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private effects!: Phaser.GameObjects.Graphics;
  private hudPanel!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escapeKey!: Phaser.Input.Keyboard.Key;
  private pointer!: Phaser.Input.Pointer;
  private spawnTimer = 0;

  constructor() {
    super('GameScene');
  }

  create(): void {
    window.__chronoballScene = 'GameScene';
    const keyboard = this.input.keyboard;
    if (!keyboard) {
      return;
    }

    this.score = 0;
    this.energy = 100;
    this.timeScale = 0.1;
    this.baseSpeed = 4.5;
    this.isSlash = false;
    this.slashTimer = 0;
    this.isGameOver = false;
    this.isStarted = true;
    this.shakeTime = 0;
    this.impactPulse = 0;
    this.trail = [];
    this.particles = [];

    this.player = this.add.circle(180, 520, 10, 0x00ffcc) as Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body; x: number; y: number };
    this.physics.add.existing(this.player);
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setCollideWorldBounds(true);
    playerBody.setAllowGravity(false);
    playerBody.setDrag(0);
    playerBody.setMaxVelocity(420);
    playerBody.setSize(18, 18);

    this.obstacles = this.physics.add.group({ allowGravity: false, immovable: true });
    this.bullets = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.overlap(this.player, this.obstacles, (_player, obstacle) => {
      this.handleArcadeCollision(obstacle as Phaser.GameObjects.Rectangle);
    });
    this.physics.add.overlap(this.player, this.bullets, (_player, bullet) => {
      this.handleArcadeBulletCollision(bullet as Phaser.GameObjects.Arc);
    });
    this.effects = this.add.graphics();

    this.hudPanel = this.add.rectangle(180, 43, 332, 58, 0x0b0f1e, 0.78)
      .setStrokeStyle(1, 0x00ffcc, 0.2);
    this.scoreText = this.add.text(20, 22, 'DEPTH  0m', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#00ffcc',
      fontStyle: 'bold',
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 10, stroke: true, fill: true }
    });
    this.energyText = this.add.text(340, 22, 'ENERGY  100%', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#ff176f',
      fontStyle: 'bold',
      align: 'right',
      shadow: { offsetX: 0, offsetY: 0, color: '#ff176f', blur: 10, stroke: true, fill: true }
    }).setOrigin(1, 0);
    this.statusText = this.add.text(180, 57, 'BULLET TIME', {
      fontFamily: 'Trebuchet MS',
      fontSize: '10px',
      color: '#00ffcc',
      fontStyle: 'bold',
      letterSpacing: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 8, stroke: true, fill: true }
    }).setOrigin(0.5);

    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escapeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.pointer = this.input.activePointer;
    this.spawnTimer = 0;
  }

  update(_time: number, _delta: number): void {
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.scene.start('MainMenuScene');
      return;
    }
    if (this.isGameOver) {
      this.particles.forEach((particle: ParticleEffect) => {
        particle.x += particle.vx * this.timeScale;
        particle.y += particle.vy * this.timeScale;
        particle.life -= this.timeScale;
      });
      this.particles = this.particles.filter((particle: ParticleEffect) => particle.life > 0);
      this.drawEffects();
      return;
    }

    let isMoving = false;
    let moveX = 0;
    let moveY = 0;

    if (this.pointer.isDown) {
      const dx = this.pointer.x - this.player.x;
      const dy = this.pointer.y - this.player.y;
      if (Math.hypot(dx, dy) > 3) {
        const pointerVelocity = getArcadeVelocity(dx, dy, 240);
        this.player.body.setVelocity(pointerVelocity.x, pointerVelocity.y);
        isMoving = true;
      } else {
        this.player.body.setVelocity(0, 0);
      }
    } else {
      if (this.cursors.left.isDown || this.keys.A.isDown) { moveX -= 1; isMoving = true; }
      if (this.cursors.right.isDown || this.keys.D.isDown) { moveX += 1; isMoving = true; }
      if (this.cursors.up.isDown || this.keys.W.isDown) { moveY -= 1; isMoving = true; }
      if (this.cursors.down.isDown || this.keys.S.isDown) { moveY += 1; isMoving = true; }

      const keyboardVelocity = getArcadeVelocity(moveX, moveY, 240);
      this.player.body.setVelocity(keyboardVelocity.x, keyboardVelocity.y);
      if (!isMoving) {
        this.player.body.setVelocity(0, 0);
      }
    }

    this.player.x = Phaser.Math.Clamp(this.player.x, 10, 350);
    this.player.y = Phaser.Math.Clamp(this.player.y, 10, 630);
    if (isMoving) this.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.8 });
    this.trail.forEach((trail: TrailPoint) => { trail.alpha -= 0.05; });
    this.trail = this.trail.filter((trail: TrailPoint) => trail.alpha > 0);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.triggerSlash();
    }

    const targetScale = isMoving ? 1.0 : 0.1;
    this.timeScale += (targetScale - this.timeScale) * 0.15;

    if (this.timeScale < 0.3) {
      this.statusText.setText('BULLET TIME (10% SPEED)').setColor('#00ffcc');
    } else {
      this.statusText.setText('REAL-TIME SLICE').setColor('#ff0055');
    }

    if (this.isSlash) {
      this.slashTimer--;
      if (this.slashTimer <= 0) {
        this.isSlash = false;
        this.player.setFillStyle(0x00ffcc);
      }
    } else if (this.energy < 100) {
      this.energy = Math.min(100, this.energy + 0.25 * this.timeScale);
    }

    this.energyText.setText(`ENERGY: ${Math.floor(this.energy)}%`);

    this.spawnTimer += this.timeScale;
    if (this.spawnTimer >= 90) {
      this.spawnPattern();
      this.spawnTimer = 0;
    }

    const stepSpeed = this.baseSpeed * this.timeScale;
    this.obstacles.getChildren().forEach((obs: Phaser.GameObjects.GameObject) => {
      const obstacle = obs as CollisionBody;
      const obstacleBody = obstacle.body as Phaser.Physics.Arcade.Body | undefined;
      if (obstacleBody) {
        obstacleBody.setVelocityY(this.baseSpeed * 60 * this.timeScale);
      } else {
        obstacle.y += stepSpeed;
      }
      if (obstacle.y > 650) obstacle.destroy();
    });

    this.bullets.getChildren().forEach((bullet: Phaser.GameObjects.GameObject) => {
      const b = bullet as Phaser.GameObjects.Arc & { active: boolean; x: number; y: number; destroy: () => void; body?: Phaser.Physics.Arcade.Body };
      const bulletBody = b.body as Phaser.Physics.Arcade.Body | undefined;
      if (bulletBody) {
        bulletBody.setVelocityY((6 + this.baseSpeed) * 60 * this.timeScale);
      } else {
        b.y += (6 + this.baseSpeed) * this.timeScale;
      }
      if (b.y > 650) b.destroy();
    });

    this.particles.forEach((particle: ParticleEffect) => {
      particle.x += particle.vx * this.timeScale;
      particle.y += particle.vy * this.timeScale;
      particle.life -= this.timeScale;
    });
    this.particles = this.particles.filter((particle: ParticleEffect) => particle.life > 0);

    this.score += this.timeScale * 0.5;
    this.scoreText.setText(`DEPTH: ${Math.floor(this.score)}m`);
    this.drawEffects();
  }

  private handleArcadeCollision(obstacle: Phaser.GameObjects.Rectangle): void {
    if (!obstacle || this.isGameOver) return;
    const closestX = Phaser.Math.Clamp(this.player.x, obstacle.x - obstacle.width / 2, obstacle.x + obstacle.width / 2);
    const closestY = Phaser.Math.Clamp(this.player.y, obstacle.y - obstacle.height / 2, obstacle.y + obstacle.height / 2);
    const outcome = resolveCollision(Math.hypot(this.player.x - closestX, this.player.y - closestY), 10, this.isSlash);
    if (outcome === 'none') return;
    if (outcome === 'destroy') {
      this.createParticles(obstacle.x, obstacle.y, 0xff0055, 14);
      this.shakeTime = 8;
      obstacle.destroy();
      return;
    }

    this.player.body.setVelocity(0, 0);
    this.createParticles(this.player.x, this.player.y, 0xff0055, 180);
    this.createParticles(this.player.x, this.player.y, 0x00ffcc, 120);
    this.createParticles(obstacle.x, obstacle.y, 0xff0055, 60);
    this.shakeTime = 18;
    this.impactPulse = 26;
    this.triggerGameOver();
  }

  private handleArcadeBulletCollision(bullet: Phaser.GameObjects.Arc): void {
    if (!bullet || this.isGameOver) return;
    const outcome = resolveCollision(Math.hypot(this.player.x - bullet.x, this.player.y - bullet.y), 15, this.isSlash);
    if (outcome === 'none') return;
    if (outcome === 'destroy') {
      this.createParticles(bullet.x, bullet.y, 0x00ffcc, 10);
      bullet.destroy();
      return;
    }

    this.player.body.setVelocity(0, 0);
    this.createParticles(this.player.x, this.player.y, 0xff0055, 180);
    this.createParticles(this.player.x, this.player.y, 0x00ffcc, 120);
    this.createParticles(bullet.x, bullet.y, 0xff0055, 60);
    this.shakeTime = 18;
    this.impactPulse = 26;
    this.triggerGameOver();
  }

  private triggerSlash(): void {
    if (canTriggerSlash(this.energy, this.isSlash)) {
      this.isSlash = true;
      this.slashTimer = 18;
      this.energy = getEnergyAfterSlash(this.energy);
      this.player.setFillStyle(0xff0055);
      this.shakeTime = 12;
      this.createParticles(this.player.x, this.player.y, 0xff0055, 20);
    }
  }

  private spawnPattern(): void {
    const blockWidth = 45;
    const totalCols = Math.floor(this.scale.width / blockWidth);
    const gapIndex = Math.floor(Math.random() * Math.max(1, totalCols - 1));
    const allowedGapWidth = 2;

    for (let c = 0; c < totalCols; c++) {
      if (c === gapIndex || c === gapIndex + allowedGapWidth) continue;
      const rect = this.add.rectangle(c * blockWidth + 2 + (blockWidth - 4) / 2, -10, blockWidth - 4, 20, 0xff0055);
      this.physics.add.existing(rect);
      const rectBody = rect.body as Phaser.Physics.Arcade.Body;
      rectBody.setAllowGravity(false);
      rectBody.setImmovable(true);
      this.obstacles.add(rect);
    }

    if (Math.random() < 0.6) {
      const bullet = this.add.circle((gapIndex + 0.5) * blockWidth, -40, 5, 0xffbb00);
      this.physics.add.existing(bullet);
      const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
      bulletBody.setAllowGravity(false);
      this.bullets.add(bullet);
    }
  }

  private createParticles(x: number, y: number, color: number, count = 8): void {
    for (let index = 0; index < count; index += 1) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 5 + 2,
        color,
        life: 38
      });
    }
  }

  private checkBulletCollision(bullet: Phaser.GameObjects.Arc & { active: boolean; x: number; y: number; destroy: () => void }): void {
    const outcome = resolveCollision(Math.hypot(this.player.x - bullet.x, this.player.y - bullet.y), 15, this.isSlash);
    if (outcome === 'none') return;
    if (outcome === 'destroy') {
      this.createParticles(bullet.x, bullet.y, 0x00ffcc, 10);
      bullet.destroy();
    } else {
      this.triggerGameOver();
    }
  }

  private checkObstacleCollision(obstacle: CollisionBody): void {
    const closestX = Phaser.Math.Clamp(this.player.x, obstacle.x - obstacle.width / 2, obstacle.x + obstacle.width / 2);
    const closestY = Phaser.Math.Clamp(this.player.y, obstacle.y - obstacle.height / 2, obstacle.y + obstacle.height / 2);
    const outcome = resolveCollision(Math.hypot(this.player.x - closestX, this.player.y - closestY), 10, this.isSlash);
    if (outcome === 'none') return;
    if (outcome === 'destroy') {
      this.createParticles(obstacle.x, obstacle.y, 0xff0055, 14);
      this.shakeTime = 8;
      obstacle.destroy();
    } else {
      this.triggerGameOver();
    }
  }

  private drawEffects(): void {
    this.effects.clear();
    this.effects.lineStyle(1, this.timeScale < 0.3 ? 0x00ffcc : 0xff0055, this.timeScale < 0.3 ? 0.08 : 0.15);
    for (let x = 0; x < this.scale.width; x += 30) {
      this.effects.lineBetween(x, 0, x, this.scale.height);
    }
    this.trail.forEach((trail: TrailPoint) => {
      this.effects.fillStyle(0x00ffcc, trail.alpha * 0.4);
      this.effects.fillCircle(trail.x, trail.y, 8);
    });
    this.particles.forEach((particle: ParticleEffect) => {
      this.effects.fillStyle(particle.color, Math.min(1, particle.life / 25));
      this.effects.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
    if (!this.isGameOver && this.isSlash) {
      this.effects.lineStyle(3, 0xff0055, 1);
      this.effects.strokeCircle(this.player.x, this.player.y, 22);
    }
    if (!this.isGameOver && this.impactPulse > 0) {
      const pulseRadius = 18 + (26 - this.impactPulse) * 4;
      this.effects.lineStyle(4, 0xff0055, Math.min(1, this.impactPulse / 26));
      this.effects.strokeCircle(this.player.x, this.player.y, pulseRadius);
      this.impactPulse -= 1;
    }
    if (this.shakeTime > 0) {
      this.cameras.main.setScroll((Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8);
      this.shakeTime -= 1;
    } else {
      this.cameras.main.setScroll(0, 0);
    }
  }

  private triggerGameOver(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.trail = [];
    this.player.setVisible(false);
    this.player.setAlpha(0);
    this.player.setActive(false);
    this.player.body.stop();
    this.player.body.enable = false;
    this.player.body.setSize(0, 0);
    this.createParticles(this.player.x, this.player.y, 0xff0055, 120);
    this.createParticles(this.player.x, this.player.y, 0x00ffcc, 100);

    const finalScore = Math.floor(this.score);
    const previousScores = this.registry.get('highScores') as Array<number | string> | undefined;
    const updatedScores = addHighScore(previousScores ?? [], finalScore);
    this.registry.set('highScores', updatedScores);
    this.registry.set('lastScore', finalScore);
    saveHighScores(updatedScores);

    this.time.delayedCall(1100, () => {
      this.scene.start('HighScoreScene', { score: finalScore });
    });
  }
}
