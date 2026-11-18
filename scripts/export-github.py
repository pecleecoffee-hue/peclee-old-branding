#!/usr/bin/env python3
"""Create and verify a portable Peclee website ZIP using only the stdlib."""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo


VERSION = "2026-11-18-r4"
ZIP_DATE = (2026, 11, 18, 0, 0, 0)
REQUIRED = (
    "index.html",
    "refinements.css",
    "spotlight.css",
    "spotlight.js",
    "version.json",
    "assets/motion-rest.webp",
    "assets/motion-hand.webp",
    "assets/motion-dripper.webp",
    "assets/peso-navy-main.jpg",
    "assets/peso-navy-front.webp",
    "route-search.js",
    "guides/peso-vs-pesomini/index.html",
    "ar/guides/peso-vs-pesomini/index.html",
    "ar/tools/peso/index.html",
    "robots.txt",
    "sitemap.xml",
    "assets/pesomini-green-main.jpg",
    "tools/index.html",
    "tools/orphe/index.html",
    "tools/kivi/index.html",
    "tools/peso/index.html",
    "tools/pesomini/index.html",
    "about/index.html",
    "contact/index.html",
)

README = """# Peclee website — GitHub upload

Package version: **2026-11-18-r4**.

## Upload the website

1. Extract this ZIP. Upload its extracted contents, not the ZIP itself.
2. Put `index.html`, `assets`, `tools`, `about`, `contact`, the CSS/JavaScript files,
   the ar and guides folders, and the remaining files at your repository root.
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

`version.json` identifies this package. Its `release` must be `2026-11-18-r4`.

## Preview and maintain

Run `python3 -m http.server 8000` in the extracted folder, then open
`http://localhost:8000/`. Use a web server rather than opening `index.html` as a
local file.

The main source is `index.html`; the other page HTML files are generated route
copies. After editing the main HTML, run `node scripts/prepare-routes.mjs` to
refresh the English and Arabic pages. CSS, JavaScript, fonts, images and motion assets
are all included. Read `UPDATE-NOTES.md` for this update's scope.

The canonical production domain for search and sharing is www.peclee.com.
After changing the product catalogue, photo files or public domain, run the route
generator before re-exporting. Keep existing custom-domain hosting settings.

To create another validated ZIP after editing, run
`python3 scripts/export-github.py /absolute/path/Peclee-Website.zip`.
Git history, account credentials, Sites project settings and review screenshots
are not included.
"""

UPDATE_NOTES = """# Peclee update · 18 November 2026

- Updated product specifications and the bilingual grind guide using the exact
  Peclee product listings on Noon Saudi Arabia.
- Added a single full-size PESO photo for the product cards and detail page.
  The original two-view photograph is available in the gallery.
- Reframed the mobile and desktop opening and its motion controls.
- Improved product history, Arabic controls, and retailer links.
- Updated About, trade and limited-edition email enquiries.
- Added independent English and Arabic pages and a bilingual PESO buying guide.
- Included per-page search/social metadata, static product information,
  sitemap.xml, and robots.txt.
"""


def collect_files(project: Path) -> dict[str, bytes]:
    """Collect site bytes without repository bindings or local review artifacts."""
    site = project / "dist" if (project / "dist" / "index.html").is_file() else project
    missing = [name for name in REQUIRED if not (site / name).is_file()]
    if missing:
        raise ValueError("Missing required website files: " + ", ".join(missing))
    version_data = json.loads((site / "version.json").read_text(encoding="utf-8"))
    if not isinstance(version_data, dict) or version_data.get("release") != VERSION:
        raise ValueError(f"version.json must identify release {VERSION}")

    files: dict[str, bytes] = {}
    excluded_dirs = {"scripts", "docs", "node_modules", "__pycache__"}
    excluded_suffixes = {".zip", ".tar", ".gz", ".tmp", ".log", ".pyc"}
    for source in sorted(site.rglob("*")):
        relative = source.relative_to(site)
        if any(part.startswith((".", "_")) for part in relative.parts):
            continue
        if relative.parts[0] in excluded_dirs or source.suffix.lower() in excluded_suffixes:
            continue
        if source.is_symlink():
            raise ValueError(f"Refusing to export a symlink: {relative}")
        if source.is_file():
            files[relative.as_posix()] = source.read_bytes()

    for script in ("prepare-routes.mjs", "search-metadata.mjs", "scale-guide.mjs", "export-github.py"):
        source = project / "scripts" / script
        if not source.is_file():
            raise ValueError(f"Missing maintenance script: {source}")
        files[f"scripts/{script}"] = source.read_bytes()

    files[".nojekyll"] = b""
    files["README.md"] = README.encode("utf-8")
    files["UPDATE-NOTES.md"] = UPDATE_NOTES.encode("utf-8")
    return files


def write_and_verify(output: Path, files: dict[str, bytes]) -> None:
    """Write fixed metadata and validate the entire archive before replacing output."""
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(prefix=".peclee-export-", suffix=".zip", dir=output.parent, delete=False) as handle:
        temporary = Path(handle.name)
    try:
        with ZipFile(temporary, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
            for name, content in sorted(files.items()):
                info = ZipInfo(name, date_time=ZIP_DATE)
                info.compress_type = ZIP_DEFLATED
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                archive.writestr(info, content, compress_type=ZIP_DEFLATED, compresslevel=9)
        with ZipFile(temporary) as archive:
            if archive.testzip() is not None:
                raise ValueError("ZIP integrity check failed")
            names = archive.namelist()
            if len(names) != len(set(names)) or set(names) != set(files):
                raise ValueError("ZIP entry list differs from the collected files")
            for name in REQUIRED:
                if name not in names:
                    raise ValueError(f"Required file is not at archive root: {name}")
            for name, expected in files.items():
                if name.startswith("/") or ".." in Path(name).parts:
                    raise ValueError(f"Unsafe archive path: {name}")
                if archive.read(name) != expected:
                    raise ValueError(f"ZIP byte verification failed: {name}")
        temporary.replace(output)
    finally:
        temporary.unlink(missing_ok=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Path of the ZIP to create")
    args = parser.parse_args()
    project = Path(__file__).resolve().parent.parent
    output = args.output.expanduser().resolve()
    if output.suffix.lower() != ".zip":
        parser.error("The output filename must end in .zip")
    site = project / "dist" if (project / "dist" / "index.html").is_file() else project
    if output.is_relative_to(site):
        parser.error("Write the ZIP outside the served website directory")
    try:
        files = collect_files(project)
        write_and_verify(output, files)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        parser.exit(1, f"Export failed: {error}\n")
    print(json.dumps({
        "archive": str(output),
        "release": VERSION,
        "file_count": len(files),
        "size_bytes": output.stat().st_size,
        "sha256": hashlib.sha256(output.read_bytes()).hexdigest(),
        "verified": True,
    }, indent=2))


if __name__ == "__main__":
    main()
