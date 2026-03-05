# Text Formation Bug-Fixing Notes

## Background

When a player wins (or the board draws), the dot field is supposed to animate into the text "YOU WON!" or "DRAW". Dots not needed for letters are exiled off-screen. This is driven by `getTextPixels()` in `dotField.js`, which renders text into a p5.Graphics buffer, samples pixel brightness on a grid, and returns the lit positions as targets for dots.

---

## Bug 1: All dots exploded off-screen, screen went black

**Symptom:** On win, the grid faded out, then all dots flew off the edges of the window. No text appeared. The screen showed only the dark background.

**Root cause:** Retina / high-DPI displays default to `pixelDensity(2)` in p5.js. A `p5.Graphics` buffer created with `createGraphics(width, height)` inherits this density, so its internal pixel array is `4×` larger than expected (width×2 × height×2 × 4 bytes). The sampling loop indexed pixels as `(y * width + x) * 4`, which is only correct for density 1. At density 2, every sampled address was wrong — all reads returned 0 (black). `getTextPixels()` returned an empty array, so zero dots were assigned to text targets. Every dot was sent to exile instead.

**Fix:** Call `buf.pixelDensity(1)` immediately after `createGraphics()`. This forces the buffer to a 1:1 pixel array regardless of the display's device pixel ratio, making the index math correct.

```js
const buf = createGraphics(width, height);
buf.pixelDensity(1); // ← fix
```

---

## Bug 2: Text appeared but was garbled / blobby

**Symptom:** Letters were recognisable but very dense — dots overlapped and merged into blobs rather than reading as discrete dot-matrix characters.

**Root cause:** Dots have a 7px radius (14px diameter). The pixel sampling step was 16px, so adjacent text-target positions were only 16px apart — nearly touching. The letters looked solid rather than dotted.

**Fix (attempt 1):** Increased sampling step from 16px to 20px. This gave a 6px gap between dot edges, which helped but left each letter with too few dots (font size 120px ÷ step 20px ≈ 6 rows per character — too coarse to read).

**Fix (attempt 2):** Increased font size from 120px to 200px. More pixels lit per character means more dots assigned to each letter, giving higher effective resolution at the same step size. (~10 rows per character at 200px/20px.)

---

## Bug 3: Text still garbled — letterforms unclear

**Symptom:** Letters were bigger but still hard to read. The font's proportional letterforms didn't sample cleanly onto the 20px grid.

**Fix (attempt 1):** Switched the render font to **Courier New Bold**. Monospace fonts have consistent character widths and thick, simple strokes that align better with a regular dot grid. No CDN dependency — Courier New is available in all browsers.

```js
buf.textFont('Courier New');
buf.textStyle(BOLD);
buf.textSize(200);
```

**Fix (attempt 2 — Bug 3 final fix):** Shrunk dot radius (7→4px) and tightened field spacing (40→28px). With 14px-diameter dots and a 20px sampling step, adjacent text-dots had only a 6px gap and nearly merged into a solid mass. Reducing radius to 4px (8px diameter) opens the gap to 12px — each dot is now visually distinct. Halving the field spacing to 28px keeps background density similar (~2× more dots, same area coverage feeling) and ensures enough dots exist for both text and exile positions.

---

## Current parameters (as of last session)

| Parameter | Value |
|---|---|
| Sampling step | 20px |
| Font | Courier New Bold |
| Font size | 200px |
| Dot radius | 4px (8px diameter) |
| Field spacing | 28px |
| Pixel density on buffer | 1 |
