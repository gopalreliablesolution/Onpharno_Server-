// Polite fetcher for PUBLIC FACTUAL sources (e.g. NIH ODS fact sheets, pharmacopoeia/monograph pages).
// Collects page title, headings, meta description and table text into raw-facts.json for review.
// It does NOT download images or marketing copy. Do not point it at competitors' product pages.
// Setup: npm i cheerio robots-parser   (Node 18+)   Run: node fetch-public-facts.mjs sources.txt
import fs from 'node:fs';
import crypto from 'node:crypto';
import * as cheerio from 'cheerio';
import robotsParser from 'robots-parser';

const UA = 'OnpharnoResearchBot/1.0 (+https://onpharno.com; contact: info@onpharno.com)';
const DELAY_MS = 2000;
const file = process.argv[2] || 'sources.txt';
const urls = fs.readFileSync(file, 'utf8').split('\n').map((s) => s.trim()).filter((s) => s && !s.startsWith('#'));
fs.mkdirSync('.cache', { recursive: true });
const robotsCache = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function allowed(u) {
  const { origin } = new URL(u);
  if (!robotsCache[origin]) {
    try {
      const res = await fetch(origin + '/robots.txt', { headers: { 'User-Agent': UA } });
      robotsCache[origin] = robotsParser(origin + '/robots.txt', res.ok ? await res.text() : '');
    } catch { robotsCache[origin] = robotsParser(origin + '/robots.txt', ''); }
  }
  return robotsCache[origin].isAllowed(u, UA) !== false;
}

const out = [];
for (const u of urls) {
  if (!(await allowed(u))) { console.log('SKIP (robots.txt):', u); continue; }
  const cachePath = '.cache/' + crypto.createHash('md5').update(u).digest('hex') + '.html';
  let html;
  if (fs.existsSync(cachePath)) html = fs.readFileSync(cachePath, 'utf8');
  else {
    let res;
    for (let a = 0; a < 3; a++) {
      res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (res.status === 403 || res.status === 429) { console.log('STOP', res.status, u); res = null; break; }
      if (res.ok) break;
      await sleep(DELAY_MS * (a + 2));
    }
    if (!res || !res.ok) continue;
    html = await res.text(); fs.writeFileSync(cachePath, html); await sleep(DELAY_MS);
  }
  const $ = cheerio.load(html);
  out.push({
    url: u, retrievedAt: new Date().toISOString(), title: $('title').first().text().trim(),
    description: $('meta[name=description]').attr('content') || '',
    headings: $('h1,h2,h3').map((_, e) => $(e).text().trim()).get().slice(0, 60),
    tables: $('table').map((_, t) => $(t).text().replace(/\s+/g, ' ').trim().slice(0, 1500)).get().slice(0, 10),
  });
  console.log('OK', u);
}
fs.writeFileSync('raw-facts.json', JSON.stringify(out, null, 2));
console.log(`Saved ${out.length} pages to raw-facts.json`);
