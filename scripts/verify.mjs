// Static pre-deploy checks: run with `node scripts/verify.mjs`
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const html = fs.readFileSync("index.html", "utf8");
const notFound = fs.readFileSync("404.html", "utf8");
const js = fs.readFileSync("script.js", "utf8");
const css = fs.readFileSync("assets/tailwind.css", "utf8");

let failures = 0;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? " — " + detail : ""}`);
  if (!ok) failures += 1;
};

// --- structure -------------------------------------------------------------
check((html.match(/<!DOCTYPE html>/gi) || []).length === 1, "single doctype");
check((html.match(/<h1[\s>]/g) || []).length === 1, "single h1");
check(!/cdn\.tailwindcss\.com/.test(html), "Tailwind CDN removed");
check(/assets\/tailwind\.css/.test(html), "compiled stylesheet linked");

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
check(dupes.length === 0, "no duplicate ids", dupes.join(", "));

// --- assets ----------------------------------------------------------------
const refs = new Set();
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
for (const m of notFound.matchAll(/(?:src|href)="([^"]+)"/g)) refs.add(m[1]);
const local = [...refs].filter(
  (r) => !/^(https?:|mailto:|tel:|#|data:)/.test(r)
);
const broken = local.filter((r) => !fs.existsSync(path.join(root, r.split("#")[0])));
check(broken.length === 0, "all local asset references resolve", broken.join(", "));

// Background images live in CSS, where a typo fails silently.
const cssFiles = ["styles.css", "assets/tailwind.css"];
const cssRefs = [];
for (const file of cssFiles) {
  const text = fs.readFileSync(file, "utf8");
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) {
    if (/^(data:|https?:)/.test(m[1])) continue;
    cssRefs.push({ file, ref: m[1] });
  }
}
const brokenCss = cssRefs
  .filter(({ file, ref }) => !fs.existsSync(path.join(path.dirname(path.join(root, file)), ref)))
  .map(({ file, ref }) => `${file}: ${ref}`);
check(brokenCss.length === 0, "every CSS background image exists", brokenCss.join(", "));

// --- css coverage ----------------------------------------------------------
const classAttrs = [
  ...[...html.matchAll(/class="([^"]*)"/g)].map((m) => m[1]),
  ...[...notFound.matchAll(/class="([^"]*)"/g)].map((m) => m[1]),
  ...[...js.matchAll(/class="([^"]*)"/g)].map((m) => m[1]),
  ...[...js.matchAll(/className\s*=\s*"([^"]*)"/g)].map((m) => m[1]),
  ...[...js.matchAll(/classList\.(?:add|toggle|remove)\("([^"]*)"\)/g)].map((m) => m[1]),
];
const custom = fs.readFileSync("styles.css", "utf8");
const esc = (s) => s.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, (c) => "\\" + c);
const hooks = new Set(["lead-form", "form-success", "ref", "tab-panel", "inq-slot", "partner-image-item"]);
const missing = new Set();
for (const attr of classAttrs) {
  for (const token of attr.split(/\s+/)) {
    if (!token || token.includes("${") || hooks.has(token)) continue;
    const forms = [
      "." + token,
      "." + esc(token),
      "." + esc(token).replace(/,/g, "\\2c "),
    ];
    if (forms.some((f) => css.includes(f) || custom.includes(f))) continue;
    // Arbitrary values are escaped in ways that vary by character; the value
    // itself always survives verbatim inside the declaration.
    const arbitrary = /^[a-z-]+\[(.+)\]$/.exec(token);
    if (arbitrary && (css.includes(arbitrary[1]) || custom.includes(arbitrary[1]))) continue;
    missing.add(token);
  }
}
check(missing.size === 0, "every class has a style rule", [...missing].join(", "));

// --- metadata --------------------------------------------------------------
const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1].trim() ?? "";
const desc = /name="description"\s*\n?\s*content="([^"]+)"/.exec(html)?.[1] ?? "";
check(title.length > 0 && title.length <= 65, "title length", `${title.length} chars`);
check(desc.length >= 80 && desc.length <= 165, "meta description length", `${desc.length} chars`);

const og = /property="og:image"\s*\n?\s*content="([^"]+)"/.exec(html)?.[1] ?? "";
check(/img\/og-image\.png$/.test(og), "og:image points at the 1200x630 file", og);

const ld = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
let ldOk = ld.length > 0;
for (const m of ld) {
  try {
    JSON.parse(m[1]);
  } catch {
    ldOk = false;
  }
}
check(ldOk, "structured data parses as JSON");

// --- sitemap ---------------------------------------------------------------
const sitemap = fs.readFileSync("sitemap.xml", "utf8");
check(/www\.nobelovagradani\.org/.test(sitemap), "sitemap uses canonical host");

console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
process.exit(failures === 0 ? 0 : 1);
