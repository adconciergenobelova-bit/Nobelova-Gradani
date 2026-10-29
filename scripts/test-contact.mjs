// Exercises contact.php against the local PHP server.
// Run:  php -S 127.0.0.1:8080 -t .     (in another shell)
//       node scripts/test-contact.mjs
const base = process.env.CONTACT_URL || "http://127.0.0.1:8080/contact.php";

// The endpoint rate-limits per IP to 6 requests / 10 minutes, so a second run
// of this file would otherwise start out throttled. Clear the local counters.
import { readdirSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
try {
  for (const entry of readdirSync(tmpdir())) {
    if (entry.startsWith("ng-rate-")) unlinkSync(join(tmpdir(), entry));
  }
} catch {
  /* nothing to clear */
}

const cases = [
  ["GET is rejected", { method: "GET" }, 405],
  [
    "valid inquiry",
    {
      body: new URLSearchParams({
        name: "Test Parent",
        phone: "08031234567",
        service: "Developmental Surveillance",
        message: "My son is 6 and struggling with reading",
        context: "inquiry",
      }),
    },
    200,
  ],
  [
    "valid booking with school",
    {
      body: new URLSearchParams({
        name: "Ada Obi",
        phone: "+2348031234567",
        service: "School Health Screening",
        school: "Greensprings",
        context: "booking",
        date: "2026-11-04",
        time: "10:30",
      }),
    },
    200,
  ],
  ["missing phone", { body: new URLSearchParams({ name: "Test Parent" }) }, 422],
  [
    "invalid phone",
    { body: new URLSearchParams({ name: "Test Parent", phone: "12345" }) },
    422,
  ],
  [
    "one-letter name",
    { body: new URLSearchParams({ name: "A", phone: "08031234567" }) },
    422,
  ],
  [
    "honeypot filled",
    {
      body: new URLSearchParams({
        name: "Bot",
        phone: "08031234567",
        company: "spam",
      }),
    },
    202,
  ],
  [
    "header injection attempt",
    {
      body: new URLSearchParams({
        name: "Bad\r\nBcc: attacker@example.com",
        phone: "08031234567",
      }),
    },
    200,
  ],
];

let failures = 0;
for (const [label, init, expected] of cases) {
  const response = await fetch(base, { method: "POST", ...init });
  const text = await response.text();
  const ok = response.status === expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label.padEnd(26)} ${response.status} (expected ${expected}) ${ok ? "" : text.slice(0, 200)}`
  );
  if (ok && expected === 200) {
    const data = JSON.parse(text);
    console.log(`      ref=${data.ref} mailed=${data.mailed}`);
  }
}

// Rate limit: the window allows 6 per IP, so the 7th onward must be blocked.
let limited = false;
for (let i = 0; i < 8; i += 1) {
  const response = await fetch(base, {
    method: "POST",
    body: new URLSearchParams({ name: "Rate Test", phone: "08031234567" }),
  });
  if (response.status === 429) limited = true;
}
console.log(`${limited ? "PASS" : "FAIL"}  rate limit engages`);
if (!limited) failures += 1;

console.log(failures === 0 ? "\nAll contact.php checks passed." : `\n${failures} failed.`);
process.exit(failures === 0 ? 0 : 1);
