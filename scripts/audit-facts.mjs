// G3 fact audit on the built HTML. Fails (exit 1) on any NEVER string, an unknown number, a missing or wrong
// status label, the EBV agent or the self-hosted assistant called live or in production, or vendor/telephony names.
// Env: DIST_DIR (a scratch build) and SITE_JSON (a candidate site.json) let Workbench audit an edit before saving it.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../src/content.js';
const DIST = process.env.DIST_DIR ? path.resolve(process.env.DIST_DIR) : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const files = []; (function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p); } })(DIST);
const text = (h) => h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const NEVER = [/78%/, /200\+/, /10K\+/i, /36 dental codes/i, /9 ?min/i, /under 300 ?ms/i, /twilio/i, /\bSIP\b/, /phone number/i, /amazon connect/i, /onboardflow/i, /hackathon/i,
  /salary/i, /\bCTC\b/, /notice period/i, /abishek-maharajan\.online/i, /maharajan(?!\/?")/i, /lorem ipsum/i, /testimonial/i, /langfuse is (in use|used)/i, /AI engineer at cluBITS/i];
const allowed = JSON.stringify(C); const fails = [];
for (const f of files) {
  const t = text(fs.readFileSync(f, 'utf8')); const rel = path.relative(DIST, f);
  if (rel.startsWith('writing/') && rel !== 'writing/index.html') continue; // posts are the owner's own words
  for (const r of NEVER) if (r.test(t)) fails.push(`${rel}: NEVER ${r}`);
  for (const n of t.match(/\d[\d,.]*%?/g) || []) if (!allowed.includes(n) && !/^(404|20\d\d)$/.test(n)) fails.push(`${rel}: number not in content/site.json: ${n}`);
  if (/insurance-verification[^.]{0,80}\b(is live|in production)\b/i.test(t) || /self-hosted[^.]{0,80}\b(is live|in production)\b/i.test(t)) fails.push(`${rel}: EBV agent or self-hosted assistant called live/in production`);
}
const labels = new Set(Object.values(C.statuses).map((s) => s.label));
for (const p of C.projects) if (!C.statuses[p.status] || !labels.has(C.statuses[p.status].label)) fails.push(`project ${p.id}: bad status`);
for (const p of C.projects) for (const f of p.families || []) if (/insurance/i.test(f.name) && f.status !== 'ready') fails.push('EBV agent status must be ready');
console.log(`${files.length} pages audited`); if (fails.length) { console.log([...new Set(fails)].join('\n')); process.exit(1); } console.log('facts audit: pass');
