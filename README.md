# Peclee website — GitHub upload

This ZIP contains the complete website from the latest published source, including the PESO/PESOmini photo-framing correction and the sitewide proportion refinements.

## Upload to GitHub

1. Extract this ZIP on your device.
2. Upload all the extracted files and folders inside `Peclee-Website` to your repository, preserving the folder structure. Upload the extracted contents rather than only the ZIP.
3. Keep `dist`, `scripts`, `docs`, and both Markdown instructions at the repository root.

## Website files

- `dist/`: deployable website, all pages, CSS, JavaScript, product photos, fonts and motion assets.
- `scripts/prepare-routes.mjs`: refreshes the seven direct page routes after editing `dist/index.html`. Run with Node.js: `node scripts/prepare-routes.mjs`.
- `DESIGN-NOTES.md`: design, functionality and verification notes.
- `docs/verification.md`: scroll-animation review notes.

## Hosting

Serve `dist/` as the website's document root. No package installation or build step is required to deploy the included files. To preview locally with Python: `python3 -m http.server 8000 --directory dist`, then open `http://localhost:8000`.

Uploading to GitHub stores the source; it does not by itself publish a website. The current navigation and assets use root-relative paths. Hosting at a domain root works as supplied; a GitHub Pages project URL under `/<repository>/` needs base-path changes before deployment.

When moving to a different domain, update the social metadata origin in `dist/index.html` and `scripts/prepare-routes.mjs`, then regenerate the routes. The current origin is `https://peclee-evolved.bermitocoffee.chatgpt.site`.

The existing newsletter uses an email-enquiry fallback. No email-marketing service credentials are included. Product purchase links retain their original destinations.

## Export provenance

Source commit: `22e2153783191e1d115f72c35fbe777e9cdc7d10`
Export date: 15 November 2026.
Git history, Sites project binding, private credentials and temporary review files are excluded. All deployable website files are unchanged from the published source commit.
