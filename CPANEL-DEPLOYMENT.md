# cPanel Deployment

The site is static: no PHP, no database, no framework. The only build step is
the stylesheet (`npm run build:css`), and the compiled output is committed, so
you can also deploy straight from a fresh clone.

---

## 0. Before you upload

```bash
npm install          # only if node_modules is missing
npm run build:css    # regenerates assets/tailwind.css from src/tailwind.css
npm run verify       # 12 static checks — must print "All checks passed."
```

`npm run verify` fails loudly on the mistakes that caused the last round of
problems: a missing asset, a duplicated `id`, a Tailwind class with no rule, a
title/meta description that search engines will truncate, or a `og:image` that
does not point at the 1200×630 file.

---

## 1. Delete these from `public_html` (do this first)

On 2026-10-29 the following were publicly downloadable from the live domain:

| File | Why it must go |
| --- | --- |
| `nobelova gradani.zip` | 240 MB archive of the whole project (`node_modules` included) |
| `package.json`, `package-lock.json` | dependency inventory, version numbers, an obvious attack surface |
| `CPANEL-DEPLOYMENT.md` | an out-of-date copy that still referenced `nobelova.com` |
| `fix_registry_phones.py`, `update_numbers.py` | maintenance scripts |
| `README.md`, `.github/`, `.vscode/`, `tests/`, `scripts/`, `test-results/` | source and CI config |
| `*.jpg` in the web root | 5–7 MB camera originals; every image the site renders is a `.webp` under `img/` |

The new `.htaccess` returns 404 for all of the above, but that is a safety net —
delete the files themselves so they stop occupying disk and bandwidth.

---

## 2. Upload

Everything below, preserving paths:

```
index.html
404.html
contact.php                <- new, optional endpoint for server-side lead capture
styles.css
script.js
assets/tailwind.css        <- new, compiled; replaces the Tailwind CDN
src/tailwind.css           <- source for the build (not needed by visitors)
tailwind.config.js         <- build config (not needed by visitors)
.htaccess
robots.txt
sitemap.xml
img/                       <- whole folder, including team/, testimonials/ and partners/
```

Do **not** upload: `.git`, `node_modules`, `*.zip`, `scripts/`, `tests/`,
`package*.json`, `*.md`, the root-level `.jpg` files, `screenshots/`,
`.npm-cache/`.

`CNAME` is for GitHub Pages and is not used by cPanel. `index.html` is the only
page; every canonical, Open Graph and structured-data URL already points at
`https://www.nobelovagradani.org/`.

---

## 3. Verify after upload

```bash
# 1. The homepage is the new build (look for assets/tailwind.css)
curl -s https://www.nobelovagradani.org/ | grep -c "assets/tailwind.css"   # 1

# 2. The archive and dev files are gone
curl -s -o /dev/null -w "%{http_code}\n" https://www.nobelovagradani.org/nobelova%20gradani.zip   # 404
curl -s -o /dev/null -w "%{http_code}\n" https://www.nobelovagradani.org/package.json             # 404

# 3. Unknown URLs return a real 404, not the homepage
curl -s -o /dev/null -w "%{http_code}\n" https://www.nobelovagradani.org/no-such-page             # 404

# 4. One canonical host: both of these must answer 301 -> https://www...
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" http://nobelovagradani.org/
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://nobelovagradani.org/

# 5. Security headers
curl -sI https://www.nobelovagradani.org/ | grep -Ei "strict-transport|x-content-type|x-frame|referrer-policy|permissions-policy"
```

If step 3 still returns `200`, the host has a catch-all set outside
`.htaccess` (cPanel: **Domains → Manage → Error Pages**, or a
`FallbackResource`/`ErrorDocument 404 /index.html` line in the vhost). Remove it
there — `ErrorDocument 404 /404.html` cannot override it from `.htaccess`.

---

## 4. After the deploy

- [ ] Re-submit `sitemap.xml` in Google Search Console; the old soft-404 URLs
      will drop out of the index over the next few weeks.
- [ ] Re-check the share preview with the [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
      and the [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
      — the `og:image` changed from a 959 KB logo PNG to the 1200×630
      `img/og-image.png`, and both tools cache aggressively.
- [ ] Decide whether to enforce the Content-Security-Policy that is currently
      commented out at the bottom of `.htaccess`. It needs the two inline
      `<script>` blocks in `index.html` (and the year script in `404.html`)
      moved into `script.js` first, then a browser test.

---

## Contact endpoint (`contact.php`)

Uploading `contact.php` turns on server-side lead capture. The form stays usable
without it: `script.js` posts to `contact.php` first, and if the request fails
(bad host, no PHP, offline) it falls back to the WhatsApp / email / copy panel
exactly as before. Nothing breaks if you skip this file.

What it does on every accepted submission:

1. Validates the name and Nigerian phone number, caps every field length.
2. Drops silent bots via a hidden `company` honeypot field.
3. Rate limits to 6 submissions per 10 minutes per IP.
4. Emails `contact@`, `klinicappointment@` and the Gmail inbox with a reference
   like `NG-INQ-4F1A2C`.
5. Appends the same record to `private/leads.jsonl` — **this is what makes a
   lead recoverable when `mail()` fails**, which is common on shared hosting.

**After upload:**

```bash
# 1. PHP is executing (not downloading contact.php as text)
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  -d "name=Deploy Test&phone=08031234567" https://www.nobelovagradani.org/contact.php
# expect: 200

# 2. The backup folder is not readable from the web
curl -s -o /dev/null -w "%{http_code}\n" https://www.nobelovagradani.org/private/leads.jsonl
# expect: 404
```

Then place a real test inquiry through the site and confirm it arrives. If
`mail()` is unavailable on the plan, the record still lands in
`private/leads.jsonl` — download it weekly, or point `RECIPIENTS` at a relay
address if the host provides one. `~/logs` in cPanel usually shows the mail
error.

The recipients and sender live at the top of `contact.php`; edit them there, not
in `script.js`.

---

## Known gaps

- **No analytics.** Nothing counts form starts, form completions or WhatsApp
  clicks, so conversion is still unmeasured. A privacy-light option (Plausible,
  Fathom) or a GA4 event on the two success panels would close this.
- **`www` and the apex both answer 200 today.** The `.htaccess` in this deploy
  fixes it; run check 4 above once it is live.
- **Inline scripts block a strict CSP.** `index.html` has one `<script>` for the
  partner marquee and `404.html` one for the footer year. Move both into
  `script.js`, test in a browser, then uncomment the CSP line in `.htaccess`.
