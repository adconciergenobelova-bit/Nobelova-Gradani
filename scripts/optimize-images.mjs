// Generates resized/quality-tuned WebP assets (plus a small PNG for favicon use)
// from the original images. Originals are never modified, so this is idempotent.
// Usage: node scripts/optimize-images.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'img');

/** src (relative to repo root) -> output specs */
const SPECS = [
  // Logo: header/footer <img> (WebP), favicon/apple-touch-icon (small PNG)
  { src: 'Nobelova Gradani Logo.png', out: 'logo.webp', width: 768, quality: 85 },
  { src: 'Nobelova Gradani Logo.png', out: 'logo.png', width: 512, png: true },

  // Hero slideshow backgrounds (referenced from styles.css)
  { src: 'college.png', out: 'college.webp', quality: 80 },
  { src: 'NaijaMap.png', out: 'naija-map.webp', quality: 80 },
  { src: 'helen.jpeg', out: 'helen.webp', quality: 78 },

  // Full-width section photography
  { src: 'section-school-support.jpg', out: 'section-school-support.webp', width: 1280, quality: 75 },
  { src: 'section-classroom.jpg', out: 'section-classroom.webp', width: 1280, quality: 75 },
  { src: 'section-client-session.jpg', out: 'section-client-session.webp', width: 1280, quality: 75 },
  { src: 'apple.jpeg', out: 'apple.webp', quality: 75 },
  { src: 'training.jpeg', out: 'training.webp', width: 1000, quality: 75 },
  { src: 'QABA.jpeg', out: 'qaba.webp', width: 640, quality: 85 },

  // Team portraits: shown in 256-360px wide 4:5 cards, so 640px covers 2x DPR
  { src: 'Daniel Adegbuyi.jpg', out: 'team/daniel-adegbuyi.webp', width: 640, quality: 78 },
  { src: 'Iloabueke Charles.jpg', out: 'team/charles-iloabueke.webp', width: 640, quality: 78 },
  { src: 'Mrs. Helen Oshikoya.jpeg', out: 'team/helen-oshikoya.webp', width: 640, quality: 78 },
  { src: 'Jeremiah Ikhide.jpg', out: 'team/jeremiah-ikhide.webp', width: 640, quality: 78 },
  { src: 'Jeremiah Olalekan.jpg', out: 'team/jeremiah-olalekan.webp', width: 640, quality: 78 },
  { src: 'John Temidayo Ajimisogbe.jpg', out: 'team/john-ajimisogbe.webp', width: 640, quality: 78 },
];

// Testimonial scans: shown at ~400px wide, keep native resolution for legibility.
for (const f of fs.readdirSync(path.join(ROOT, 'testimonials'))) {
  if (/\.(jpe?g|png)$/i.test(f)) {
    SPECS.push({
      src: `testimonials/${f}`,
      out: `testimonials/${f.replace(/\.[^.]+$/, '.webp')}`,
      quality: 82,
    });
  }
}

fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.join(OUT, 'testimonials'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'team'), { recursive: true });

let before = 0;
let after = 0;
const rows = [];

for (const spec of SPECS) {
  const srcPath = path.join(ROOT, spec.src);
  const outPath = path.join(OUT, spec.out);
  const srcSize = fs.statSync(srcPath).size;
  let pipeline = sharp(srcPath).rotate(); // respect EXIF orientation
  if (spec.width) pipeline = pipeline.resize({ width: spec.width, withoutEnlargement: true });
  if (spec.png) {
    await pipeline.png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(outPath);
  } else {
    await pipeline.webp({ quality: spec.quality ?? 80, effort: 6 }).toFile(outPath);
  }
  const outSize = fs.statSync(outPath).size;
  const meta = await sharp(outPath).metadata();
  before += srcSize;
  after += outSize;
  rows.push({
    out: `img/${spec.out}`,
    dims: `${meta.width}x${meta.height}`,
    fromKB: Math.round(srcSize / 1024),
    toKB: Math.round(outSize / 1024),
    saved: `${Math.round((1 - outSize / srcSize) * 100)}%`,
  });
}

console.table(rows);
console.log(`TOTAL: ${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(2)} MB (${Math.round((1 - after / before) * 100)}% smaller)`);
