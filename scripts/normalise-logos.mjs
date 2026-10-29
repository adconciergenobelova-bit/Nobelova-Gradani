// Normalises a row of logos so they render at the same visual size.
//
// 1. trim the empty padding around the artwork (transparent or solid)
// 2. scale everything to one height, keeping each logo's aspect ratio
//
// After this, every logo drawn with the same CSS height has artwork of exactly
// that height, instead of one badge filling its canvas while another floats in
// a 375x301 frame with 45% empty margin.
//
// Usage: node scripts/normalise-logos.mjs [height=96] <image> [image...]
import fs from "node:fs/promises";
import sharp from "sharp";

const args = process.argv.slice(2);
const height = Number(args[0]) > 0 ? Number(args.shift()) : 96;
const files = args;

if (!files.length) {
  console.error("usage: node scripts/normalise-logos.mjs [height] <image>...");
  process.exit(1);
}

for (const file of files) {
  const trimmed = sharp(file).trim({ threshold: 2 });
  const { width, height: h } = await trimmed.metadata();
  const buffer = await sharp(file)
    .trim({ threshold: 2 })
    .resize({ height, fit: "inside", withoutEnlargement: false })
    .webp({ quality: 90, alphaQuality: 100 })
    .toBuffer();

  try {
    await fs.writeFile(file, buffer);
  } catch {
    await fs.writeFile(`${file}.new.webp`, buffer);
    console.log(`  (could not overwrite — wrote ${file}.new.webp)`);
  }

  const out = await sharp(file).metadata().catch(() => sharp(`${file}.new.webp`).metadata());
  console.log(
    `${file.padEnd(38)} ${width}x${h} -> ${out.width}x${out.height} (${((buffer.length / 1024)).toFixed(0)} KB)`
  );
}
