# DLNE memory

<!-- What the DLNE agent remembers about this project. It reads this file at the start of every request and sends it, with the rest of the prompt, to the DLNE swarm (the coordinator or a volunteer's coding member). Add, edit or delete lines freely; keep secrets out. -->

- Nobelova Gradani website: static single-page site at index.html with script.js, styles.css, assets/tailwind.css. Deployed on cPanel/Apache. Uses Tailwind CSS v3.4 compiled from src/tailwind.css. Contact form via contact.php with honeypot/rate-limiting. Build: `npm run build:css` (tailwindcss -c tailwind.config.js -i src/tailwind.css -o assets/tailwind.css --minify). Verify: `node scripts/verify.mjs`. Tests: `npx playwright test`. Phone: 2349037854234. Email: nobelovagradani@gmail.com. <!-- dlne -->
- Location: Obanikoro, Lagos, Nigeria. New files: manifest.json (PWA), plausible.config.json (analytics). CSP is enforced in .htaccess. Plausible analytics loaded conditionally (skipped on localhost/tests). <!-- dlne -->
- Location: Obanikoro, Lagos, Nigeria. Analytics: Plausible via plausible.localsend.js (conditionally loaded on live domains only, skipped on localhost/test). CSP is enforced in .htaccess with 'unsafe-inline' for scripts (for 404.html year script). manifest.json and plausible.config.json are new deployment files. <!-- dlne -->
- Location: Obanikoro, Lagos, Nigeria. <!-- dlne -->
