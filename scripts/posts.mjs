// Markdown posts with a small front-matter block. Shared by the build and the local writer.
import fs from 'node:fs';
import path from 'node:path';

export const FIELDS = ['title', 'date', 'updated', 'kind', 'status', 'summary', 'link', 'source'];

export function parse(text, slug) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  const meta = { slug, kind: 'written', status: 'draft', title: slug, date: '', body: m ? m[2] : text };
  if (m) for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  return meta;
}

export function serialize(p) {
  const head = FIELDS.filter((k) => p[k]).map((k) => `${k}: ${/[:#]/.test(p[k]) ? JSON.stringify(p[k]) : p[k]}`).join('\n');
  return `---\n${head}\n---\n${(p.body || '').replace(/^\n+/, '')}`;
}

export function readPosts(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => parse(fs.readFileSync(path.join(dir, f), 'utf8'), f.slice(0, -3)))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
}
