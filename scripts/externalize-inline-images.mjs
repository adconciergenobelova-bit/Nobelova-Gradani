// Replaces inline base64 images in index.html with real WebP files under img/.
// Inline base64 blocks HTML parsing, cannot be cached and cannot be lazy-loaded.
// Run: node scripts/externalize-inline-images.mjs
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const file = path.join(root, "index.html");

let html = await fs.readFile(file, "utf8");
let index = 0;

// Re-scan after every replacement so offsets are always current.
while (true) {
  const match = /src="data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)"/.exec(html);
  if (!match) break;
  index += 1;

  const buffer = Buffer.from(match[2], "base64");
  const isLogo = buffer.length < 80 * 1024;
  const name = isLogo
    ? `partner-logo-${index}.webp`
    : "section-consultation-photo.webp";
  const dir = isLogo ? path.join(root, "img", "partners") : path.join(root, "img");
  await fs.mkdir(dir, { recursive: true });

  const outPath = path.join(dir, name);
  const info = await sharp(buffer).webp({ quality: 82 }).toFile(outPath);
  const rel = path.relative(root, outPath).split(path.sep).join("/");

  const tagStart = html.lastIndexOf("<img", match.index);
  const tagEnd = html.indexOf(">", match.index + match[0].length);
  if (tagStart === -1 || tagEnd === -1) throw new Error("unbalanced <img> tag");

  const tag = html.slice(tagStart, tagEnd + 1);
  const newTag = tag
    .replace(/src="[^"]*"/, `src="${rel}"`)
    .replace(/\s*\/?>$/, ` width="${info.width}" height="${info.height}">`);

  html = html.slice(0, tagStart) + newTag + html.slice(tagEnd + 1);
  console.log(`${rel} <- ${(buffer.length / 1024).toFixed(0)} KB inline (${info.width}x${info.height})`);
}

await fs.writeFile(file, html);
const { size } = await fs.stat(file);
console.log(`index.html is now ${(size / 1024).toFixed(0)} KB`);
