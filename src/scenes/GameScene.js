import Phaser from 'phaser';
import { canTriggerSlash, getEnergyAfterSlash, resolveCollision } from '../gameplay/rules';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.energy = 100;
    this.timeScale = 0.1;
    this.baseSpeed = 4.5;
    this.isSlash = false;
    this.slashTimer = 0;
    this.isGameOver = false;
    this.isStarted = false;
    this.shakeTime = 0;
    this.trail = [];
    this.particles = [];

    // Player setup
    this.player = this.add.circle(180, 520, 10, 0x00ffcc);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Groups
    this.obstacles = this.physics.add.group();
    this.bullets = this.physics.add.group();
    this.effects = this.add.graphics();

    // UI Texts
    this.hudPanel = this.add.rectangle(180, 43, 332, 58, 0x0b0f1e, 0.78)
      .setStrokeStyle(1, 0x00ffcc, 0.2);
    this.scoreText = this.add.text(20, 22, 'DEPTH  0m', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#00ffcc', fontStyle: 'bold', shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 10, stroke: true, fill: true } });
    this.energyText = this.add.text(340, 22, 'ENERGY  100%', { fontFamily: 'Trebuchet MS', fontSize: '14px', color: '#ff176f', fontStyle: 'bold', align: 'right', shadow: { offsetX: 0, offsetY: 0, color: '#ff176f', blur: 10, stroke: true, fill: true } }).setOrigin(1, 0);
    this.statusText = this.add.text(180, 57, 'BULLET TIME', { fontFamily: 'Trebuchet MS', fontSize: '10px', color: '#00ffcc', fontStyle: 'bold', letterSpacing: 2, shadow: { offsetX: 0, offsetY: 0, color: '#00ffcc', blur: 8, stroke: true, fill: true } }).setOrigin(0.5);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Input touch tracking
    this.pointer = this.input.activePointer;

    // Timer for spawning
    this.spawnTimer = 0;

    this.modal = document.getElementById('gameOverModal');
    this.introModal = document.getElementById('introModal');
    this.finalScoreText = document.getElementById('finalScore');
    document.getElementById('startButton')?.addEventListener('click', () => this.startGame());
    document.getElementById('reviveButton')?.addEventListener('click', () => this.watchAdRevive());
    document.getElementById('restartButton')?.addEventListener('click', () => this.restartGame());
  }

  update(time, delta) {
    if (!this.isStarted) {
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) this.startGame();
      return;
    }
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.showMenu();
      return;
    }
    if (this.isGameOver) return;

    let isMoving = false;

    // Keyboard / Touch Movement
    if (this.pointer.isDown) {
      const dx = this.pointer.x - this.player.x;
      const dy = this.pointer.y - this.player.y;
      if (Math.hypot(dx, dy) > 3) {
        this.player.x += dx * 0.2;
        this.player.y += dy * 0.2;
        isMoving = true;
      }
    } else {
      if (this.cursors.left.isDown || this.keys.A.isDown) { this.player.x -= 6; isMoving = true; }
      if (this.cursors.right.isDown || this.keys.D.isDown) { this.player.x += 6; isMoving = true; }
      if (this.cursors.up.isDown || this.keys.W.isDown) { this.player.y -= 6; isMoving = true; }
      if (this.cursors.down.isDown || this.keys.S.isDown) { this.player.y += 6; isMoving = true; }
    }

    this.player.x = Phaser.Math.Clamp(this.player.x, 10, 350);
    this.player.y = Phaser.Math.Clamp(this.player.y, 10, 630);
    if (isMoving) this.trail.push({ x: this.player.x, y: this.player.y, alpha: 0.8 });
    this.trail.forEach((trail) => { trail.alpha -= 0.05; });
    this.trail = this.trail.filter((trail) => trail.alpha > 0);

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.triggerSlash();
    }

    // Time Dilation calculation
    const targetScale = isMoving ? 1.0 : 0.1;
    this.timeScale += (targetScale - this.timeScale) * 0.15;

    if (this.timeScale < 0.3) {
      this.statusText.setText('BULLET TIME (10% SPEED)').setColor('#00ffcc');
    } else {
      this.statusText.setText("REAL-TIME SLICE").setColor("#ff0055");
    }

    // Ability recovery
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

    // Spawning Logic
    this.spawnTimer += this.timeScale;
    if (this.spawnTimer >= 90) {
      this.spawnPattern();
      this.spawnTimer = 0;
    }

    // Move Obstacles & Bullets manually scaled by timeDilation
    const stepSpeed = this.baseSpeed * this.timeScale;
    this.obstacles.getChildren().forEach(obs => {
      obs.y += stepSpeed;
      if (obs.y > 650) obs.destroy();
      this.checkObstacleCollision(obs);
    });

    this.bullets.getChildren().forEach(b => {
      b.y += (6 + this.baseSpeed) * this.timeScale;
      if (b.y > 650) b.destroy();
      if (b.active) this.checkBulletCollision(b);
    });

    this.particles.forEach((particle) => {
      particle.x += particle.vx * this.timeScale;
      particle.y += particle.vy * this.timeScale;
      particle.life -= this.timeScale;
    });
    this.particles = this.particles.filter((particle) => particle.life > 0);

    // Score update
    this.score += this.timeScale * 0.5;
    this.scoreText.setText(`DEPTH: ${Math.floor(this.score)}m`);
    this.drawEffects();
  }

  triggerSlash() {
    if (canTriggerSlash(this.energy, this.isSlash)) {
      this.isSlash = true;
      this.slashTimer = 18;
      this.energy = getEnergyAfterSlash(this.energy);
      this.player.setFillStyle(0xff0055);
      this.shakeTime = 12;
      this.createParticles(this.player.x, this.player.y, 0xff0055, 20);
    }
  }

  spawnPattern() {
    const blockWidth = 45;
    const totalCols = Math.floor(this.scale.width / blockWidth);
    const gapIndex = Math.floor(Math.random() * (totalCols - 1));

    for (let c = 0; c < totalCols; c++) {
      if (c === gapIndex || c === gapIndex + 1) continue;
      const rect = this.add.rectangle(c * blockWidth + 2 + (blockWidth - 4) / 2, -10, blockWidth - 4, 20, 0xff0055);
      this.physics.add.existing(rect);
      this.obstacles.add(rect);
    }

    if (Math.random() < 0.6) {
      const bullet = this.add.circle((gapIndex + 0.5) * blockWidth, -40, 5, 0xffbb00);
      this.physics.add.existing(bullet);
      this.bullets.add(bullet);
    }
  }

  createParticles(x, y, color, count = 8) {
    for (let index = 0; index < count; index += 1) {
      this.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 10,
        vy: (Math.random() - 0.5) * 10,
        size: Math.random() * 3 + 1,
        color,
        life: 25
      });
    }
  }

  checkBulletCollision(bullet) {
    const outcome = resolveCollision(Math.hypot(this.player.x - bullet.x, this.player.y - bullet.y), 15, this.isSlash);
    if (outcome === 'none') return;
    if (outcome === 'destroy') {
      this.createParticles(bullet.x, bullet.y, 0x00ffcc, 10);
      bullet.destroy();
    } else {
      this.triggerGameOver();
    }
  }

  checkObstacleCollision(obstacle) {
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

  drawEffects() {
    this.effects.clear();
    this.effects.lineStyle(1, this.timeScale < 0.3 ? 0x00ffcc : 0xff0055, this.timeScale < 0.3 ? 0.08 : 0.15);
    for (let x = 0; x < this.scale.width; x += 30) {
      this.effects.lineBetween(x, 0, x, this.scale.height);
    }
    this.trail.forEach((trail) => {
      this.effects.fillStyle(0x00ffcc, trail.alpha * 0.4);
      this.effects.fillCircle(trail.x, trail.y, 8);
    });
    this.particles.forEach((particle) => {
      this.effects.fillStyle(particle.color, Math.min(1, particle.life / 25));
      this.effects.fillRect(particle.x, particle.y, particle.size, particle.size);
    });
    if (this.isSlash) {
      this.effects.lineStyle(3, 0xff0055, 1);
      this.effects.strokeCircle(this.player.x, this.player.y, 22);
    }
    if (this.shakeTime > 0) {
      this.cameras.main.setScroll((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
      this.shakeTime -= 1;
    } else {
      this.cameras.main.setScroll(0, 0);
    }
  }

  triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.createParticles(this.player.x, this.player.y, 0xff0055, 30);
    this.finalScoreText.textContent = Math.floor(this.score);
    this.modal.style.display = 'flex';
  }

  startGame() {
    this.isStarted = true;
    this.introModal.style.display = 'none';
  }

  showMenu() {
    this.isStarted = false;
    this.isGameOver = false;
    this.modal.style.display = 'none';
    this.introModal.style.display = 'flex';
    this.obstacles.clear(true, true);
    this.bullets.clear(true, true);
    this.trail = [];
    this.particles = [];
    this.player.setPosition(180, 520);
    this.player.setFillStyle(0x00ffcc);
  }

  watchAdRevive() {
    window.alert('Simulating Rewarded Ad Video... Rewinding 3 seconds of timeline!');
    window.setTimeout(() => {
      this.isGameOver = false;
      this.isStarted = true;
      this.player.setPosition(180, 520);
      this.obstacles.clear(true, true);
      this.bullets.clear(true, true);
      this.modal.style.display = 'none';
    }, 1000);
  }

  restartGame() {
    this.player.setPosition(180, 520);
    this.player.setFillStyle(0x00ffcc);
    this.energy = 100;
    this.score = 0;
    this.spawnTimer = 0;
    this.isSlash = false;
    this.slashTimer = 0;
    this.trail = [];
    this.particles = [];
    this.obstacles.clear(true, true);
    this.bullets.clear(true, true);
    this.isGameOver = false;
    this.isStarted = true;
    this.modal.style.display = 'none';
  }
}
