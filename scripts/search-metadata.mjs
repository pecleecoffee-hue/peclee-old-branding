// Page copy follows the visible catalogue. Market-specific purchase copy refers
// to the Saudi retailer, while the English and Arabic guides apply worldwide.
const searchCopy = {
  '': {
    en: ['Peclee | Coffee Brewing Tools for Pour-Over and Espresso',
      'Meet the ORPHE gooseneck kettle, KIVI hand grinder and PESO coffee scales. Explore how each tool works and find Peclee products on Noon in Saudi Arabia.'],
    ar: ['بيكلي | أدوات تحضير القهوة المقطّرة والإسبريسو',
      'اكتشف غلاية أورفي ومطحنة كيفي اليدوية وموازين بيسو من بيكلي. تعرّف على طريقة عمل كل أداة، واعثر عليها على نون في السعودية.']
  },
  tools: {
    en: ['Coffee Kettle, Hand Grinder & Brewing Scales | Peclee',
      'Explore Peclee’s four brewing tools. Compare PESO and PESOmini sizes, see what sets the kettle and grinder apart, and find each tool on Noon Saudi Arabia.'],
    ar: ['غلاية قهوة ومطحنة يدوية وموازين تحضير | بيكلي',
      'تصفّح أدوات بيكلي الأربع لتحضير القهوة. قارن سعة بيسو وبيسوميني وأبعادهما، واطّلع على مواصفات الغلاية والمطحنة وروابط الشراء من نون السعودية.']
  },
  about: {
    en: ['About Peclee | The Design Behind Our Coffee Tools',
      'Read the story of Peclee, from the feel of a kettle handle to the everyday brewing rituals behind the design of our grinders and scales.'],
    ar: ['عن بيكلي | قصة تصميم أدوات القهوة',
      'اقرأ قصة بيكلي وكيف تُلهمنا تفاصيل التحضير اليومي، من ملمس مقبض الغلاية إلى حركة قرص المطحنة، عند تصميم أدواتنا للقهوة.']
  },
  contact: {
    en: ['Contact Peclee | Coffee Tools, Wholesale & Limited Editions',
      'Contact Peclee about a coffee tool, a limited edition or stocking our range. Find the email for wholesale enquiries and links to our social accounts.'],
    ar: ['تواصل مع بيكلي | أدوات القهوة واستفسارات الجملة',
      'راسل فريق بيكلي للاستفسار عن أدوات تحضير القهوة أو الإصدارات المحدودة أو توفير منتجاتنا في متجرك. تجد هنا البريد الإلكتروني وحسابات التواصل.']
  },
  'tools/orphe': {
    en: ['ORPHE Electric Gooseneck Kettle, 600 ml | Peclee',
      'Set the ORPHE pour-over kettle from 40 to 100 °C and hold your chosen temperature between pours. See colours and specifications, or buy on Noon Saudi Arabia.'],
    ar: ['غلاية أورفي ORPHE الكهربائية للقهوة المقطّرة، ٦٠٠ مل | بيكلي',
      'اضبط حرارة الماء في غلاية أورفي من ٤٠ إلى ١٠٠ درجة مئوية وثبّتها بين السكب والآخر. شاهد الألوان والمواصفات ورابط الشراء من نون السعودية.']
  },
  'tools/kivi': {
    en: ['KIVI Manual Coffee Grinder with 38 mm Conical Burr | Peclee',
      'The KIVI hand grinder holds 20 g of beans. Its stepless dial lets you fine-tune the grind. Explore both colours and view the grinder on Noon Saudi Arabia.'],
    ar: ['مطحنة قهوة كيفي KIVI اليدوية بشفرة مخروطية ٣٨ مم | بيكلي',
      'تسع مطحنة كيفي ٢٠ غرامًا من البن، ويتيح لك قرص الضبط الانتقال تدريجيًا من الطحن الناعم إلى الخشن. تصفّح الألوان واشترِ من نون السعودية.']
  },
  'tools/peso': {
    en: ['PESO Digital Coffee Scale with Timer, 2 kg | Peclee',
      'Weigh up to 2 kg in 0.1 g increments and track flow rate and brew ratio on the PESO coffee scale. Explore its brewing modes and view it on Noon Saudi Arabia.'],
    ar: ['ميزان بيسو PESO الرقمي للقهوة مع مؤقّت، ٢ كغ | بيكلي',
      'يزن بيسو حتى ٢ كغ بتدرّج ٠٫١ غرام. تابع وقت التحضير ومعدل التدفّق ونسبة القهوة إلى الماء، وتعرّف على أوضاع الميزان قبل الشراء من نون السعودية.']
  },
  'tools/pesomini': {
    en: ['PESOmini Compact Espresso Scale with Timer, 1.5 kg | Peclee',
      'At 12 mm tall, PESOmini weighs up to 1.5 kg in 0.1 g increments. Check its footprint, timer and espresso mode, or view the scale on Noon Saudi Arabia.'],
    ar: ['ميزان بيسوميني PESOmini للإسبريسو مع مؤقّت، ١٫٥ كغ | بيكلي',
      'بارتفاع ١٢ مم، يزن بيسوميني حتى ١٫٥ كغ بتدرّج ٠٫١ غرام. اطّلع على أبعاده ووضع الإسبريسو وطريقة الشحن ورابط الشراء من نون السعودية.']
  }
};

const sectionNames = {
  '': { en: 'Peclee', ar: 'بيكلي' },
  tools: { en: 'Coffee tools', ar: 'أدوات القهوة' },
  about: { en: 'About Peclee', ar: 'عن بيكلي' },
  contact: { en: 'Contact', ar: 'تواصل معنا' }
};

const pageTypes = {
  '': 'WebPage',
  about: 'AboutPage',
  contact: 'ContactPage',
  tools: 'CollectionPage'
};

function localizedURL(origin, route, language) {
  const prefix = language === 'ar' ? '/ar/' : '/';
  return new URL(prefix + (route ? route + '/' : ''), origin).href;
}

export function createSearchPage(route, language, { origin, products }) {
  const copy = searchCopy[route]?.[language];
  if (!copy) throw new Error('Missing search metadata for ' + language + '/' + route);

  const [title, description] = copy;
  const url = localizedURL(origin, route, language);
  const root = localizedURL(origin, '', 'en');
  const product = products.find(item => route === 'tools/' + item.id);
  const image = new URL(product ? 'assets/share-' + product.id + '.jpg' : 'assets/og-image.jpg', root).href;
  const productName = product && (language === 'ar'
    ? product.kind.ar + ' ' + product.name.ar
    : 'Peclee ' + product.name.en + ' ' + product.kind.en.toLowerCase());
  const imageAlt = productName || (language === 'ar' ? 'أدوات تحضير القهوة من بيكلي' : 'Peclee coffee brewing tools');
  const organization = { '@id': root + '#organization' };
  const website = { '@id': root + '#website' };
  const page = {
    '@type': pageTypes[route] || 'ItemPage',
    '@id': url + '#page',
    url, name: title, description, inLanguage: language, isPartOf: website
  };
  const graph = [page];

  if (!route) {
    graph.push({
      '@type': 'Organization', ...organization, name: 'Peclee', alternateName: 'بيكلي',
      url: root, logo: new URL('assets/logo-peclee.png', root).href, email: 'info@peclee.com'
    }, {
      '@type': 'WebSite', ...website, url: root, name: 'Peclee', alternateName: 'بيكلي',
      inLanguage: ['en', 'ar'], publisher: organization
    });
  } else {
    const trail = product ? ['', 'tools', route] : ['', route];
    const breadcrumbId = url + '#breadcrumb';
    page.breadcrumb = { '@id': breadcrumbId };
    graph.push({
      '@type': 'BreadcrumbList', '@id': breadcrumbId,
      itemListElement: trail.map((path, index) => ({
        '@type': 'ListItem', position: index + 1,
        name: sectionNames[path]?.[language] || productName,
        item: localizedURL(origin, path, language)
      }))
    });
  }

  if (product) {
    const productId = localizedURL(origin, route, 'en') + '#product';
    page.mainEntity = { '@id': productId };
    const photos = product.colors.flatMap(color => color.shots.map(shot =>
      new URL('assets/' + shot.split(',')[0], root).href
    ));
    graph.push({
      '@type': 'Product', '@id': productId,
      name: productName, model: product.name.en, category: product.kind[language],
      brand: { '@type': 'Brand', name: 'Peclee' }, url, image: [...new Set(photos)],
      description: product.desc[language], color: product.colors.map(color => color.name[language]),
      additionalProperty: product.specs[language].map(([name, value]) => ({ '@type': 'PropertyValue', name, value }))
    });
  }

  return { title, description, url, image, imageAlt, jsonLd: { '@context': 'https://schema.org', '@graph': graph } };
}
