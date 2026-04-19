class Menu {
  constructor() {
    this.options = [
      { size: 3, winLength: 3, label: '3×3' },
      { size: 5, winLength: 4, label: '5×5' },
      { size: 6, winLength: 4, label: '6×6' },
    ];
    this.selectedIndex = -1;
    this._rects = [];
    this._optH = 0;
    this._fontSize = 0;
  }

  computeLayout(centerY, fontSize) {
    if (fontSize === undefined) fontSize = min(width * 0.09, 60);
    this._fontSize = fontSize;
    const optW = fontSize * 2.6;
    const optH = fontSize * 1.6;
    const gap = fontSize * 0.9;
    const totalW = this.options.length * optW + (this.options.length - 1) * gap;
    const startX = (width - totalW) / 2;
    this._optH = optH;

    this._rects = this.options.map((_, i) => ({
      x: startX + i * (optW + gap),
      y: centerY - optH / 2,
      w: optW,
      h: optH,
    }));
  }

  getBoundingRect() {
    if (!this._rects.length) return { x: 0, y: 0, w: width, h: height };
    const margin = 50;
    const first = this._rects[0];
    const last = this._rects[this._rects.length - 1];
    return {
      x: first.x - margin,
      y: first.y - margin,
      w: (last.x + last.w) - first.x + 2 * margin,
      h: this._optH + 2 * margin,
    };
  }

  optionAt(px, py) {
    for (let i = 0; i < this._rects.length; i++) {
      const r = this._rects[i];
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
        return i;
      }
    }
    return -1;
  }

  updateHover(mx, my) {
    const idx = this.optionAt(mx, my);
    if (idx >= 0) this.selectedIndex = idx;
  }

  moveLeft() {
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    } else if (this.selectedIndex > 0) {
      this.selectedIndex--;
    }
  }

  moveRight() {
    if (this.selectedIndex < 0) {
      this.selectedIndex = 0;
    } else if (this.selectedIndex < this.options.length - 1) {
      this.selectedIndex++;
    }
  }

  draw(opacity, centerY, fontSize) {
    if (centerY !== undefined) this.computeLayout(centerY, fontSize);
    if (!this._rects.length || opacity <= 0) return;

    push();
    textFont('Courier New');
    textStyle(BOLD);
    textAlign(CENTER, CENTER);

    for (let i = 0; i < this.options.length; i++) {
      const opt = this.options[i];
      const r = this._rects[i];
      const isSelected = this.selectedIndex === i;
      const baseAlpha = opacity * (isSelected ? 1.0 : 0.6);
      const pad = 6;

      if (isSelected) {
        noStroke();
        fill(255, 255, 255, 60 * opacity / 255);
        rect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, 4);
        stroke(255, 255, 255, 180 * opacity / 255);
        strokeWeight(2);
        noFill();
        rect(r.x - pad, r.y - pad, r.w + pad * 2, r.h + pad * 2, 4);
      }

      noStroke();
      fill(255, 255, 255, baseAlpha);
      textSize(this._fontSize);
      text(opt.label, r.x + r.w / 2, r.y + r.h / 2);
    }

    pop();
  }
}
