// One-shot rewrite of index.html image references to the optimized WebP assets:
//  - swaps <img> srcs to img/**.webp
//  - marks every image lazy + async except the above-the-fold header logo
//  - points favicon / apple-touch-icon at the small PNG
//  - preloads the first hero slideshow background
// Safe to re-run: it is a no-op once references are rewritten.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const file = path.join(ROOT, 'index.html');

const MAP = {
  'Nobelova Gradani Logo.png': 'img/logo.webp',
  'section-school-support.jpg': 'img/section-school-support.webp',
  'section-classroom.jpg': 'img/section-classroom.webp',
  'section-client-session.jpg': 'img/section-client-session.webp',
  'apple.jpeg': 'img/apple.webp',
  'training.jpeg': 'img/training.webp',
  'QABA.jpeg': 'img/qaba.webp',
  'helen.jpeg': 'img/helen.webp',
  'Daniel Adegbuyi.jpg': 'img/team/daniel-adegbuyi.webp',
  'Iloabueke Charles.jpg': 'img/team/charles-iloabueke.webp',
  'Mrs. Helen Oshikoya.jpeg': 'img/team/helen-oshikoya.webp',
  'Jeremiah Ikhide.jpg': 'img/team/jeremiah-ikhide.webp',
  'Jeremiah Olalekan.jpg': 'img/team/jeremiah-olalekan.webp',
  'John Temidayo Ajimisogbe.jpg': 'img/team/john-ajimisogbe.webp',
};

function addAttrs(tag, attrs) {
  if (/\/>\s*$/.test(tag)) return tag.replace(/\/>\s*$/, ` ${attrs} />`);
  return tag.replace(/>$/, ` ${attrs}>`);
}

let html = fs.readFileSync(file, 'utf8');
const before = html;

let imgs = 0;
let swapped = 0;
let lazy = 0;
let eager = 0;
let logoSeen = 0;

html = html.replace(/<img\b[^>]*>/g, (tag) => {
  imgs++;
  const m = tag.match(/\ssrc="([^"]+)"/);
  if (!m) return tag;
  const decoded = decodeURIComponent(m[1]);
  let out = tag;
  const mapped = MAP[decoded] || (decoded.startsWith('testimonials/') ? `img/${decoded.replace(/\.[^.]+$/, '.webp')}` : null);
  if (mapped && mapped !== decoded) {
    out = out.replace(m[0], ` src="${mapped}"`);
    swapped++;
  }
  if (/\sloading=/.test(out) || /\sfetchpriority=/.test(out)) return out; // already processed
  const isLogo = decoded === 'Nobelova Gradani Logo.png' || m[1] === 'img/logo.webp';
  if (isLogo) {
    logoSeen++;
    if (logoSeen === 1) {
      out = addAttrs(out, 'width="768" height="390" fetchpriority="high" decoding="async"');
      eager++;
      return out;
    }
  }
  out = addAttrs(out, 'loading="lazy" decoding="async"');
  lazy++;
  return out;
});

// Favicon / apple-touch-icon are fetched by the browser on every visit.
html = html.replace(
  /(<link rel="(?:apple-touch-)?icon" href=")Nobelova%20Gradani%20Logo\.png(")/g,
  '$1img/logo.png$2'
);

// Start downloading the first hero slideshow background with the document.
if (!html.includes('rel="preload" as="image"')) {
  html = html.replace(
    /(\n\s*<link rel="apple-touch-icon" href="img\/logo\.png" \/>)/,
    '$1\n    <link rel="preload" as="image" href="img/college.webp" fetchpriority="high" />'
  );
}

fs.writeFileSync(file, html);

console.log(JSON.stringify({
  changed: html !== before,
  imgs,
  swapped,
  lazyAdded: lazy,
  eagerLogo: eager,
  iconRewritten: html.includes('href="img/logo.png"'),
  preloaded: html.includes('href="img/college.webp"'),
  remainingOldRefs: (html.match(/(?:src|href)="(?!img\/)[^"]*\.(?:jpg|jpeg|png|JPG)"/g) || []),
}, null, 2));
