// Preview the built site at http://127.0.0.1:4173<base>/ — base path comes from content/site.json (site.base),
// so this matches wherever the site is actually served (GitHub Pages subpath, or the abishek.pro custom domain root).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../src/content.js';
const DIST = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.xml': 'application/xml', '.txt': 'text/plain' };
const PORT = Number(process.env.PORT || 4173);
const BASE = C.site.base;
http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!p.startsWith(BASE)) { res.writeHead(302, { location: BASE }); return res.end(); }
  let f = path.join(DIST, p.slice(BASE.length));
  if (!f.startsWith(DIST)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  const found = fs.existsSync(f);
  res.writeHead(found ? 200 : 404, { 'content-type': TYPES[found ? path.extname(f) : '.html'] || 'application/octet-stream' });
  res.end(fs.readFileSync(found ? f : path.join(DIST, '404.html')));
}).listen(PORT, '127.0.0.1', () => console.log(`http://127.0.0.1:${PORT}${BASE}`));
