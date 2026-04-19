class Grid {
  constructor(canvasW, canvasH, gridSize = 6) {
    this.gridSize = gridSize;
    this.reposition(canvasW, canvasH);
  }

  reposition(canvasW, canvasH) {
    const totalSize = Math.min(canvasW * 0.85, canvasH * 0.67);
    this.cellSize = totalSize / this.gridSize;
    this.x = (canvasW - totalSize) / 2;
    this.y = (canvasH - totalSize) / 2;
    this.w = totalSize;
    this.h = totalSize;
  }

  cellRect(row, col) {
    return {
      x: this.x + col * this.cellSize,
      y: this.y + row * this.cellSize,
      w: this.cellSize,
      h: this.cellSize
    };
  }

  cellCenter(row, col) {
    return {
      px: this.x + col * this.cellSize + this.cellSize / 2,
      py: this.y + row * this.cellSize + this.cellSize / 2
    };
  }

  cellAt(px, py) {
    if (px < this.x || px > this.x + this.w || py < this.y || py > this.y + this.h) {
      return null;
    }
    const col = Math.floor((px - this.x) / this.cellSize);
    const row = Math.floor((py - this.y) / this.cellSize);
    if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) return null;
    return { row, col };
  }

  draw(board, winCells, opacity) {
    push();

    // Draw grid lines
    stroke(255, 255, 255, opacity);
    strokeWeight(2);
    noFill();

    // Outer border
    rect(this.x, this.y, this.w, this.h);

    // Internal lines
    for (let i = 1; i < this.gridSize; i++) {
      line(this.x + i * this.cellSize, this.y, this.x + i * this.cellSize, this.y + this.h);
      line(this.x, this.y + i * this.cellSize, this.x + this.w, this.y + i * this.cellSize);
    }

    // Draw win cell highlights
    if (winCells && winCells.length > 0) {
      fill(255, 255, 0, opacity * 0.3);
      noStroke();
      for (let { row, col } of winCells) {
        const r = this.cellRect(row, col);
        rect(r.x, r.y, r.w, r.h);
      }
    }

    // Draw markers
    noFill();
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        const marker = board[row][col];
        if (!marker) continue;

        const { px, py } = this.cellCenter(row, col);
        const isWinCell = winCells && winCells.some(c => c.row === row && c.col === col);
        const markerOpacity = isWinCell ? opacity : opacity;

        const r = this.cellSize * 0.33;

        if (marker === 'O') {
          stroke(100, 200, 255, markerOpacity);
          strokeWeight(3);
          ellipse(px, py, r * 2, r * 2);
        } else {
          stroke(255, 120, 120, markerOpacity);
          strokeWeight(3);
          const half = r * 0.7;
          line(px - half, py - half, px + half, py + half);
          line(px + half, py - half, px - half, py + half);
        }
      }
    }

    pop();
  }
}
