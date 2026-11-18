import { existsSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

const root = existsSync(new URL('../dist/index.html', import.meta.url))
  ? new URL('../dist/', import.meta.url) : new URL('../', import.meta.url);
const origin = 'https://www.peclee.com';
const index = new URL('index.html', root);
let source = await readFile(index, 'utf8');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const json = value => JSON.stringify(value).replace(/</g, '\\u003c');
const stripGenerated = html => html.replace(/<!-- static-content -->[\s\S]*?<!-- end-static-content -->/g, '')
  .replace(/<template data-route-view>|<\/template><!-- end-route-view -->/g, '')
  .replace(/class="route live" id="v-/g, 'class="route" id="v-');

source = stripGenerated(source);
const catalogSource = source.match(/const P\s*=\s*\[[\s\S]*?\];(?=\s*const FIN\b)/);
const palette = source.match(/const NAVY\s*=.*?;/);
if (!catalogSource || !palette) throw Error('Cannot find product catalog in the website source.');
const products = runInNewContext(palette[0] + '\n' + catalogSource[0] + '\nP', {}, {timeout:500});
const brandImage = 'assets/og-image.jpg';
const pages = {
  '': {
    title: ['Peclee, Coffee Tools by a Design Brand', 'بيكلي، أدوات لتحضير القهوة'],
    description: ['Peclee makes brewing tools that feel as considered as the coffee itself. Explore our kettles, hand grinders and scales.', 'تصمّم بيكلي أدوات لتحضير القهوة. اكتشف الغلايات والمطاحن اليدوية وموازين القهوة.'],
  },
  tools: {
    title: ['Coffee brewing tools — Peclee', 'أدوات تحضير القهوة — بيكلي'],
    description: ['Explore the ORPHE kettle, KIVI hand grinder, PESO and PESOmini brewing scales. Compare features and find your brewing tool.', 'اكتشف غلاية أورفي ومطحنة كيفي اليدوية وميزاني بيسو وبيسوميني. قارن بين المزايا واختر الأداة المناسبة.'],
  },
  about: {
    title: ['Our approach — Peclee', 'عن بيكلي'],
    description: ['Discover how Peclee approaches the design of everyday coffee tools and why the way a kettle, grinder or scale feels matters.', 'تعرّف على نهج بيكلي في تصميم أدوات تحضير القهوة، من ملمس مقبض الغلاية إلى حركة قرص المطحنة.'],
  },
  contact: {
    title: ['Contact Peclee — Coffee tools and wholesale enquiries', 'تواصل مع بيكلي — استفسارات أدوات القهوة والجملة'],
    description: ['Get in touch with Peclee about coffee tools, limited releases, stocking the range or wholesale enquiries.', 'تواصل مع بيكلي للاستفسار عن أدوات تحضير القهوة والإصدارات المحدودة ومنافذ البيع والشراء بالجملة.'],
  },
};
for (const p of products) {
  pages['tools/' + p.id] = {
    title: [p.name.en + ' ' + p.kind.en.toLowerCase() + ' — Peclee', p.name.ar + ' — ' + p.kind.ar + ' من بيكلي'],
    description: [p.desc.en, p.desc.ar],
    image:'assets/share-' + p.id + '.jpg',
    imageAlt:[p.name.en + ' ' + p.kind.en.toLowerCase(), p.kind.ar + ' ' + p.name.ar],
  };
}
for (const [route, page] of Object.entries(pages)) {
  page.url = origin + '/' + (route ? route + '/' : '');
  page.image = origin + '/' + (page.image || brandImage);
  page.imageAlt ??= ['Peclee coffee brewing tools', 'أدوات بيكلي لتحضير القهوة'];
  if (!existsSync(new URL(page.image.slice(origin.length + 1), root))) {
    throw Error('Missing sharing image: ' + page.image);
  }
}

const generated = html => '<!-- static-content -->' + html + '<!-- end-static-content -->';
const metaTag = (key, val) => '<meta ' + (key.startsWith('og:') ? 'property' : 'name') +
  '="' + key + '" content="' + escapeHTML(val) + '">';
function head(route) {
  const page = pages[route];
  const tags = [
    '<title>' + escapeHTML(page.title[0]) + '</title>',
    '<link rel="canonical" href="' + page.url + '">',
    metaTag('description', page.description[0]),
    metaTag('og:type', route.startsWith('tools/') ? 'product' : 'website'),
    metaTag('og:site_name', 'Peclee'), metaTag('og:title', page.title[0]), metaTag('og:description', page.description[0]),
    metaTag('og:url', page.url), metaTag('og:image', page.image), metaTag('og:image:width', '1200'), metaTag('og:image:height', '630'),
    metaTag('og:image:alt', page.imageAlt[0]), metaTag('twitter:card', 'summary_large_image'), metaTag('twitter:title', page.title[0]),
    metaTag('twitter:description', page.description[0]), metaTag('twitter:image', page.image), metaTag('twitter:image:alt', page.imageAlt[0]),
  ];
  return tags.join('\n') + '\n<script>\n' +
    'window.pecleeRouteMetadata = (() => {\n  const pages = ' + json(pages) + ';\n' +
    `  return (route, lang) => {
    const page = pages[route] || pages[''], i = lang === 'ar' ? 1 : 0;
    document.title = page.title[i];
    document.querySelector('link[rel="canonical"]').href = page.url;
    const tags = {
      description:page.description[i], 'og:type':route.startsWith('tools/') ? 'product' : 'website',
      'og:title':page.title[i], 'og:description':page.description[i], 'og:url':page.url, 'og:image':page.image,
      'og:image:alt':page.imageAlt[i], 'twitter:title':page.title[i], 'twitter:description':page.description[i],
      'twitter:image':page.image, 'twitter:image:alt':page.imageAlt[i]
    };
    for (const [name, value] of Object.entries(tags)) {
      document.querySelector('meta[' + (name.startsWith('og:') ? 'property' : 'name') + '="' + name + '"]').content = value;
    }
  };
})();
</script>`;
}

const mainPattern = /(<main id="main"[^>]*>)([\s\S]*?)(<\/main>)/;
const main = source.match(mainPattern);
if (!main) throw Error('Cannot find main content.');
const views = [...main[2].matchAll(/(<!--\s*═+\s*(HOME|TOOLS|ABOUT|CONTACT)\s*═+\s*-->\s*)([\s\S]*?)(?=<!--\s*═+\s*(?:HOME|TOOLS|ABOUT|CONTACT)\s*═+|$)/g)];
if (views.length !== 4) throw Error('Expected four route sections in the main template.');
const wrapTemplate = html => '<template data-route-view>' + html + '</template><!-- end-route-view -->';
const asset = p => 'assets/' + p.colors[0].shots[0].split(',')[0];
function productLinks(p) {
  return p.colors.map(c => {
    const url = new URL(c.buyUrl || p.buyUrl);
    if (url.hostname !== 'www.noon.com') throw Error('Invalid retailer URL for ' + p.id);
    return `<a class="cta fill" href="${escapeHTML(url.href)}">Buy ${escapeHTML(c.name.en)} on noon</a>`;
  }).join(' ');
}
function staticProduct(p) {
  const pairs = (rows, item) => rows.map(([key, val]) => item(escapeHTML(key), escapeHTML(val))).join('');
  return `<article class="static-product wrap" aria-labelledby="product-heading">
    <a class="text-link" href="tools/">All tools</a>
    <div class="static-product-intro"><img src="${asset(p)}" alt="${escapeHTML(p.name.en + ' ' + p.kind.en)}">
      <div><p class="mono">${escapeHTML(p.kind.en)}</p><h1 class="xl" id="product-heading">${escapeHTML(p.name.en)}</h1>
      <p class="md">${escapeHTML(p.tagline.en)}</p><p class="body">${escapeHTML(p.desc.en)}</p>
      <div class="static-buy">${productLinks(p)}</div></div></div>
    <h2 class="md">Features</h2><ul class="feat">${pairs(p.features.en,(k,v)=>`<li><h3>${k}</h3><p>${v}</p></li>`)}</ul>
    <h2 class="md">Specifications</h2><dl class="spec">${pairs(p.specs.en,(k,v)=>`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>
  </article>`;
}
function staticCards() {
  return '<ul class="static-catalog">' + products.map(p => `<li><a href="tools/${p.id}/">
    <img src="${asset(p)}" alt="" loading="lazy"><h3>${escapeHTML(p.name.en)}</h3><p>${escapeHTML(p.kind.en)}</p></a></li>`).join('') + '</ul>';
}

// Inert templates retain the single-page app's views without giving crawlers or
// assistive technologies the content of another route as the initial document.
const hydrate = `<script>
for (const template of document.querySelectorAll('template[data-route-view]')) {
  template.replaceWith(template.content);
}
document.querySelectorAll('.static-product, .static-catalog').forEach(el => el.remove());
const skip = document.querySelector('.skip-link');
if (skip) skip.setAttribute('href', '#main');
</script>`;

function renderMain(route) {
  const product = products.find(p => route === 'tools/' + p.id);
  const active = route || 'home';
  const ordered = [...views].sort((a, b) => Number(b[2].toLowerCase() === active) - Number(a[2].toLowerCase() === active));
  const sections = ordered.map(([,label,id,raw]) => {
    let view = raw.trim();
    if (id.toLowerCase() !== active) return label + wrapTemplate(view);
    view = view.replace('<div class="route"', '<div class="route live"');
    if (active === 'tools' || active === 'home') {
      const mount = active === 'tools' ? 'rows' : 'rail-in';
      view = view.replace('id="' + mount + '"></div>', 'id="' + mount + '">' + generated(staticCards()) + '</div>');
    }
    return label + view;
  });
  const detail = product ? generated(staticProduct(product)) : '';
  return main[1] + '\n' + detail + '\n' + sections.join('\n\n') + '\n' + main[3];
}

for (const route of Object.keys(pages)) {
  const base = route ? '../'.repeat(route.split('/').length) : './';
  const output = source
    .replace(/<!-- route-metadata -->[\s\S]*?<!-- end-route-metadata -->/,
      '<!-- route-metadata -->\n' + head(route) + '\n<!-- end-route-metadata -->')
    .replace(/<meta name="peclee-base" content="[^"]+">/, '<meta name="peclee-base" content="' + base + '">')
    .replace(/<base href="[^"]+">/, '<base href="' + base + '">')
    .replace(mainPattern, () => renderMain(route))
    .replace('<a href="#main" class="skip-link"', '<a href="' + (route ? route + '/' : '') + '#main" class="skip-link"')
    .replace('<body class="ready spotlight-home">', '<body class="ready' + (route ? '' : ' spotlight-home') + '">')
    .replace(/(<!-- ═+ PRODUCT PANEL ═+ -->[\s\S]*?)(?=<footer\b)/, match => wrapTemplate(match.trimEnd()) + '\n')
    .replace(/<\/footer>\s*(?=<script>)/, '</footer>\n' + generated(hydrate) + '\n\n');
  const directory = new URL(route ? route + '/' : './', root);
  await mkdir(directory, {recursive:true});
  await writeFile(new URL('index.html', directory), output);
}
await writeFile(new URL('robots.txt', root), 'User-agent: *\nAllow: /\n\nSitemap: ' + origin + '/sitemap.xml\n');
await writeFile(new URL('sitemap.xml', root), '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + Object.values(pages)
    .map(p => '  <url><loc>' + p.url + '</loc></url>').join('\n') + '\n</urlset>\n');
console.log('Prepared ' + Object.keys(pages).length + ' static routes, robots.txt and sitemap.xml.');
