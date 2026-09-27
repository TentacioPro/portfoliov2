// Builds every style (preset) with its default parts and checks it like `npm run qa` does: axe WCAG 2.2 AA, no horizontal
// scroll, no text under 12px, at 390/768/1440 in each mode the style has. Writes qa-shots/presets/<style>-<mode>-<w>-<page>.png
// and a contact sheet (qa-shots/presets/sheet.png). Usage: npm run qa:presets [-- style-id ...]   (CHROME=<path> optional)
// MIX=1 (npm run qa:mix): instead of whole styles, rotate every header, hero and work part through combinations inside
// two unlike host styles (R11 light+dark and R10 Poster), to catch parts that only work with their own colours.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { STYLES, PARTS } from '../themes/engine.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TMP = path.join(ROOT, '.qa-presets'); const SHOTS = path.join(ROOT, 'qa-shots', 'presets');
fs.rmSync(TMP, { recursive: true, force: true }); fs.mkdirSync(SHOTS, { recursive: true });
const only = process.argv.slice(2);
const extra = process.env.THEME_EXTRA ? JSON.parse(process.env.THEME_EXTRA) : {};
const JOBS = {};
if (process.env.MIX) {
  const [H, E, W] = ['header', 'hero', 'work'].map((k) => Object.keys(PARTS[k]));
  const n = Math.max(H.length, E.length, W.length);
  for (const host of ['r11-soft-ink', 'r10-poster']) for (let i = 0; i < n; i++) {
    const slots = { header: H[i % H.length], hero: E[(i * 7) % E.length], work: W[i % W.length] };
    JOBS[`mix-${host}-${i}`] = { ...extra, style: host, slots: { ...(extra.slots || {}), ...slots } };
  }
} else for (const id of Object.keys(STYLES).filter((x) => !only.length || only.includes(x))) JOBS[id] = { ...extra, style: id };
const ids = Object.keys(JOBS);
for (const id of ids) {
  const tj = path.join(TMP, `${id}.json`); fs.mkdirSync(TMP, { recursive: true });
  fs.writeFileSync(tj, JSON.stringify(JOBS[id]));
  execFileSync(process.execPath, ['scripts/build.mjs'], { cwd: ROOT, env: { ...process.env, THEME_JSON: tj, OUT_DIR: path.join(TMP, id, 'portfoliov2') }, stdio: 'ignore' });
}
let current = '';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript' };
const srv = http.createServer((req, res) => {
  const dir = path.join(TMP, current); // each style is served at the real base path, /portfoliov2/, one at a time
  let f = path.join(dir, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!f.startsWith(dir)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) f = path.join(dir, 'portfoliov2', '404.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'text/plain' }); res.end(fs.readFileSync(f));
}).listen(0, '127.0.0.1');
await new Promise((r) => srv.once('listening', r));
const PORT = srv.address().port;
const pages = ['', 'work/voice-agents/', 'writing/', 'nope/'];
const widths = [390, 768, 1440];
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
let bad = 0, n = 0; const sheet = [];
const label = (id) => (JOBS[id].slots ? `${STYLES[JOBS[id].style].name} + ${Object.values(JOBS[id].slots).join('/')}` : `${STYLES[id].round} ${STYLES[id].name}`);
for (const id of ids) for (const mode of Object.keys(STYLES[JOBS[id].style].modes)) for (const w of widths) {
  current = id;
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: mode, reducedMotion: 'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  for (const p of pages) {
    const pg = await ctx.newPage(); await pg.goto(`http://127.0.0.1:${PORT}/portfoliov2/${p}`); n++;
    const axe = await new AxeBuilder({ page: pg }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const dom = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, small: [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12).length }));
    const issues = [...axe.violations.map((v) => `${v.id}(${v.impact}): ${v.nodes.slice(0, 2).map((x) => x.target.join(' ')).join(' | ')}`), ...(dom.sw > w ? [`overflow ${dom.sw}px`] : []), ...(dom.small ? [`${dom.small} tiny texts`] : [])];
    if (issues.length) { bad++; console.log(label(id), mode, w, '/' + p, '\n   ' + issues.join('\n   ')); }
    if (p === '' && w !== 768) { const f = `${id}-${mode}-${w}.png`; await pg.screenshot({ path: path.join(SHOTS, f), fullPage: w === 390 ? false : true, clip: w === 390 ? undefined : { x: 0, y: 0, width: 1440, height: 1500 } }); sheet.push({ id, mode, w, f }); }
    await pg.close();
  }
  await ctx.close();
}
// contact sheet: one row per style/mode, desktop (top 1500px) + phone (first screen)
const rows = [...new Set(sheet.map((s) => `${s.id}|${s.mode}`))];
const html = `<body style="margin:0;background:#888;font:14px system-ui"><div style="display:grid;grid-template-columns:repeat(${Math.min(4, rows.length)},auto);gap:16px;padding:16px">${rows.map((r) => { const [id, mode] = r.split('|'); const img = (w) => sheet.find((s) => s.id === id && s.mode === mode && s.w === w); const d = img(1440), m = img(390); return `<figure style="margin:0;background:#fff;padding:8px"><figcaption style="padding:0 0 6px">${label(id)} · ${mode}</figcaption><div style="display:flex;gap:8px;align-items:flex-start">${d ? `<img src="${d.f}" style="width:480px">` : ''}${m ? `<img src="${m.f}" style="width:130px">` : ''}</div></figure>`; }).join('')}</div></body>`;
fs.writeFileSync(path.join(SHOTS, 'sheet.html'), html);
const sp = await b.newPage({ viewport: { width: 2600, height: 900 } }); await sp.goto(`file://${path.join(SHOTS, 'sheet.html')}`); await sp.screenshot({ path: path.join(SHOTS, 'sheet.png'), fullPage: true });
await b.close(); srv.close(); fs.rmSync(TMP, { recursive: true, force: true });
console.log(`${ids.length} ${process.env.MIX ? 'mixes' : 'styles'}, ${n} page checks, ${bad} with issues. Sheet: qa-shots/presets/sheet.png`); process.exit(bad ? 1 : 0);
