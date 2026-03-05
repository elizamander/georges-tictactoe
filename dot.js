class Dot {
  constructor(homeX, homeY, dotColor) {
    this.homeX = homeX;
    this.homeY = homeY;
    this.x = homeX;
    this.y = homeY;
    this.vx = 0;
    this.vy = 0;
    this.color = dotColor; // 'yellow' | 'green'
    this.baseRadius = Math.min(width, height) * 0.005;
    this.targetX = homeX;
    this.targetY = homeY;
    this.mode = 'field'; // 'field' | 'text' | 'exile'
    this.repelVx = 0;
    this.repelVy = 0;
    this.repelTimer = 0;
  }

  applyRepulsion(px, py, strength, radius) {
    const dx = this.x - px;
    const dy = this.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > radius || dist < 1) return;

    const force = strength * (1 - dist / radius);
    const len = dist;
    this.repelVx = (dx / len) * force;
    this.repelVy = (dy / len) * force;
    this.repelTimer = 1.0;
  }

  update(mX, mY) {
    // Damping
    this.vx *= 0.88;
    this.vy *= 0.88;

    // 1. Perlin wiggle
    const wiggleX = (noise(this.homeX * 0.003, this.homeY * 0.003, frameCount * 0.008) - 0.5) * 2 * 0.25;
    const wiggleY = (noise(this.homeX * 0.003 + 100, this.homeY * 0.003 + 100, frameCount * 0.008) - 0.5) * 2 * 0.25;
    this.vx += wiggleX;
    this.vy += wiggleY;

    // 2. Mouse gravity (field mode only)
    if (this.mode === 'field') {
      const dx = mX - this.x;
      const dy = mY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const clampedDist = Math.max(dist, 40);
      const force = 300 / (clampedDist * clampedDist);
      if (dist > 1) {
        this.vx += (dx / dist) * force;
        this.vy += (dy / dist) * force;
      }
    }

    // 3. Spring to target
    const springK = (this.mode === 'field') ? 0.04 : 0.08;
    this.vx += (this.targetX - this.x) * springK;
    this.vy += (this.targetY - this.y) * springK;

    // 4. Repulsion burst (any mode)
    if (this.repelTimer > 0) {
      this.vx += this.repelVx * this.repelTimer;
      this.vy += this.repelVy * this.repelTimer;
      this.repelTimer = Math.max(0, this.repelTimer - 0.05);
    }

    this.x += this.vx;
    this.y += this.vy;
  }

  draw() {
    push();
    noStroke();
    if (this.color === 'yellow') {
      fill(247, 201, 72);
    } else {
      fill(123, 198, 126);
    }
    ellipse(this.x, this.y, this.baseRadius * 2, this.baseRadius * 2);
    pop();
  }
}
