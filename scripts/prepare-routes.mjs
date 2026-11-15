import { readFile, mkdir, writeFile } from 'node:fs/promises';
const root = new URL('../dist/',import.meta.url);
const html = await readFile(new URL('index.html',root),'utf8');
const routes={tools:'The tools — Peclee',about:'Our approach — Peclee',contact:'Say hello — Peclee','tools/orphe':'ORPHE kettle — Peclee','tools/kivi':'KIVI grinder — Peclee','tools/peso':'PESO brewing scale — Peclee','tools/pesomini':'PESOmini brewing scale — Peclee'};
for (const [route,title] of Object.entries(routes)) {
  const dir=new URL(route+'/',root);
  await mkdir(dir,{recursive:true});
  const page=html.replace(/<title>.*?<\/title>/,`<title>${title}</title>`).replace('content="https://peclee-evolved.bermitocoffee.chatgpt.site"',`content="https://peclee-evolved.bermitocoffee.chatgpt.site/${route}"`);
  await writeFile(new URL('index.html',dir),page);
}
console.log('Prepared 7 directly accessible routes.');
