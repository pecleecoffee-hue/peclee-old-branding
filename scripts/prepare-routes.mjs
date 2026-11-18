import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createSearchPage } from './search-metadata.mjs';
import { GUIDE_ROUTE, writeScaleGuide } from './scale-guide.mjs';

const root = existsSync(new URL('../dist/index.html', import.meta.url))
  ? new URL('../dist/', import.meta.url) : new URL('../', import.meta.url);
const origin = 'https://www.peclee.com';
const languages = ['en', 'ar'];
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const scriptJSON = value => JSON.stringify(value).replace(/</g, '\\u003c');
const routePath = (route, lang) => (lang === 'ar' ? 'ar/' : '') + (route ? route + '/' : '');
const generated = html => '<!-- static-content -->' + html + '<!-- end-static-content -->';
const wrapTemplate = html => '<template data-route-view>' + html + '</template><!-- end-route-view -->';
const source = (await readFile(new URL('index.html', root), 'utf8'))
  .replace(/<!-- static-content -->[\s\S]*?<!-- end-static-content -->/g, '')
  .replace(/<template data-route-view>|<\/template><!-- end-route-view -->/g, '')
  .replace(/class="route live" id="v-/g, 'class="route" id="v-');

function declaration(name, next) {
  const start = source.indexOf('const ' + name + '=');
  const end = source.indexOf(next, start + 1);
  if (start < 0 || end < 0) throw Error('Missing catalogue declaration: ' + name);
  return source.slice(start, end);
}
// Use the same authored copy, chapter records and variant-level product data as the application.
const dataCode = [
  source.match(/const NAVY\s*=.*?;/)[0], declaration('T', '/* ═══════════ PRODUCTS'),
  declaration('P', 'const FIN='), declaration('CHAPS', 'const grindGuide='),
  declaration('INFO', '/* ═══════════ ART'), ...source.matchAll(/^Object\.assign\(T\.(?:en|ar),.*\);$/gm),
].map(part => typeof part === 'string' ? part : part[0]).join('\n');
const { P: products, T: text, CHAPS: chapters, TRIO: brandLines, INFO: info } =
  runInNewContext(dataCode + '\n;({P,T,CHAPS,TRIO,INFO})', {}, {timeout:500});
const routes = ['', 'tools', 'about', 'contact', ...products.map(p => 'tools/' + p.id)];
const pages = {};
for (const route of routes) {
  pages[route] = {};
  for (const lang of languages) {
    const page = createSearchPage(route, lang, {origin, products});
    if (page.url !== origin + '/' + routePath(route, lang)) throw Error('Unexpected canonical: ' + page.url);
    if (!existsSync(new URL(page.image.slice(origin.length + 1), root))) throw Error('Missing sharing image: ' + page.image);
    pages[route][lang] = page;
  }
}

const version = source.match(/<meta name="peclee-version" content="([^"]+)"/)[1];
const metaTag = (key, val) => '<meta ' + (key.startsWith('og:') ? 'property' : 'name') +
  '="' + key + '" content="' + escapeHTML(val) + '">';
function searchTags(page, isProduct, lang) {
  return {
    description:page.description, 'og:type':isProduct ? 'product' : 'website',
    'og:site_name':'Peclee', 'og:title':page.title, 'og:description':page.description, 'og:url':page.url,
    'og:image':page.image, 'og:image:width':'1200', 'og:image:height':'630', 'og:image:alt':page.imageAlt,
    'og:locale':lang === 'ar' ? 'ar_SA' : 'en_US', 'og:locale:alternate':lang === 'ar' ? 'en_US' : 'ar_SA',
    'twitter:card':'summary_large_image', 'twitter:title':page.title, 'twitter:description':page.description,
    'twitter:image':page.image, 'twitter:image:alt':page.imageAlt,
  };
}
function head(route, lang) {
  const pair = pages[route], page = pair[lang];
  return [
    '<title>' + escapeHTML(page.title) + '</title>',
    '<link rel="canonical" href="' + page.url + '">',
    ...['en','ar','x-default'].map(code => '<link rel="alternate" hreflang="' + code + '" href="' + pair[code === 'ar' ? 'ar' : 'en'].url + '">'),
    ...Object.entries(searchTags(page, route.startsWith('tools/'), lang)).map(([key,val]) => metaTag(key,val)),
    '<script type="application/ld+json" id="page-schema">' + scriptJSON(page.jsonLd) + '</script>',
    '<script src="route-search.js?v=' + encodeURIComponent(version) + '" defer></script>',
  ].join('\n');
}
// Shared external metadata keeps a directly readable head while avoiding sixteen graphs in each HTML document.
const runtime = `(() => {
  const pages = ${scriptJSON(pages)};
  const tags = ${searchTags.toString()};
  window.pecleeRouteMetadata = (route, lang) => {
    const pair = pages[route] || pages[''];
    const page = pair[lang === 'ar' ? 'ar' : 'en'];
    document.title = page.title;
    document.querySelector('link[rel="canonical"]').href = page.url;
    document.querySelectorAll('link[hreflang]').forEach(link => {
      link.href = pair[link.hreflang === 'ar' ? 'ar' : 'en'].url;
    });
    for (const [key,value] of Object.entries(tags(page, route.startsWith('tools/'), lang))) {
      document.querySelector('meta[' + (key.startsWith('og:') ? 'property' : 'name') + '="' + key + '"]').content = value;
    }
    document.getElementById('page-schema').textContent = JSON.stringify(page.jsonLd);
  };
  if (typeof currentRoute === 'function') window.pecleeRouteMetadata(currentRoute(), document.documentElement.lang);
})();\n`;
await writeFile(new URL('route-search.js', root), runtime);

const mainPattern = /(<main id="main"[^>]*>)([\s\S]*?)(<\/main>)/;
const main = source.match(mainPattern);
const views = [...main[2].matchAll(/(<!--\s*═+\s*(HOME|TOOLS|ABOUT|CONTACT)\s*═+\s*-->\s*)([\s\S]*?)(?=<!--\s*═+\s*(?:HOME|TOOLS|ABOUT|CONTACT)\s*═+|$)/g)];
if (views.length !== 4) throw Error('Expected four route sections in the main template.');
const photo = p => 'assets/' + p.colors[0].shots[0].split(',')[0];

function productLinks(p, lang) {
  return p.colors.map(c => {
    const url = new URL(c.buyUrl || p.buyUrl);
    if (url.hostname !== 'www.noon.com') throw Error('Invalid retailer URL for ' + p.id);
    url.pathname = url.pathname.replace(/^\/saudi-(en|ar)\//, '/saudi-' + lang + '/');
    const name = escapeHTML(c.name[lang]);
    const label = lang === 'ar' ? 'اشترِ ' + name + ' من نون السعودية' : 'Buy ' + name + ' on Noon Saudi Arabia';
    return `<a class="cta fill" href="${escapeHTML(url.href)}" hreflang="${lang}-SA">${label}</a>`;
  }).join(' ');
}
function staticProduct(p, lang) {
  const pairs = (rows, item) => rows.map(([key,val]) => item(escapeHTML(key),escapeHTML(val))).join('');
  const ar = lang === 'ar';
  const guide = ['peso','pesomini'].includes(p.id)
    ? `<p><a class="text-link" href="${GUIDE_ROUTE}/">${ar ? 'دليل المقارنة بين بيسو وبيسوميني' : 'PESO vs PESOmini comparison guide'}</a></p>` : '';
  return `<article class="static-product wrap" aria-labelledby="product-heading">
    <a class="text-link" href="tools/">${ar?'جميع الأدوات':'All tools'}</a>
    <div class="static-product-intro"><img src="${photo(p)}" alt="${escapeHTML(p.kind[lang] + ' ' + p.name[lang])}">
      <div><p class="mono">${escapeHTML(p.kind[lang])}</p><h1 class="xl" id="product-heading">${escapeHTML(p.name[lang])}</h1>
      <p class="md">${escapeHTML(p.tagline[lang])}</p><p class="body">${escapeHTML(p.desc[lang])}</p>
      <div class="static-buy">${productLinks(p,lang)}</div></div></div>
    <h2 class="md">${ar?'المزايا':'Features'}</h2><ul class="feat">${pairs(p.features[lang],(k,v)=>`<li><h3>${k}</h3><p>${v}</p></li>`)}</ul>
    <h2 class="md">${ar?'المواصفات':'Specifications'}</h2><dl class="spec">${pairs(p.specs[lang],(k,v)=>`<div><dt>${k}</dt><dd>${v}</dd></div>`)}</dl>${guide}
  </article>`;
}
function staticCards(lang) {
  return '<ul class="static-catalog">' + products.map(p => `<li><a href="tools/${p.id}/">
    <img src="${photo(p)}" alt="" loading="lazy"><h3>${escapeHTML(p.name[lang])}</h3><p>${escapeHTML(p.kind[lang])}</p></a></li>`).join('') + '</ul>';
}

function contacts(lang) {
  const ar = lang === 'ar';
  return [
    [ar?'البريد الإلكتروني':'Email', info.email, 'mailto:' + info.email],
    [ar?'انستغرام':'Instagram', '@'+info.instagram, 'https://instagram.com/' + info.instagram],
    [ar?'تيك توك':'TikTok', '@peclee.com', 'https://www.tiktok.com/@peclee.com?_r=1&_t=ZS-98WOFpJO48t'],
    [ar?'سناب شات':'Snapchat', 'peclee.sa', 'https://snapchat.com/t/x8TEA4MD'],
    [ar?'التجارة والجملة':'Trade & wholesale', ar?'وفّر بيكلي في متجرك':'Stock Peclee in your store', 'mailto:' + info.email + '?subject=' + encodeURIComponent(ar?'وفّر بيكلي':'Stocking Peclee')],
  ];
}
function fillMount(html, id, contents) {
  return html.replace('id="' + id + '"></', () => 'id="' + id + '">' + generated(contents) + '</');
}
function renderMain(route,lang) {
  const product = products.find(p => route === 'tools/' + p.id), active = route || 'home';
  const ordered = [...views].sort((a,b) => Number(b[2].toLowerCase() === active) - Number(a[2].toLowerCase() === active));
  const sections = ordered.map(([,label,id,raw]) => {
    let view = raw.trim();
    if (id.toLowerCase() !== active) return label + wrapTemplate(view);
    view = view.replace('<div class="route"', '<div class="route live"');
    if (active === 'tools' || active === 'home') view = fillMount(view, active === 'tools' ? 'rows' : 'rail-in', staticCards(lang));
    if (active === 'about') {
      view = fillMount(view, 'chapters', chapters.map(c => `<article class="chap"><p class="mono">${escapeHTML(c[lang][0])}</p><h2>${escapeHTML(c[lang][1])}</h2>${c[lang][2].map(p=>'<p class="body">'+escapeHTML(p)+'</p>').join('')}</article>`).join(''));
      view = fillMount(view, 'trio', brandLines.map(c=>`<div><h3>${escapeHTML(c[lang][0])}</h3><p class="body">${escapeHTML(c[lang][1])}</p></div>`).join(''));
    }
    if (active === 'contact') view = fillMount(view, 'chan', contacts(lang).map(([label,name,href])=>`<div class="crow"><div><p class="crow-k">${label}</p><a class="crow-v" href="${escapeHTML(href)}">${escapeHTML(name)}</a></div></div>`).join(''));
    return label + view;
  });
  return main[1] + '\n' + (product ? generated(staticProduct(product,lang)) : '') + '\n' + sections.join('\n\n') + '\n' + main[3];
}

const hydrate = `<script>
for (const template of document.querySelectorAll('template[data-route-view]')) template.replaceWith(template.content);
document.querySelectorAll('.static-product, .static-catalog').forEach(el => el.remove());
const skip = document.querySelector('.skip-link');
if (skip) skip.setAttribute('href', '#main');
</script>`;
const routeLinks = new Set([...routes,GUIDE_ROUTE]);
function localizedMarkup(html,route,lang) {
  const ar = lang === 'ar', other = ar?'en':'ar';
  html = html.replace(/<([\w-]+)\b([^<>]*\bdata-t="([\w-]+)"[^<>]*)>[^<]*(?:<br\s*\/?>[^<]*)*<\/\1>/gi,
    (match,tag,attrs,key) => {
      if (text[lang][key] === undefined) throw Error('Missing translation for ' + lang + ': ' + key);
      return '<' + tag + attrs + '>' + escapeHTML(text[lang][key]).replace(/&lt;br\s*\/?&gt;/gi, '<br>') + '</' + tag + '>';
    });
  html = html.replace(/<([\w-]+)\b([^<>]*\bdata-en="([^"]*)"\s+data-ar="([^"]*)"[^<>]*)>[^<]*<\/\1>/g,
    (_,tag,attrs,en,arabic) => '<'+tag+attrs+'>'+(ar?arabic:en)+'</'+tag+'>');
  html = html.replace(/<a\b([^<>]*)>([^<>]*)<\/a>/g, (whole,attrs,inner) => {
    if (attrs.includes('data-language-switch')) {
      const clean = attrs.replace(/\s+(?:href|hreflang|lang)="[^"]*"/g, '');
      return '<a' + clean + ' href="' + (routePath(route,other)||'./') + '" hreflang="' + other + '" lang="' + other + '">' + (ar?'English':'العربية') + '</a>';
    }
    return whole;
  });
  html = html.replace(/<a\b([^<>]*)>/g, (tag,attrs) => {
    if (attrs.includes('data-language-switch')) return tag;
    if (attrs.includes('class="skip-link"')) return '<a' + attrs.replace(/href="[^"]*"/,'href="'+routePath(route,lang)+'#main"') + '>';
    return '<a' + attrs.replace(/href="([^"]*)"/, (old,href) => {
      const path = href.replace(/\/$/, '').replace(/^\.$/,'');
      return routeLinks.has(path) ? 'href="' + (routePath(path,lang)||'./') + '"' : old;
    }) + '>';
  });
  if (ar) {
    html = html.replaceAll('aria-label="Menu"', 'aria-label="فتح القائمة"').replaceAll('aria-label="Mobile navigation"', 'aria-label="القائمة الرئيسية"')
      .replaceAll('aria-label="Filter tools"','aria-label="تصفية الأدوات"').replaceAll('aria-label="ORPHE kettle on its base"','aria-label="غلاية أورفي على قاعدتها"')
      .replaceAll('alt="Close-up of the Peclee ORPHE kettle base and temperature display"','alt="تفصيل قرص ضبط الحرارة في قاعدة غلاية أورفي"')
      .replaceAll('alt="Peclee KIVI hand grinder"','alt="مطحنة كيفي اليدوية من بيكلي"')
      .replaceAll('ORPHE / 600 ML','أورفي / ٦٠٠ مل').replace('>4 tools</span>','>٤ أدوات</span>')
      .replace('>Medium</b>','>متوسط</b>').replace('>Pour-over</p>','>تحضير بالتقطير</p>').replace('aria-valuetext="Medium · Pour-over"','aria-valuetext="متوسط · تحضير بالتقطير"');
  }
  return html;
}

for (const route of routes) for (const lang of languages) {
  const path = routePath(route, lang), levels = path.split('/').filter(Boolean).length;
  const base = '../'.repeat(levels) || './';
  let output = source
    .replace(/<html[^>]*>/, '<html lang="'+lang+'" dir="'+(lang==='ar'?'rtl':'ltr')+'">')
    .replace(/<!-- route-metadata -->[\s\S]*?<!-- end-route-metadata -->/, () => '<!-- route-metadata -->\n' + head(route,lang) + '\n<!-- end-route-metadata -->')
    .replace(/<meta name="peclee-base" content="[^"]+">/, '<meta name="peclee-base" content="' + base + '">')
    .replace(/<base href="[^"]+">/, '<base href="' + base + '">')
    .replace(mainPattern, () => renderMain(route,lang))
    .replace('<body class="ready spotlight-home">','<body class="ready' + (route?'':' spotlight-home') + '">')
    .replace(/(<!-- ═+ PRODUCT PANEL ═+ -->[\s\S]*?)(?=<footer\b)/, match => wrapTemplate(match.trimEnd()) + '\n')
    .replace(/<body\b[\s\S]*?<\/footer>/, body => {
      const footer = contacts(lang).slice(0,4).map(([label,name,href],i)=>`<li><a href="${escapeHTML(href)}">${escapeHTML(i?label:name)}</a></li>`).join('');
      return localizedMarkup(fillMount(body,'ft-contact',footer),route,lang);
    })
    .replace(/<\/footer>\s*(?=<script>)/, () => '</footer>\n' + generated(hydrate) + '\n\n');
  const dir = new URL(path || './',root);
  await mkdir(dir,{recursive:true});
  await writeFile(new URL('index.html',dir),output);
}

await writeScaleGuide({root,origin,products});
await writeFile(new URL('robots.txt',root), 'User-agent: *\nAllow: /\n\nSitemap: '+origin+'/sitemap.xml\n');
const entries = [...routes,GUIDE_ROUTE].flatMap(route=>languages.map(lang=>'<url><loc>'+origin+'/'+routePath(route,lang)+'</loc></url>'));
await writeFile(new URL('sitemap.xml',root), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+entries.join('\n')+'\n</urlset>\n');
console.log('Prepared '+entries.length+' localized pages, robots.txt and sitemap.xml.');
