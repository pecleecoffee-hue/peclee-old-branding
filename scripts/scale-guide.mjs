import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const GUIDE_ROUTE = 'guides/peso-vs-pesomini';

const content = {
  en: {
    title: 'PESO vs PESOmini: Which coffee scale fits your setup? | Peclee',
    description: 'Compare the Peclee PESO and PESOmini coffee scales by footprint, height and maximum load. Measure your espresso tray or weigh your pour-over setup before choosing.',
    heading: 'PESO or PESOmini?',
    intro: 'Both coffee scales display weight in 0.1 g increments. The useful difference is physical: how much room you have under the espresso spouts, and how heavy your brewer gets when it is full.',
    home: 'Home', shop: 'Tools', about: 'About', contact: 'Contact', language: 'العربية',
    skip: 'Skip to guide', navigation: 'Main navigation', breadcrumb: 'Breadcrumb',
    guideLabel: 'Coffee scale comparison', tableTitle: 'The measurements',
    tableCaption: 'PESO and PESOmini specifications', measurement: 'Measurement',
    photoAlt: ['Front of the PESO coffee scale with its blue silicone pad', 'Green PESOmini coffee scale held in one hand'],
    photoCaption: ['PESO with its removable pad', 'PESOmini shown in the hand'],
    fits: 'Will it fit under your espresso spouts?',
    fitText: 'Measure the usable flat area of the drip tray first. The PESOmini needs a 90 × 85 mm footprint; PESO needs 130 × 124 mm. Then measure from the tray to the lowest spout and subtract the height of your cup. That space has to accommodate the scale and still let you slide the cup out. At 12 mm high, PESOmini leaves 11.5 mm more room than PESO.',
    load: 'How much does a pour-over really weigh?',
    loadText: 'Count everything the scale carries: server, dripper, filter, dry coffee and water. For example, a setup weighing 850 g before the pour reaches 1,550 g with 700 g of water on the scale. That is within the 2,000 g PESO limit and above the 1,500 g PESOmini limit. Pressing tare resets the displayed reading; the brewer still counts towards the load.',
    travel: 'For a travel kit', travelText: 'PESOmini weighs 160 g and takes up less space in the bag. If you brew on a small tray, trace its footprint on paper and try it with your usual cup before deciding.',
    productLabel: ['Explore PESO', 'Explore PESOmini'],
    market: 'Buying in Saudi Arabia? Each product page links to its listing on Noon Saudi Arabia.',
  },
  ar: {
    title: 'مقارنة ميزاني بيسو وبيسوميني: أيهما يناسب أدوات قهوتك؟ | بيكلي',
    description: 'قارن أبعاد ميزاني القهوة بيسو وبيسوميني وارتفاعهما والوزن الذي يتحمّله كلّ منهما. تعرّف على طريقة قياس صينية الإسبريسو وحساب وزن أدوات التقطير قبل الاختيار.',
    heading: 'بيسو أم بيسوميني؟',
    intro: 'يعرض الميزانان الوزن بتدرّج ٠٫١ غرام. ما يحسم الاختيار هو المساحة المتاحة تحت فوهة الإسبريسو، أو وزن إبريق التقديم وأدوات التقطير بعد إضافة الماء.',
    home: 'الرئيسية', shop: 'الأدوات', about: 'عن بيكلي', contact: 'تواصل معنا', language: 'English',
    skip: 'انتقل إلى الدليل', navigation: 'القائمة الرئيسية', breadcrumb: 'مسار التصفّح',
    guideLabel: 'مقارنة موازين القهوة', tableTitle: 'الأبعاد والأوزان',
    tableCaption: 'مواصفات ميزاني بيسو وبيسوميني', measurement: 'القياس',
    photoAlt: ['ميزان بيسو من الأمام مع وسادة السيليكون الزرقاء', 'ميزان بيسوميني الأخضر في راحة اليد'],
    photoCaption: ['بيسو مع وسادته القابلة للإزالة', 'حجم بيسوميني في راحة اليد'],
    fits: 'هل يتّسع المكان للميزان تحت فوهة الإسبريسو؟',
    fitText: 'ابدأ بقياس الجزء المستوي من صينية التنقيط. يحتاج بيسوميني إلى مساحة ٩٠ × ٨٥ مم، بينما يحتاج بيسو إلى ١٣٠ × ١٢٤ مم. قِس بعد ذلك المسافة بين الصينية وأدنى فوهة، واطرح منها ارتفاع فنجانك. احسب حساب ارتفاع الميزان واترك متّسعًا لإخراج الفنجان. يبلغ ارتفاع بيسوميني ١٢ مم، فيترك لك فراغًا إضافيًا قدره ١١٫٥ مم مقارنةً ببيسو.',
    load: 'ما الوزن الذي يحمله الميزان أثناء التقطير؟',
    loadText: 'احسب وزن الإبريق والقمع والفلتر والبن والماء معًا. إذا كان الوزن قبل السكب ٨٥٠ غرامًا، وأضفت ٧٠٠ غرام من الماء، فسيحمل الميزان ١٥٥٠ غرامًا. هذا ضمن سعة بيسو البالغة ٢٠٠٠ غرام، ويتجاوز سعة بيسوميني البالغة ١٥٠٠ غرام. زر التصفير يعيد القراءة إلى الصفر، لكن وزن الأدوات يظلّ جزءًا من الحمل الفعلي.',
    travel: 'عند تجهيز حقيبة السفر', travelText: 'يزن بيسوميني ١٦٠ غرامًا ويشغل حيّزًا أصغر في الحقيبة. وإذا كانت صينية آلتك صغيرة، فاقصص ورقة بأبعاد الميزان وضعها على الصينية مع فنجانك المعتاد لتتأكّد من ملاءمة المساحة.',
    productLabel: ['اكتشف بيسو', 'اكتشف بيسوميني'],
    market: 'تشتري من السعودية؟ ستجد في صفحة كل ميزان رابط المنتج على نون السعودية.',
  },
};

const specKeys = ['Length × width × height', 'Weighing range', 'Resolution', 'Weight'];
const escape = text => String(text).replace(/[<>&"']/g, c => ({'<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":'&#39;'}[c]));

function spec(product, key, lang) {
  const i = product.specs.en.findIndex(([name]) => name === key);
  if (i < 0 || !product.specs[lang][i]) throw new Error('Missing scale guide specification: ' + product.id + ' ' + key);
  return product.specs[lang][i];
}

function guideHTML(lang, origin, scales) {
  const ar = lang === 'ar', t = content[lang];
  const base = ar ? '../../../' : '../../';
  const local = ar ? 'ar/' : '', other = ar ? 'en' : 'ar';
  const route = GUIDE_ROUTE + '/', enURL = origin + '/' + route, arURL = origin + '/ar/' + route;
  const canonical = ar ? arURL : enURL;
  const href = path => base + local + path;
  const breadcrumb = [[t.home,''],[t.shop,'tools/'],[t.guideLabel,route]];
  const structured = {
    '@context':'https://schema.org', '@type':'BreadcrumbList',
    itemListElement:breadcrumb.map(([name,path],i) => ({'@type':'ListItem',position:i+1,name,item:origin+'/'+local+path})),
  };
  const figureHTML = scales.map((product,i) => {
    const file = product.colors[0].shots[0].split(',')[0];
    return `<figure><a href="${href('tools/'+product.id+'/')}" aria-label="${escape(t.productLabel[i])}"><img src="${base}assets/${escape(file)}" alt="${escape(t.photoAlt[i])}" width="560" height="420"></a><figcaption>${escape(t.photoCaption[i])}</figcaption></figure>`;
  }).join('\n');
  const rows = specKeys.map(key => {
    const [label] = spec(scales[0],key,lang);
    const cells = scales.map(p=>`<td>${escape(spec(p,key,lang)[1])}</td>`).join('');
    return `<tr><th scope="row">${escape(label)}</th>${cells}</tr>`;
  }).join('\n');
  const buttons = scales.map((p,i) => `<a class="tool-link" href="${href('tools/'+p.id+'/')}">${escape(t.productLabel[i])} <span aria-hidden="true">${ar?'←':'→'}</span></a>`).join(' ');
  return `<!doctype html>
<html lang="${lang}" dir="${ar?'rtl':'ltr'}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(t.title)}</title><meta name="description" content="${escape(t.description)}">
<link rel="canonical" href="${canonical}">
<link rel="alternate" hreflang="en" href="${enURL}"><link rel="alternate" hreflang="ar" href="${arURL}"><link rel="alternate" hreflang="x-default" href="${enURL}">
<meta property="og:site_name" content="Peclee"><meta property="og:type" content="article"><meta property="og:title" content="${escape(t.title)}"><meta property="og:description" content="${escape(t.description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${origin}/assets/share-peso.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escape(t.photoAlt[0])}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(t.title)}"><meta name="twitter:description" content="${escape(t.description)}"><meta name="twitter:image" content="${origin}/assets/share-peso.jpg">
<link rel="icon" href="${base}assets/favicon-32x32.png"><link rel="stylesheet" href="${base}assets/fonts.css"><link rel="stylesheet" href="${base}scale-guide.css">
<script type="application/ld+json">${JSON.stringify(structured).replace(/</g,'\\u003c')}</script></head><body>
<a class="skip" href="#guide">${t.skip}</a>
<header><div class="bar"><a href="${href('')}" aria-label="${ar?'بيكلي':'Peclee'}"><img width="88" height="39" src="${base}assets/logo-peclee.png" alt="${ar?'بيكلي':'Peclee'}"></a>
<nav aria-label="${t.navigation}"><a href="${href('tools/')}">${t.shop}</a><a href="${href('about/')}">${t.about}</a><a href="${base}${ar?'':'ar/'}${route}" hreflang="${other}" lang="${other}">${t.language}</a></nav></div></header>
<main id="guide"><article>
<nav class="crumbs" aria-label="${t.breadcrumb}"><a href="${href('')}">${t.home}</a><span aria-hidden="true">/</span><a href="${href('tools/')}">${t.shop}</a><span aria-hidden="true">/</span><span aria-current="page">${t.guideLabel}</span></nav>
<h1>${t.heading}</h1><p class="intro">${t.intro}</p>
<div class="scales">${figureHTML}</div>
<section><h2>${t.tableTitle}</h2><table><caption class="sr">${t.tableCaption}</caption><thead><tr><th scope="col">${t.measurement}</th><th scope="col">${escape(scales[0].name[lang])}</th><th scope="col">${escape(scales[1].name[lang])}</th></tr></thead><tbody>${rows}</tbody></table></section>
<section class="notes"><div><h2>${t.fits}</h2><p>${t.fitText}</p></div><div><h2>${t.load}</h2><p>${t.loadText}</p></div></section>
<section class="last"><h2>${t.travel}</h2><p>${t.travelText}</p><p class="retail">${t.market}</p><div class="actions">${buttons}</div></section>
</article></main>
<footer><div class="bar"><a href="${href('')}">${ar?'بيكلي':'Peclee'}</a><a href="${href('contact/')}">${t.contact}</a></div></footer>
</body></html>\n`;
}

export async function writeScaleGuide({root, origin, products}) {
  const output = root instanceof URL ? root : pathToFileURL(resolve(root) + '/');
  const scales = ['peso', 'pesomini'].map(id => {
    const product = products.find(p => p.id === id);
    if (!product) throw new Error('Guide requires ' + id + ' in the product catalog.');
    return product;
  });
  for (const lang of ['en','ar']) {
    const dir = new URL((lang==='ar'?'ar/':'')+GUIDE_ROUTE+'/',output);
    await mkdir(dir,{recursive:true});
    await writeFile(new URL('index.html',dir),guideHTML(lang, origin.replace(/\/$/,''), scales));
  }
}
