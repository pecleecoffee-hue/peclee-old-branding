# Peclee website — GitHub upload

Package version: **2026-11-15-r2**.

## Upload the website

1. Extract this ZIP. Upload its extracted contents, not the ZIP itself.
2. Put `index.html`, `assets`, `tools`, `about`, `contact`, the CSS/JavaScript files,
   and the remaining included files directly at your repository root.
3. Replace the matching files from an older copy. Do not nest this package inside
   a `Peclee-Website` or `dist` folder. Remove an old duplicate site folder only
   after confirming it is no longer used by your hosting configuration.
4. Configure your host to serve this repository root. For GitHub Pages, select
   the branch containing these files and the root folder in the Pages settings.

The website supports a domain root and a GitHub Pages project subdirectory.
Keep `.nojekyll` when uploading. No package installation or build step is needed.
Uploading files to GitHub stores the source; it does not by itself confirm that
the website has been published. Check your host's deployment result afterward.
GitHub setup reference: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

`version.json` identifies this package. Its `release` must be `2026-11-15-r2`.

## Preview and maintain

Run `python3 -m http.server 8000` in the extracted folder, then open
`http://localhost:8000/`. Use a web server rather than opening `index.html` as a
local file.

The main source is `index.html`; the other page HTML files are generated route
copies. After editing the main HTML, run `node scripts/prepare-routes.mjs` to
refresh the seven direct routes. CSS, JavaScript, fonts, images and motion assets
are all included. Read `UPDATE-NOTES.md` for this update's scope.

When moving to a different public domain, update the social metadata URLs in
`index.html` and the corresponding origin used by `scripts/prepare-routes.mjs`,
then regenerate the routes. The previous publication origin is
`https://peclee-evolved.bermitocoffee.chatgpt.site`.

To create another validated ZIP after editing, run
`python3 scripts/export-github.py /absolute/path/Peclee-Website.zip`.
Git history, account credentials, Sites project settings and review screenshots
are not included.
