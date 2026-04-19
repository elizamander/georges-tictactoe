class Menu {
  constructor() {
    this.options = [
      { size: 3, winLength: 3, label: '3×3 / 3-to-win' },
      { size: 4, winLength: 3, label: '4×4 / 3-to-win' },
      { size: 5, winLength: 4, label: '5×5 / 4-to-win' },
      { size: 6, winLength: 4, label: '6×6 / 4-to-win' },
    ];
    this.selectedIndex = -1;
    this._rects = [];
    this._previewSize = 0;
    this._labelH = 30;
    this._pad = 8;
  }

  computeLayout(centerY) {
    const previewSize = min(width, height) * 0.13;
    const gap = previewSize * 0.4;
    const totalW = 4 * previewSize + 3 * gap;
    const startX = (width - totalW) / 2;

    this._previewSize = previewSize;
    this._rects = this.options.map((_, i) => ({
      x: startX + i * (previewSize + gap),
      y: centerY - previewSize / 2,
      w: previewSize,
      h: previewSize,
    }));
  }

  getBoundingRect() {
    if (!this._rects.length) return { x: 0, y: 0, w: width, h: height };
    const margin = 40;
    const first = this._rects[0];
    const last = this._rects[this._rects.length - 1];
    return {
      x: first.x - margin,
      y: first.y - margin,
      w: (last.x + last.w) - first.x + 2 * margin,
      h: first.h + this._labelH + 8 + 2 * margin,
    };
  }

  optionAt(px, py) {
    for (let i = 0; i < this._rects.length; i++) {
      const r = this._rects[i];
      if (px >= r.x - this._pad && px <= r.x + r.w + this._pad &&
          py >= r.y - this._pad && py <= r.y + r.h + this._labelH + this._pad) {
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

  draw(opacity, centerY) {
    if (centerY !== undefined) this.computeLayout(centerY);
    if (!this._rects.length || opacity <= 0) return;

    push();

    for (let i = 0; i < this.options.length; i++) {
      const opt = this.options[i];
      const r = this._rects[i];
      const isSelected = this.selectedIndex === i;
      const baseAlpha = opacity * (isSelected ? 1.0 : 0.65);

      if (isSelected) {
        noStroke();
        fill(255, 255, 255, 60 * opacity / 255);
        rect(r.x - this._pad, r.y - this._pad,
             r.w + this._pad * 2, r.h + this._labelH + 8 + this._pad * 2, 4);
        stroke(255, 255, 255, 180 * opacity / 255);
        strokeWeight(2);
        noFill();
        rect(r.x - this._pad, r.y - this._pad,
             r.w + this._pad * 2, r.h + this._labelH + 8 + this._pad * 2, 4);
      }

      this._drawMiniGrid(opt.size, r.x, r.y, r.w, r.h, baseAlpha);

      noStroke();
      fill(255, 255, 255, baseAlpha);
      textAlign(CENTER, TOP);
      textFont('Courier New');
      textStyle(NORMAL);
      textSize(max(10, this._previewSize * 0.13));
      text(opt.label, r.x + r.w / 2, r.y + r.h + 8);
    }

    pop();
  }

  _drawMiniGrid(size, x, y, w, h, alpha) {
    push();
    stroke(255, 255, 255, alpha);
    strokeWeight(1.5);
    noFill();
    rect(x, y, w, h);
    const cw = w / size;
    const ch = h / size;
    for (let i = 1; i < size; i++) {
      line(x + i * cw, y, x + i * cw, y + h);
      line(x, y + i * ch, x + w, y + i * ch);
    }
    pop();
  }
}
