// Makes the backdrop of a flat logo transparent.
//
// Flood-fills inward from the border through pixels that match the border
// colour, so a white page around a badge disappears while white *inside* the
// badge (letters, ribbon text, the gap inside a shape) is preserved because it
// is not connected to the edge.
//
// Usage: node scripts/make-transparent.mjs img/a.webp img/b.webp
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";

const TOLERANCE = Number(process.env.TOL || 34); // max channel distance still considered background
const files = process.argv.slice(2);

if (!files.length) {
  console.error("usage: node scripts/make-transparent.mjs <image> [image...]");
  process.exit(1);
}

/** Most common colour along the outer border, quantised to 5 bits. */
function borderColour(data, width, height) {
  const counts = new Map();
  const add = (x, y) => {
    const i = (y * width + x) * 4;
    const key = `${data[i] >> 3},${data[i + 1] >> 3},${data[i + 2] >> 3}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  };
  for (let x = 0; x < width; x += 1) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    add(0, y);
    add(width - 1, y);
  }
  const [key] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  return key.split(",").map((v) => (Number(v) << 3) + 4);
}

function distance(data, i, [br, bg, bb]) {
  return Math.max(
    Math.abs(data[i] - br),
    Math.abs(data[i + 1] - bg),
    Math.abs(data[i + 2] - bb)
  );
}

for (const file of files) {
  const { data, info } = await sharp(file)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  const channels = info.channels;

  const background = borderColour(data, width, height);
  const cleared = new Uint8Array(width * height);
  const queue = [];

  const consider = (x, y) => {
    const p = y * width + x;
    if (cleared[p]) return;
    if (distance(data, p * channels, background) > TOLERANCE) return;
    cleared[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < width; x += 1) {
    consider(x, 0);
    consider(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    consider(0, y);
    consider(width - 1, y);
  }

  while (queue.length) {
    const p = queue.pop();
    const x = p % width;
    const y = (p - x) / width;
    if (x > 0) consider(x - 1, y);
    if (x < width - 1) consider(x + 1, y);
    if (y > 0) consider(x, y - 1);
    if (y < height - 1) consider(x, y + 1);
  }

  let clearedCount = 0;
  for (let p = 0; p < width * height; p += 1) {
    if (cleared[p]) {
      data[p * channels + 3] = 0;
      clearedCount += 1;
    }
  }

  // Soften the silhouette: pixels touching the new transparency get partial
  // alpha based on how far they sit from the background colour, which stops
  // the hard white/black fringe that a binary cut leaves behind.
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      if (cleared[p]) continue;
      const touching =
        (x > 0 && cleared[p - 1]) ||
        (x < width - 1 && cleared[p + 1]) ||
        (y > 0 && cleared[p - width]) ||
        (y < height - 1 && cleared[p + width]);
      if (!touching) continue;
      const d = distance(data, p * channels, background);
      const alpha = Math.round(Math.min(255, (d / TOLERANCE) * 255));
      data[p * channels + 3] = alpha;
    }
  }

  const out = path.resolve(file);
  const temp = `${out}.new.webp`;
  const { size } = await sharp(data, { raw: { width, height, channels } })
    .webp({ quality: 90, alphaQuality: 100 })
    .toFile(temp);
  console.log(
    `${file}: ${width}x${height} cleared ${((clearedCount / (width * height)) * 100).toFixed(1)}% -> ${(size / 1024).toFixed(0)} KB`
  );
}




