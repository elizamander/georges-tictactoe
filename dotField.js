class DotField {
  constructor() {
    this.dots = [];
    this._buildField();
  }

  _buildField() {
    this.dots = [];
    const spacing = 40;
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const hx = col * spacing;
        const hy = row * spacing;
        // Checkerboard: yellow if (row+col) is even, green if odd
        const dotColor = (row + col) % 2 === 0 ? 'yellow' : 'green';
        this.dots.push(new Dot(hx, hy, dotColor));
      }
    }
  }

  rebuild() {
    // Recompute home positions after window resize
    const spacing = 40;
    const cols = Math.ceil(width / spacing) + 1;
    const rows = Math.ceil(height / spacing) + 1;
    const needed = cols * rows;

    // Rebuild from scratch for simplicity
    this._buildField();
  }

  update(mX, mY) {
    for (let dot of this.dots) {
      dot.update(mX, mY);
    }
  }

  draw() {
    for (let dot of this.dots) {
      dot.draw();
    }
  }

  onMarkerPlaced(px, py) {
    const repelRadius = 150;
    const repelStrength = 25;
    for (let dot of this.dots) {
      dot.applyRepulsion(px, py, repelStrength, repelRadius);
    }
  }

  getTextPixels(word) {
    const buf = createGraphics(width, height);
    buf.pixelDensity(1); // force 1:1 so pixel index math is simple
    buf.background(0);
    buf.fill(255);
    buf.noStroke();
    buf.textAlign(CENTER, CENTER);
    buf.textFont('Courier New');
    buf.textStyle(BOLD);
    buf.textSize(200);
    buf.text(word, width / 2, height / 2);
    buf.loadPixels();

    const positions = [];
    const step = 20;
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const idx = (y * width + x) * 4;
        if (buf.pixels[idx] > 128) {
          positions.push({ x, y });
        }
      }
    }

    buf.remove();
    return positions;
  }

  formText(word) {
    const targets = this.getTextPixels(word);

    // Build exile positions evenly around 4 edges
    const exilePositions = this._getExilePositions(this.dots.length);

    let textIdx = 0;
    let exileIdx = 0;

    for (let dot of this.dots) {
      if (textIdx < targets.length) {
        dot.targetX = targets[textIdx].x;
        dot.targetY = targets[textIdx].y;
        dot.mode = 'text';
        textIdx++;
      } else {
        dot.targetX = exilePositions[exileIdx % exilePositions.length].x;
        dot.targetY = exilePositions[exileIdx % exilePositions.length].y;
        dot.mode = 'exile';
        exileIdx++;
      }
    }
  }

  _getExilePositions(count) {
    const positions = [];
    const margin = -60; // just off screen
    // Distribute around edges
    const perEdge = Math.ceil(count / 4);

    // Top edge
    for (let i = 0; i < perEdge; i++) {
      positions.push({ x: (i / perEdge) * width, y: margin });
    }
    // Bottom edge
    for (let i = 0; i < perEdge; i++) {
      positions.push({ x: (i / perEdge) * width, y: height - margin });
    }
    // Left edge
    for (let i = 0; i < perEdge; i++) {
      positions.push({ x: margin, y: (i / perEdge) * height });
    }
    // Right edge
    for (let i = 0; i < perEdge; i++) {
      positions.push({ x: width - margin, y: (i / perEdge) * height });
    }

    return positions;
  }

  returnToField() {
    for (let dot of this.dots) {
      dot.targetX = dot.homeX;
      dot.targetY = dot.homeY;
      dot.mode = 'field';
    }
  }

  allNearHome() {
    if (this.dots.length === 0) return true;
    let totalDist = 0;
    for (let dot of this.dots) {
      const dx = dot.x - dot.homeX;
      const dy = dot.y - dot.homeY;
      totalDist += Math.sqrt(dx * dx + dy * dy);
    }
    return (totalDist / this.dots.length) < 5;
  }
}
