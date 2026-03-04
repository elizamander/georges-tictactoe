class Cursor {
  constructor() {
    this.row = 0;
    this.col = 0;
    this.active = false;
  }

  activate() {
    this.active = true;
  }

  move(dir) {
    switch (dir) {
      case 'up':    this.row = max(0, this.row - 1); break;
      case 'down':  this.row = min(5, this.row + 1); break;
      case 'left':  this.col = max(0, this.col - 1); break;
      case 'right': this.col = min(5, this.col + 1); break;
    }
  }

  draw(grid) {
    if (!this.active) return;

    // Blink: visible when frameCount % 30 < 15
    if (frameCount % 30 >= 15) return;

    const { x, y, w, h } = grid.cellRect(this.row, this.col);

    push();
    fill(255, 255, 255, 60);
    noStroke();
    rect(x, y, w, h);
    stroke(255, 255, 255, 180);
    strokeWeight(2);
    noFill();
    rect(x, y, w, h);
    pop();
  }
}
