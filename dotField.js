class DotField {
  constructor() {
    this.dots = [];
    this._buildField();
  }

  _buildField(spacing = 28) {
    this.dots = [];
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
    this._buildField();
  }

  rebuildWithSpacing(spacing) {
    this._buildField(spacing);
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

  getTextPixels(lines, fontSize) {
    // lines: string or array of strings to render
    if (typeof lines === 'string') lines = [lines];

    const buf = createGraphics(width, height);
    buf.pixelDensity(1); // force 1:1 so pixel index math is simple
    buf.background(0);
    buf.fill(255);
    buf.noStroke();
    buf.textAlign(CENTER, CENTER);
    buf.textFont('Courier New');
    buf.textStyle(BOLD);
    buf.textSize(fontSize);

    if (lines.length === 1) {
      buf.text(lines[0], width / 2, height / 2);
    } else {
      const lineSpacing = fontSize * 1.1;
      const totalHeight = (lines.length - 1) * lineSpacing;
      const startY = height / 2 - totalHeight / 2;
      for (let i = 0; i < lines.length; i++) {
        buf.text(lines[i], width / 2, startY + i * lineSpacing);
      }
    }

    buf.loadPixels();

    const positions = [];
    const step = 14;
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
    const words = word.split(' ');
    const lines = words.length > 1 ? words : [word];
    const baseFontSize = Math.min(width * 0.35, lines.length > 1 ? 280 : 300);
    const targets = this.getTextPixels(lines, baseFontSize);

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
