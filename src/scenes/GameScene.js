import Phaser from 'phaser';

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

    // Player setup
    this.player = this.add.circle(180, 520, 10, 0x00ffcc);
    this.physics.add.existing(this.player);
    this.player.body.setCollideWorldBounds(true);

    // Groups
    this.obstacles = this.physics.add.group();
    this.bullets = this.physics.add.group();

    // UI Texts
    this.scoreText = this.add.text(20, 20, 'DEPTH: 0m', { font: '14px Courier', fill: '#00ffcc' });
    this.energyText = this.add.text(220, 20, 'ENERGY: 100%', { font: '14px Courier', fill: '#ff0055' });
    this.statusText = this.add.text(180, 50, 'BULLET TIME', { font: '12px Courier', fill: '#00ffcc' }).setOrigin(0.5);

    // Controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Input touch tracking
    this.pointer = this.input.activePointer;

    // Timer for spawning
    this.spawnTimer = 0;
  }

  update(time, delta) {
    if (this.isGameOver) return;

    let isMoving = false;

    // Keyboard / Touch Movement
    if (this.pointer.isDown) {
      const dx = this.pointer.x - this.player.x;
      const dy = this.pointer.y - this.player.y;
      if (Math.hypot(dx, dy) > 5) {
        this.player.x += dx * 0.15;
        this.player.y += dy * 0.15;
        isMoving = true;
      }
    } else {
      if (this.cursors.left.isDown) { this.player.x -= 5; isMoving = true; }
      if (this.cursors.right.isDown) { this.player.x += 5; isMoving = true; }
      if (this.cursors.up.isDown) { this.player.y -= 5; isMoving = true; }
      if (this.cursors.down.isDown) { this.player.y += 5; isMoving = true; }
    }

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.triggerSlash();
    }

    // Time Dilation calculation
    const targetScale = isMoving ? 1.0 : 0.1;
    this.timeScale += (targetScale - this.timeScale) * 0.15;

    if (this.timeScale < 0.3) {
      this.statusText.setText("BULLET TIME (10% SPEED)").setColor("#00ffcc");
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
    });

    this.bullets.getChildren().forEach(b => {
      b.y += (6 + this.baseSpeed) * this.timeScale;
      if (b.y > 650) b.destroy();
    });

    // Score update
    this.score += this.timeScale * 0.5;
    this.scoreText.setText(`DEPTH: ${Math.floor(this.score)}m`);
  }

  triggerSlash() {
    if (this.energy >= 35 && !this.isSlash) {
      this.isSlash = true;
      this.slashTimer = 18;
      this.energy -= 35;
      this.player.setFillStyle(0xff0055);
      this.cameras.main.shake(100, 0.01);
    }
  }

  spawnPattern() {
    const blockWidth = 45;
    const gapIndex = Math.floor(Math.random() * 7);

    for (let c = 0; c < 8; c++) {
      if (c === gapIndex || c === gapIndex + 1) continue;
      const rect = this.add.rectangle(c * blockWidth + 22, -10, blockWidth - 4, 20, 0xff0055);
      this.physics.add.existing(rect);
      this.obstacles.add(rect);
    }
  }
}
