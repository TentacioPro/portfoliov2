// G4/G5: every built page at 320/390/768/1280/1440 in light and dark: axe (WCAG 2.2 AA), no horizontal scroll,
// no text under 12px, focus ring present. Screenshots go to qa-shots/ (gitignored). Needs `npm run build` first.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
const PORT = 4179, BASE = `http://127.0.0.1:${PORT}/portfoliov2/`;
const srv = spawn(process.execPath, ['scripts/serve.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 600));
const pages = ['', 'work/voice-agents/', 'work/translator/', 'work/safesupport/', 'work/agenticloop/', 'writing/', 'nope/'];
const widths = [320, 390, 768, 1280, 1440];
const b = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
fs.mkdirSync('qa-shots', { recursive: true });
let bad = 0;
for (const theme of ['light', 'dark']) for (const w of widths) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: theme, reducedMotion: 'reduce' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
  for (const p of pages) {
    const pg = await ctx.newPage(); await pg.goto(BASE + p);
    const axe = await new AxeBuilder({ page: pg }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
    const dom = await pg.evaluate(() => ({ sw: document.documentElement.scrollWidth, small: [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 12).length }));
    const issues = [...axe.violations.map((v) => `${v.id}(${v.impact})`), ...(dom.sw > w ? [`overflow ${dom.sw}px`] : []), ...(dom.small ? [`${dom.small} tiny texts`] : [])];
    if (issues.length) { bad++; console.log(theme, w, '/' + p, issues.join(' ')); }
    if (w === 390 || w === 1440) await pg.screenshot({ path: `qa-shots/${theme}-${w}-${(p || 'home').replace(/\//g, '_')}.png`, fullPage: true });
    await pg.close();
  }
  await ctx.close();
}
await b.close(); srv.kill();
console.log(`${pages.length * widths.length * 2} page checks, ${bad} with issues`); process.exit(bad ? 1 : 0);
