// Local writing app. Runs on your machine only (127.0.0.1); it is never built or deployed.
// Reads and writes content/posts/*.md and appends one line per action to content/log.jsonl (git-tracked).
// Start: npm run writer   ->  http://127.0.0.1:4321
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { marked } from 'marked';
import { parse, serialize, readPosts } from '../../scripts/posts.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const POSTS = path.join(ROOT, 'content', 'posts');
const LOG = path.join(ROOT, 'content', 'log.jsonl');
const PORT = Number(process.env.PORT || 4321);
fs.mkdirSync(POSTS, { recursive: true });

const log = (act, slug, extra = {}) => fs.appendFileSync(LOG, JSON.stringify({ t: new Date().toISOString(), act, slug, ...extra }) + '\n');
const okSlug = (s) => /^[a-z0-9][a-z0-9-]{0,79}$/.test(s);
const today = () => new Date().toISOString().slice(0, 10);
const send = (res, code, body, type = 'application/json') => { res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }); res.end(type === 'application/json' ? JSON.stringify(body) : body); };
const readBody = (req) => new Promise((ok, bad) => { let d = ''; req.on('data', (c) => { d += c; if (d.length > 2e6) bad(new Error('too large')); }); req.on('end', () => { try { ok(d ? JSON.parse(d) : {}); } catch (e) { bad(e); } }); });
const file = (slug) => path.join(POSTS, `${slug}.md`);
const load = (slug) => (fs.existsSync(file(slug)) ? parse(fs.readFileSync(file(slug), 'utf8'), slug) : null);

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const [, api, kind, slug, action] = url.pathname.split('/');
    if (url.pathname === '/') return send(res, 200, fs.readFileSync(path.join(path.dirname(new URL(import.meta.url).pathname), 'index.html')), 'text/html; charset=utf-8');
    if (api !== 'api') return send(res, 404, { error: 'not found' });
    if (kind === 'posts' && !slug && req.method === 'GET') return send(res, 200, readPosts(POSTS).map((p) => Object.fromEntries(Object.entries(p).filter(([k]) => k !== 'body'))));
    if (kind === 'log') return send(res, 200, fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').trim().split('\n').filter(Boolean).slice(-50).reverse().map((l) => JSON.parse(l)) : []);
    if (kind === 'preview' && req.method === 'POST') { const b = await readBody(req); return send(res, 200, { html: marked.parse(b.body || '') }); }
    if (kind === 'build' && req.method === 'POST') {
      return execFile(process.execPath, [path.join(ROOT, 'scripts', 'build.mjs')], { cwd: ROOT }, (err, out, errOut) => {
        log('build', '-', { ok: !err });
        send(res, err ? 500 : 200, { ok: !err, out: (out + errOut).trim() });
      });
    }
    if (kind === 'posts' && slug) {
      if (!okSlug(slug)) return send(res, 400, { error: 'Slug: lowercase letters, digits and hyphens.' });
      if (req.method === 'GET') { const p = load(slug); return p ? send(res, 200, p) : send(res, 404, { error: 'no such post' }); }
      if (req.method === 'PUT') {
        const b = await readBody(req); const prev = load(slug);
        const p = { ...prev, ...b, slug, status: prev?.status || 'draft', date: prev?.date || b.date || today() };
        if (prev) p.updated = today();
        fs.writeFileSync(file(slug), serialize(p)); log(prev ? 'save' : 'create', slug, { status: p.status });
        return send(res, 200, load(slug));
      }
      if (req.method === 'POST' && (action === 'publish' || action === 'unpublish')) {
        const p = load(slug); if (!p) return send(res, 404, { error: 'no such post' });
        p.status = action === 'publish' ? 'published' : 'draft'; if (action === 'publish' && !p.date) p.date = today();
        fs.writeFileSync(file(slug), serialize(p)); log(action, slug, { status: p.status });
        return send(res, 200, load(slug));
      }
      if (req.method === 'DELETE') { if (fs.existsSync(file(slug))) { fs.unlinkSync(file(slug)); log('delete', slug); } return send(res, 200, { ok: true }); }
    }
    return send(res, 404, { error: 'not found' });
  } catch (e) { return send(res, 500, { error: String(e.message || e) }); }
});
server.listen(PORT, '127.0.0.1', () => console.log(`Writer: http://127.0.0.1:${PORT}  (local only; posts in content/posts, log in content/log.jsonl)`));
