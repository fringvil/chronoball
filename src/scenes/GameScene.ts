import Phaser from 'phaser';
import { addHighScore, saveHighScores } from '../gameplay/highScores';
import { getArcadeVelocity, getDeltaFactor } from '../gameplay/physics';
import { canTriggerSlash, getEnergyAfterSlash, resolveCollision, SLASH_BULLET_RADIUS, SLASH_HITBOX_RADIUS } from '../gameplay/rules';

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
  getData: (key: string) => unknown;
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
  private invincibilityTimer = 0;
  private laserTimer = 0;
  private powerupSpawnTimer = 0;
  private trail: TrailPoint[] = [];
  private particles: ParticleEffect[] = [];
  private player!: Phaser.GameObjects.Arc & { body: Phaser.Physics.Arcade.Body; x: number; y: number };
  private obstacles!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private laserShots!: Phaser.Physics.Arcade.Group;
  private starPowerups!: Phaser.Physics.Arcade.Group;
  private hasLaserBlaster = false;
  private effects!: Phaser.GameObjects.Graphics;
  private hudPanel!: Phaser.GameObjects.Rectangle;
  private scoreText!: Phaser.GameObjects.Text;
  private energyText!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private powerText!: Phaser.GameObjects.Text;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private escapeKey!: Phaser.Input.Keyboard.Key;
  private jKey!: Phaser.Input.Keyboard.Key;
  private pointer!: Phaser.Input.Pointer;
  private spawnTimer = 0;
  private lastMoveX = 0;
  private lastMoveY = -1;

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
    this.invincibilityTimer = 0;
    this.laserTimer = 0;
    this.powerupSpawnTimer = 12 + Math.random() * 10;
    this.trail = [];
    this.particles = [];
    this.hasLaserBlaster = this.registry.get('item:Laser Blaster') === true;

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
    this.laserShots = this.physics.add.group({ allowGravity: false });
    this.starPowerups = this.physics.add.group({ allowGravity: false, immovable: true });
    this.physics.add.collider(this.player, this.obstacles, (_player, obstacle) => {
      this.handleArcadeCollision(obstacle as Phaser.GameObjects.Rectangle);
    });
    this.physics.add.overlap(this.player, this.bullets, (_player, bullet) => {
      this.handleArcadeBulletCollision(bullet as Phaser.GameObjects.Arc);
    });
    this.physics.add.overlap(this.player, this.starPowerups, (_player, powerup) => {
      this.triggerPowerup(powerup as Phaser.GameObjects.Container);
    });
    this.physics.add.overlap(this.laserShots, this.obstacles, (_laser, obstacle) => {
      const brick = obstacle as CollisionBody;
      const laser = _laser as Phaser.GameObjects.GameObject & { x: number; y: number; active: boolean; destroy: () => void };
      if (brick.getData('steel') === true) {
        this.createParticles(laser.x, laser.y, 0xdfe7ff, 12);
        const spark = this.add.circle(laser.x, laser.y, 8, 0xfff0f0, 0.9).setDepth(31);
        this.add.tween({
          targets: spark,
          alpha: 0,
          scale: 2.6,
          duration: 120,
          onComplete: () => spark.destroy()
        });
        laser.destroy();
        return;
      }
      this.destroyObstacleWithExplosion(brick);
      laser.destroy();
    });
    this.physics.add.overlap(this.laserShots, this.bullets, (_laser, bullet) => {
      this.destroyBulletWithExplosion(bullet as Phaser.GameObjects.Arc);
      (_laser as Phaser.GameObjects.Arc).destroy();
    });
    this.effects = this.add.graphics();

    this.hudPanel = this.add.rectangle(180, 43, 332, 58, 0x0b0f1e, 0)
      .setStrokeStyle(0, 0x00ffcc, 0);
    this.hudPanel.setVisible(false);
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
    this.powerText = this.add.text(180, 72, 'POWER: --', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#ffd84d',
      fontStyle: 'bold',
      letterSpacing: 2,
      shadow: { offsetX: 0, offsetY: 0, color: '#ffd84d', blur: 8, stroke: true, fill: true }
    }).setOrigin(0.5).setAlpha(0.7);

    this.cursors = keyboard.createCursorKeys();
    this.keys = keyboard.addKeys('W,A,S,D') as Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;
    this.spaceKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.escapeKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.jKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.pointer = this.input.activePointer;
    this.spawnTimer = 0;
  }

  update(_time: number, delta: number): void {
    const deltaFactor = getDeltaFactor(delta);
    const deltaSeconds = delta > 0 ? delta / 1000 : 1 / 60;

    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.scene.start('MainMenuScene');
      return;
    }
    if (this.isGameOver) {
      this.particles.forEach((particle: ParticleEffect) => {
        particle.x += particle.vx * this.timeScale * deltaFactor;
        particle.y += particle.vy * this.timeScale * deltaFactor;
        particle.life -= this.timeScale * deltaFactor;
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
        this.lastMoveX = dx;
        this.lastMoveY = dy;
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
      if (moveX !== 0 || moveY !== 0) {
        this.lastMoveX = moveX;
        this.lastMoveY = moveY;
      }
      if (!isMoving) {
        this.player.body.setVelocity(0, 0);
      }
    }

    this.player.x = Phaser.Math.Clamp(this.player.x, 10, 350);
    this.player.y = Phaser.Math.Clamp(this.player.y, 10, 630);
    if (this.player.y >= 628) {
      this.triggerGameOver();
      return;
    }
    if (isMoving) this.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.8 });
    this.trail.forEach((trail: TrailPoint) => { trail.alpha -= 0.05 * deltaFactor; });
    this.trail = this.trail.filter((trail: TrailPoint) => trail.alpha > 0);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.triggerSlash();
    }

    if (this.hasLaserBlaster && Phaser.Input.Keyboard.JustDown(this.jKey)) {
      this.fireLaserShot();
    }

    const targetScale = isMoving ? 1.0 : 0.1;
    this.timeScale += (targetScale - this.timeScale) * 0.15 * deltaFactor;

    const powerReady = this.invincibilityTimer > 0 || this.laserTimer > 0;
    if (this.isSlash) {
      this.statusText.setText('SLASHING...').setColor('#ff0055');
    } else if (this.invincibilityTimer > 0) {
      this.statusText.setText('INVINCIBILITY READY').setColor('#00ffcc');
    } else if (this.timeScale < 0.3) {
      this.statusText.setText('BULLET TIME (10% SPEED)').setColor('#00ffcc');
    } else {
      this.statusText.setText('REAL-TIME SLICE').setColor('#ff0055');
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer = Math.max(0, this.invincibilityTimer - deltaSeconds);
      this.player.setFillStyle(0xffd84d);
    } else if (this.isSlash) {
      this.slashTimer -= deltaFactor;
      if (this.slashTimer <= 0) {
        this.isSlash = false;
        this.player.setFillStyle(0x00ffcc);
      }
    } else if (this.energy < 100) {
      this.energy = Math.min(100, this.energy + 0.25 * this.timeScale * deltaSeconds * 60);
    }

    if (this.laserTimer > 0) {
      this.laserTimer = Math.max(0, this.laserTimer - deltaSeconds);
    }

    if (this.invincibilityTimer > 0) {
      this.powerText.setText(`INVINCIBLE: ${this.invincibilityTimer.toFixed(1)}s`);
      this.powerText.setColor('#ffd84d');
      this.powerText.setFontSize(12);
      this.powerText.setAlpha(0.7);
      this.powerText.setVisible(true);
    } else {
      this.powerText.setText('');
      this.powerText.setVisible(false);
    }
    this.energyText.setText(`ENERGY: ${Math.floor(this.energy)}%`);

    this.spawnTimer += this.timeScale * deltaSeconds * 60;
    if (this.spawnTimer >= 90) {
      this.spawnPattern();
      this.spawnTimer = 0;
    }

    if (this.starPowerups.getChildren().length < 1) {
      this.powerupSpawnTimer -= deltaSeconds;
      if (this.powerupSpawnTimer <= 0) {
        if (Math.random() < 0.7) {
          this.spawnPowerup();
        }
        this.powerupSpawnTimer = 18 + Math.random() * 22;
      }
    }
    if (this.spawnTimer >= 90) {
      this.spawnPattern();
      this.spawnTimer = 0;
    }

    const stepSpeed = this.baseSpeed * this.timeScale * deltaSeconds * 60;
    if (this.isSlash) {
      this.obstacles.getChildren().forEach((obs: Phaser.GameObjects.GameObject) => {
        const obstacle = obs as CollisionBody;
        if (!obstacle || !obstacle.active) return;
        if (obstacle.getData('steel') === true) return;
        const closestX = Phaser.Math.Clamp(this.player.x, obstacle.x - obstacle.width / 2, obstacle.x + obstacle.width / 2);
        const closestY = Phaser.Math.Clamp(this.player.y, obstacle.y - obstacle.height / 2, obstacle.y + obstacle.height / 2);
        const outcome = resolveCollision(Math.hypot(this.player.x - closestX, this.player.y - closestY), SLASH_HITBOX_RADIUS, true);
        if (outcome !== 'destroy') return;
        this.createParticles(obstacle.x, obstacle.y, 0xff0055, 14);
        this.shakeTime = 8;
        obstacle.destroy();
      });

      this.bullets.getChildren().forEach((bullet: Phaser.GameObjects.GameObject) => {
        const b = bullet as Phaser.GameObjects.Arc & { active: boolean; x: number; y: number; destroy: () => void; body?: Phaser.Physics.Arcade.Body };
        if (!b || !b.active) return;
        const outcome = resolveCollision(Math.hypot(this.player.x - b.x, this.player.y - b.y), SLASH_BULLET_RADIUS, true);
        if (outcome !== 'destroy') return;
        this.createParticles(b.x, b.y, 0x00ffcc, 10);
        b.destroy();
      });
    }

    if (this.invincibilityTimer > 0) {
      this.destroyNearbyBricks();
    }

    this.starPowerups.getChildren().forEach((powerup: Phaser.GameObjects.GameObject) => {
      const star = powerup as Phaser.GameObjects.Star & { active: boolean; x: number; y: number; body?: Phaser.Physics.Arcade.Body; destroy: () => void };
      const starBody = star.body as Phaser.Physics.Arcade.Body | undefined;
      if (starBody) {
        starBody.setVelocityY(this.baseSpeed * 60 * this.timeScale);
      } else {
        star.y += stepSpeed;
      }
      if (star.y > 650) star.destroy();
    });

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
        b.y += (6 + this.baseSpeed) * this.timeScale * deltaSeconds * 60;
      }
      if (b.y > 650) b.destroy();
    });

    this.laserShots.getChildren().forEach((shotObj: Phaser.GameObjects.GameObject) => {
      const shot = shotObj as Phaser.GameObjects.Arc & { active: boolean; x: number; y: number; destroy: () => void; body?: Phaser.Physics.Arcade.Body; getData: (key: string) => number; };
      if (!shot || !shot.active) return;

      const speedX = shot.getData('vx') ?? 0;
      const speedY = shot.getData('vy') ?? 0;
      shot.x += speedX * (delta / 1000);
      shot.y += speedY * (delta / 1000);

      const ttl = shot.getData('ttl') ?? 1800;
      shot.setData('ttl', ttl - delta);
      if ((shot.getData('ttl') ?? 0) <= 0 || shot.x < -80 || shot.x > this.scale.width + 80 || shot.y < -80 || shot.y > this.scale.height + 80) {
        shot.destroy();
      }
    });

    this.particles.forEach((particle: ParticleEffect) => {
      particle.x += particle.vx * this.timeScale * deltaFactor;
      particle.y += particle.vy * this.timeScale * deltaFactor;
      particle.life -= this.timeScale * deltaFactor;
    });
    this.particles = this.particles.filter((particle: ParticleEffect) => particle.life > 0);

    this.score += this.timeScale * 0.5 * deltaSeconds * 60;
    this.scoreText.setText(`DEPTH: ${Math.floor(this.score)}m`);
    this.drawEffects();
  }

  private handleArcadeCollision(obstacle: Phaser.GameObjects.Rectangle): void {
    if (!obstacle || this.isGameOver) return;
    const brick = obstacle as CollisionBody;
    if (brick.getData('steel') === true) {
      this.player.body.setVelocity(0, 0);
      return;
    }
    if (this.invincibilityTimer > 0) {
      this.destroyObstacleWithExplosion(brick);
      return;
    }
    const closestX = Phaser.Math.Clamp(this.player.x, obstacle.x - obstacle.width / 2, obstacle.x + obstacle.width / 2);
    const closestY = Phaser.Math.Clamp(this.player.y, obstacle.y - obstacle.height / 2, obstacle.y + obstacle.height / 2);
    const outcome = resolveCollision(Math.hypot(this.player.x - closestX, this.player.y - closestY), SLASH_HITBOX_RADIUS, this.isSlash);
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
    if (this.invincibilityTimer > 0) {
      this.destroyBulletWithExplosion(bullet);
      return;
    }
    const outcome = resolveCollision(Math.hypot(this.player.x - bullet.x, this.player.y - bullet.y), SLASH_BULLET_RADIUS, this.isSlash);
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
      const isSteel = Math.random() < 0.18;
      let brick: Phaser.GameObjects.GameObject;

      if (isSteel) {
        const x = c * blockWidth + 2 + (blockWidth - 4) / 2;
        const y = -10;
        const base = this.add.rectangle(x, y, blockWidth - 4, 26, 0x7d8da9)
          .setStrokeStyle(2, 0xeaf1ff, 1);
        this.add.rectangle(x, y - 7, blockWidth - 12, 3, 0xb6c2d5, 0.8);
        this.add.rectangle(x, y + 4, blockWidth - 12, 3, 0x94a6ba, 0.7);
        this.add.rectangle(x, y + 12, blockWidth - 12, 2, 0xeaf1ff, 0.7);
        brick = base;
        brick.setData('steel', true);
      } else {
        brick = this.add.rectangle(
          c * blockWidth + 2 + (blockWidth - 4) / 2,
          -10,
          blockWidth - 4,
          20,
          0xff0055
        )
          .setStrokeStyle(1, 0xff8fa8, 1);
        brick.setData('steel', false);
      }

      this.physics.add.existing(brick);
      const rectBody = brick.body as Phaser.Physics.Arcade.Body;
      rectBody.setAllowGravity(false);
      rectBody.setImmovable(true);
      this.obstacles.add(brick);
    }

    if (Math.random() < 0.6) {
      const bullet = this.add.circle((gapIndex + 0.5) * blockWidth, -40, 5, 0xffbb00);
      this.physics.add.existing(bullet);
      const bulletBody = bullet.body as Phaser.Physics.Arcade.Body;
      bulletBody.setAllowGravity(false);
      this.bullets.add(bullet);
    }
  }

  private spawnPowerup(): void {
    const body = this.add.rectangle(0, 0, 20, 30, 0x00ffcc, 0.96).setStrokeStyle(2, 0x80ffee, 1);
    const cap = this.add.rectangle(0, -18, 16, 6, 0xffd84d, 1);
    const label = this.add.text(0, 1, 'E', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#101828',
      fontStyle: 'bold',
      align: 'center'
    }).setOrigin(0.5);

    const powerup = this.add.container(Math.random() * 260 + 50, -24, [cap, body, label]);
    this.physics.add.existing(powerup);
    const powerupBody = powerup.body as Phaser.Physics.Arcade.Body;
    powerupBody.setAllowGravity(false);
    powerupBody.setImmovable(true);
    (powerup as unknown as { type?: string }).type = 'invincibility';
    this.starPowerups.add(powerup);
  }

  private triggerPowerup(powerup: Phaser.GameObjects.Container): void {
    if (!powerup || this.isGameOver) return;
    powerup.destroy();
    this.invincibilityTimer = 5;
    this.createParticles(this.player.x, this.player.y, 0xffd84d, 26);
    this.shakeTime = 6;
  }

  private fireLaserShot(): void {
    if (!this.hasLaserBlaster || this.isGameOver || this.laserTimer > 0) return;

    const velocityX = this.player.body.velocity.x ?? 0;
    const velocityY = this.player.body.velocity.y ?? 0;
    const velocityMagnitude = Math.hypot(velocityX, velocityY);

    let directionX = velocityX;
    let directionY = velocityY;

    if (velocityMagnitude < 20) {
      const pointerDx = this.pointer.isDown ? this.pointer.x - this.player.x : 0;
      const pointerDy = this.pointer.isDown ? this.pointer.y - this.player.y : 0;
      const pointerMagnitude = Math.hypot(pointerDx, pointerDy);
      if (pointerMagnitude >= 10) {
        directionX = pointerDx;
        directionY = pointerDy;
      } else if (Math.hypot(this.lastMoveX, this.lastMoveY) >= 0.1) {
        directionX = this.lastMoveX;
        directionY = this.lastMoveY;
      } else {
        directionX = 0;
        directionY = -1;
      }
    }

    const magnitude = Math.hypot(directionX, directionY) || 1;
    const normalizedX = directionX / magnitude;
    const normalizedY = directionY / magnitude;
    const shot = this.add.rectangle(
      this.player.x + normalizedX * 14,
      this.player.y + normalizedY * 14,
      34,
      5,
      0xff3b3b,
      1
    )
      .setDepth(30)
      .setRotation(Math.atan2(normalizedY, normalizedX));
    shot.setData('ttl', 1200);
    const speed = 700;
    shot.setData('vx', normalizedX * speed);
    shot.setData('vy', normalizedY * speed);
    this.physics.add.existing(shot);
    const shotBody = shot.body as Phaser.Physics.Arcade.Body;
    shotBody.setAllowGravity(false);
    shotBody.setImmovable(true);
    shotBody.setSize(34, 5);
    this.laserShots.add(shot);

    const flash = this.add.circle(this.player.x, this.player.y, 10, 0xff7a7a, 0.8).setDepth(29);
    this.add.tween({
      targets: flash,
      alpha: 0,
      scale: 2.2,
      duration: 80,
      onComplete: () => flash.destroy()
    });

    this.laserTimer = 0.1;
  }

  private destroyNearbyBricks(): void {
    const radius = 46;
    const targets = this.obstacles.getChildren().filter((obs: Phaser.GameObjects.GameObject) => {
      const obstacle = obs as CollisionBody;
      if (!obstacle || !obstacle.active || obstacle.getData('steel') === true) return false;
      return Phaser.Math.Distance.Between(this.player.x, this.player.y, obstacle.x, obstacle.y) < radius + obstacle.width * 0.75;
    }) as CollisionBody[];

    targets.forEach((obstacle) => this.destroyObstacleWithExplosion(obstacle));
  }

  private destroyObstacleWithExplosion(obstacle: CollisionBody): void {
    if (!obstacle || !obstacle.active || obstacle.getData('steel') === true) return;
    const currentCurrency = this.registry.get('currency') ?? 0;
    this.registry.set('currency', currentCurrency + 5);
    this.createParticles(obstacle.x, obstacle.y, 0xff6b00, 18);
    this.createParticles(obstacle.x, obstacle.y, 0xff0055, 14);
    obstacle.destroy();
  }

  private destroyBulletWithExplosion(bullet: Phaser.GameObjects.Arc): void {
    if (!bullet || !bullet.active) return;
    this.createParticles(bullet.x, bullet.y, 0xffd84d, 12);
    bullet.destroy();
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
    this.effects.beginPath();
    this.effects.lineStyle(6, 0xff2a2a, 1);
    const dangerY = 630;
    for (let x = 0; x <= this.scale.width; x += 18) {
      const y = dangerY + ((x / 18) % 2 === 0 ? 12 : -12);
      if (x === 0) {
        this.effects.moveTo(x, y);
      } else {
        this.effects.lineTo(x, y);
      }
    }
    this.effects.strokePath();
    this.effects.lineStyle(1, this.timeScale < 0.3 ? 0x00ffcc : 0xff0055, this.timeScale < 0.08 ? 0.08 : 0.15);
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
      this.effects.strokeCircle(this.player.x, this.player.y, SLASH_HITBOX_RADIUS);
    }
    if (!this.isGameOver && !this.isSlash && canTriggerSlash(this.energy, false)) {
      this.effects.lineStyle(2, 0x00ffcc, 0.8);
      this.effects.strokeCircle(this.player.x, this.player.y, SLASH_HITBOX_RADIUS + 4);
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
