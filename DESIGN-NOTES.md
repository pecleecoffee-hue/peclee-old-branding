# Peclee — layout redesign

The existing Peclee identity, Archivo / DM Mono / IBM Plex Sans Arabic fonts, original English and Arabic copy, product photographs, four products and purchase destinations are retained. The layout is redesigned around the cream `#FAF8F1` and maroon `#9E2A2B` sampled from the supplied Peclee PDF. Photograph colours and the original logo are unchanged.

## Presentation

- Product Spotlight opening with the original headline, cream navigation and maroon setting.
- Scroll-controlled sequence: kettle on its base → hand-held kettle → pour into a dripper. Three compressed transparent WebP artworks (402 KB total) are composited with depth; this is 2.5D scroll artwork, not a freely rotatable 3D model. The hand and dripper are generated motion artwork based on original product references; gallery photos are unchanged.
- Immediate collection link, optional reduced-motion mode, native scrolling, static fallback for OS motion preference, compact-height screens or image failure.
- Staggered product studies, larger product detail imagery, solid maroon editorial sections and quieter navigation.
- Responsive collection, product galleries, About and Contact pages with RTL support.
- Original 1–30 click grind control, colour choices, gallery zoom, motion preferences and keyboard controls.

## Structure

`dist/index.html` holds the adapted source markup, bilingual copy, product data and interactions. `spotlight.css` and `spotlight.js` implement the opening; `evolved.css` styles the remaining homepage and shared elements; `pages.css` styles secondary pages; `refinements.css` corrects photo framing and the sitewide proportion scale; `enhancements.js` retains overlay accessibility, motion controls and the prior draft's collection filters.

Run `node scripts/prepare-routes.mjs` after editing the HTML to refresh all seven directly accessible route copies. The site is buildless and serves from `dist/`.

## Verification

Desktop and narrow phone viewport review (320, 375 and 390px); English/Arabic switching; mobile menu; product swatches, gallery controls and colour-specific Noon links; scale filtering; original grind endpoints; direct page routes. JavaScript syntax, asset references and preserved copy/product data are checked before packaging.

The original site's newsletter contained a placeholder integration key, so the existing email enquiry fallback remains. No signup is claimed or submitted. The external peclee.com domain is not modified.

## Proportion and image correction — 15 November 2026

- Verified PESO and PESOmini files match the original peclee.com photographs byte for byte. No product photograph was replaced or recoloured.
- Fixed square images overflowing shorter grid slots. Shared studio frames preserve the complete products, remove excess blank space above the scales, and keep full uncropped originals in gallery zoom.
- Balanced card widths, product image sizes, navigation, heading sizes, section spacing, product panels, About, Contact and footer. The scale comparison now fits a 320px viewport.
- Replaced the unsupported diagonal arrow glyph with an SVG and clarified product links as “View tool.”
- Reviewed desktop, 320px/390px phone and 768px tablet layouts, English and Arabic, filtering, product details and zoom. Checked generated direct routes after refreshing the preview server. Product data and bilingual copy remain identical to the previous version.
