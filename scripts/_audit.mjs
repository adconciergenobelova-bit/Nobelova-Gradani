import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors = [];
const pageErrors = [];
const failedRequests = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => pageErrors.push(e.message));
page.on("requestfailed", (r) =>
  failedRequests.push(`${r.url()} :: ${r.failure()?.errorText}`),
);

await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });

const report = await page.evaluate(() => {
  const out = {};
  const ids = [...document.querySelectorAll("[id]")].map((el) => el.id);
  out.duplicateIds = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
  out.idCount = ids.length;

  out.title = document.title;
  out.titleLength = document.title.length;
  out.description =
    document.querySelector('meta[name="description"]')?.content ?? null;
  out.descriptionLength = out.description?.length ?? 0;

  out.lang = document.documentElement.lang;
  out.h1 = [...document.querySelectorAll("h1")].map((h) => h.textContent.trim());

  out.headingOrder = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map(
    (h) => ({
      level: +h.tagName[1],
      text: h.textContent.trim().replace(/\s+/g, " ").slice(0, 70),
    }),
  );

  out.sectionsWithoutName = [...document.querySelectorAll("section")].filter(
    (s) =>
      !s.getAttribute("aria-label") &&
      !s.getAttribute("aria-labelledby") &&
      !s.querySelector("h1,h2,h3,h4,h5,h6"),
  ).length;

  const anchors = [...document.querySelectorAll('a[href^="#"]')];
  out.brokenAnchors = anchors
    .map((a) => a.getAttribute("href"))
    .filter((href) => href !== "#" && !document.querySelector(href));

  const refAttrs = ["aria-controls", "aria-labelledby", "aria-describedby", "aria-owns"];
  out.brokenAriaRefs = [];
  for (const attr of refAttrs) {
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
      el.getAttribute(attr)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((id) => {
          if (!document.getElementById(id))
            out.brokenAriaRefs.push(`${attr}=${id}`);
        });
    });
  }

  out.images = {
    total: document.querySelectorAll("img").length,
    missingAlt: [...document.querySelectorAll("img")].filter(
      (i) => !i.hasAttribute("alt"),
    ).length,
    broken: [...document.querySelectorAll("img")]
      .filter((i) => i.complete && i.naturalWidth === 0)
      .map((i) => i.getAttribute("src")?.slice(0, 80)),
  };

  out.blankTargetNoRel = [...document.querySelectorAll('a[target="_blank"]')]
    .filter((a) => !/noopener|noreferrer/.test(a.rel))
    .map((a) => a.href);

  const controls = [
    ...document.querySelectorAll("input, select, textarea"),
  ].filter((c) => c.type !== "hidden");
  out.unlabeledControls = controls
    .filter((c) => {
      if (c.getAttribute("aria-label") || c.getAttribute("aria-labelledby"))
        return false;
      if (c.closest("label")) return false;
      if (c.id && document.querySelector(`label[for="${CSS.escape(c.id)}"]`))
        return false;
      return true;
    })
    .map((c) => c.id || c.name || c.outerHTML.slice(0, 60));

  out.buttonsWithoutType = [
    ...document.querySelectorAll("button:not([type])"),
  ].length;

  out.emptyControls = [...document.querySelectorAll('button, a[href]')]
    .filter(
      (el) =>
        !el.textContent.trim() &&
        !el.getAttribute("aria-label") &&
        !el.getAttribute("aria-labelledby") &&
        !el.querySelector("img[alt]:not([alt=''])"),
    )
    .map((el) => el.outerHTML.slice(0, 100));

  out.teamCards = document.querySelectorAll(
    ".team-marquee .team-card, .team-marquee article, .team-marquee [class*=card]",
  ).length;
  out.teamTrackChildren = document.querySelector(
    ".team-marquee .marquee-track",
  )?.children.length;
  const teamNames = [...document.querySelectorAll(".team-marquee .marquee-track h3")]
    .map((h) => h.textContent.trim())
    .filter(Boolean);
  out.teamUniqueNames = new Set(teamNames).size;
  out.teamVisibleNames = teamNames.length;

  out.marqueeTracks = [...document.querySelectorAll(".marquee-track")].map(
    (t) => ({
      cls: t.className,
      children: t.children.length,
      dupHidden: t.querySelectorAll('[aria-hidden="true"]').length,
    }),
  );

  out.mailto = [...document.querySelectorAll('a[href^="mailto:"]')].map(
    (a) => a.getAttribute("href"),
  );
  out.tel = [...document.querySelectorAll('a[href^="tel:"]')].map(
    (a) => a.getAttribute("href"),
  );

  out.jsonLd = [];
  document
    .querySelectorAll('script[type="application/ld+json"]')
    .forEach((s) => {
      try {
        JSON.parse(s.textContent);
        out.jsonLd.push("ok");
      } catch (e) {
        out.jsonLd.push(`invalid: ${e.message}`);
      }
    });

  out.ogImage = document.querySelector('meta[property="og:image"]')?.content;
  out.canonical = document.querySelector('link[rel="canonical"]')?.href;
  out.year = document.getElementById("year")?.textContent.trim();

  return out;
});

// Layout overflow at several widths
const overflow = [];
for (const width of [320, 390, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  await page.waitForTimeout(250);
  overflow.push(
    await page.evaluate((w) => ({
      width: w,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }), width),
  );
}

// Verify all local resources referenced by the page return 200
await page.setViewportSize({ width: 1440, height: 900 });
const localUrls = await page.evaluate(() =>
  [
    ...new Set(
      [...document.querySelectorAll("[src], link[href]")]
        .map((el) => el.getAttribute("src") || el.getAttribute("href"))
        .filter((u) => u && !/^(https?:|data:|mailto:|tel:|#)/.test(u)),
    ),
  ],
);
const resourceStatus = [];
for (const u of localUrls) {
  const res = await page.request.get(new URL(u, "http://localhost:4173/").href);
  if (!res.ok()) resourceStatus.push(`${u} -> ${res.status()}`);
}

console.log(
  JSON.stringify(
    {
      report,
      overflow,
      localUrls,
      resourceStatus,
      consoleErrors,
      pageErrors,
      failedRequests,
    },
    null,
    2,
  ),
);
await browser.close();
