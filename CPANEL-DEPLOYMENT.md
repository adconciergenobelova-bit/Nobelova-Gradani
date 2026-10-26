# cPanel Deployment

## Before uploading

1. The production domain is `www.nobelovagradani.org`; `CNAME` and the canonical, Open Graph, and structured-data URLs in `index.html` all use it. `CNAME` is used by GitHub Pages and does not configure a cPanel domain.
2. Add the domain to the hosting account and point its DNS to the values provided by the hosting company.
3. Enable SSL for the domain in cPanel, then enable **Force HTTPS Redirect** if available.

## Upload

1. In cPanel, open **File Manager** and open the domain's document root, usually `public_html` for the primary domain. Turn on **Show Hidden Files (dotfiles)** so `.htaccess` is visible.
2. Upload `index.html`, `styles.css`, `script.js`, `tailwind.config.js`, `.htaccess`, `robots.txt`, and `sitemap.xml` to that folder.
3. Upload the whole `img` folder into the same relative location, keeping the `team` and `testimonials` subfolders and all filenames and capitalization unchanged.
4. Do not upload `.git`, the ZIP archives, or the Python utility scripts. `CNAME` is not needed on cPanel.
5. Visit the domain over HTTPS and check the page, images, navigation, and forms.

## Notes

- The website is static; it does not require PHP, a database, or a build command. Tailwind CSS and web fonts are loaded from external services, so those services must be reachable by visitors.
- The forms open a prefilled email draft in the visitor's email application. The visitor must send it; hosting this page does not create automatic email delivery.
