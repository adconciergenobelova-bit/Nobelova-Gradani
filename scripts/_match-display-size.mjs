import fs from "node:fs";

const file = "index.html";
let html = fs.readFileSync(file, "utf8");

// Every display-face element that was rendering larger than the section
// headings (20px / 24px) is brought down to exactly the same scale.
const replacements = [
  [
    'class="mt-3 font-display font-bold text-2xl text-ink"',
    'class="mt-3 font-display font-bold text-xl sm:text-2xl text-ink"',
    1,
  ],
  [
    'class="mt-2 font-display font-bold text-3xl text-ink"',
    'class="mt-2 font-display font-bold text-xl sm:text-2xl text-ink"',
    4,
  ],
  [
    'class="font-display font-bold text-2xl text-white flex items-center gap-3"',
    'class="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-3"',
    2,
  ],
  [
    'class="mt-2 font-display font-bold text-lg xl:text-2xl text-ink break-words"',
    'class="mt-2 font-display font-bold text-xl sm:text-2xl text-ink break-words"',
    1,
  ],
];

let failed = 0;
for (const [from, to, expected] of replacements) {
  const count = html.split(from).length - 1;
  if (count !== expected) {
    console.log(`MISMATCH (${count} found, ${expected} expected): ${from}`);
    failed += 1;
    continue;
  }
  html = html.split(from).join(to);
  console.log(`${count}x  ${from.slice(7, 60)}…  ->  text-xl sm:text-2xl`);
}

if (failed) throw new Error("no changes written");
fs.writeFileSync(file, html);

// Anything still above the heading size?
const remaining = [...html.matchAll(/<[a-z0-9]+[^>]*class="[^"]*font-display[^"]*"[^>]*>/g)]
  .map((m) => m[0].replace(/\s+/g, " "))
  .filter((tag) => /text-(?:2xl|3xl|4xl|5xl)|xl:text-2xl/.test(tag));
console.log("display elements still larger than h2:", remaining.length);
for (const tag of remaining) console.log("  " + tag);
