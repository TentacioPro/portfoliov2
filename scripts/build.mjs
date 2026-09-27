// Static build: src/content.js + content/posts/*.md -> dist/ (plain HTML, one CSS file, one small script).
// No framework ships to the browser. Every page reads fully without JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { marked } from 'marked';
import * as C from '../src/content.js';
import { readPosts } from './posts.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'dist');
const B = C.site.base;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tag = (k) => `<span class="tag t-${k}">${C.statuses[k].label}</span>`;
const mailto = `mailto:${C.person.email}?subject=${encodeURIComponent(C.person.emailSubject)}`;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
const asset = (file) => {
  const buf = fs.readFileSync(path.join(ROOT, 'src', file));
  const h = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
  const name = file.replace(/\.(\w+)$/, `.${h}.$1`);
  fs.writeFileSync(path.join(OUT, 'assets', name), buf);
  return `${B}assets/${name}`;
};
const CSS = asset('site.css');
const JS = asset('site.js');

const posts = readPosts(path.join(ROOT, 'content', 'posts')).filter((p) => p.status === 'published');
const hasWriting = posts.length > 0;

function page({ title, description = C.site.description, path: p = '', current = '', body, mono = false }) {
  const url = C.site.url + p;
  const nav = [['Work', `${B}#work`, 'work'], ['About', `${B}#about`, 'about'], ...(hasWriting ? [['Writing', `${B}writing/`, 'writing']] : [])];
  const fonts = `family=Manrope:wght@400;500;600;700;800${mono ? '&family=IBM+Plex+Mono:wght@400' : ''}&display=swap`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta name="theme-color" content="#e8ebef" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0b0b0c" media="(prefers-color-scheme: dark)">
<script>try{var t=localStorage.getItem('theme');if(t)document.documentElement.dataset.theme=t}catch(e){}</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fonts}">
<link rel="stylesheet" href="${CSS}">
<script src="${JS}" defer></script>
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<div class="wrap">
<header class="top">
  <a class="name" href="${B}">${C.person.name}</a>
  <nav class="nav card" aria-label="Site">${nav.map(([t, h, k]) => `<a href="${h}"${k === current ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="aside"><span class="social">${C.person.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join('')}</span>
  <button class="theme" type="button" data-theme-toggle aria-label="Switch colour mode"><i aria-hidden="true"></i><span>Dark</span></button></div>
</header>
<main id="main">
${body}
</main>
<footer class="foot sub">
  <p>${esc(C.authorship)}</p>
  <p>${C.person.links.map((l) => `<a href="${l.href}">${l.label}</a>`).join(' · ')} · <a href="${mailto}">${C.person.email}</a></p>
</footer>
</div>
</body>
</html>
`;
}

const actions = (big = true) => `<div class="actions"><a class="btn cta" href="${mailto}">${big ? `Email ${C.person.email}` : 'Email me'}</a><button class="btn ghost" type="button" data-copy="${C.person.email}" aria-live="polite">Copy address</button></div>`;

function home() {
  const tiles = C.projects.map((p) => `<a class="card tile" href="${B}work/${p.id}/">
  <span>${tag(p.status)}</span><h3>${esc(p.short)}</h3>
  <p class="num">${esc(p.key.value)}</p><p class="k sub">${esc(p.key.label)}</p>
  <p class="one">${esc(p.oneLine)}</p><span class="more">What I built, and what I don’t claim →</span></a>`).join('\n');
  const exp = C.experiments.map((e) => `<div class="card item"><h3>${esc(e.name)} ${tag(e.status)}</h3><p class="sub">${esc(e.text)}</p></div>`).join('');
  const also = C.alsoReal.map((e) => `<div class="card item"><h3>${esc(e.name)}</h3><p class="sub">${esc(e.text)}</p></div>`).join('');
  const path_ = C.timeline.map((t) => `<li><span class="sub">${esc(t.when)}</span><span><b>${esc(t.role)}</b>, ${esc(t.where)}. <span class="sub">${esc(t.text)}</span></span></li>`).join('');
  const edu = [...C.education.map((e) => `<li><span class="sub">${esc(e.when)}</span><span><b>${esc(e.name)}</b>, ${esc(e.where)}. <span class="sub">${esc(e.note)}</span></span></li>`),
    `<li><span class="sub">Certification</span><span><b>${esc(C.certification.name)}</b>. <span class="sub">${esc(C.certification.when)}</span></span></li>`,
    `<li><span class="sub">Publication</span><span><b>${esc(C.publication.title)}</b>. <span class="sub">${esc(C.publication.venue)}</span></span></li>`].join('');
  return page({ title: C.site.title, current: 'work', body: `
<section class="hero" aria-labelledby="h">
  <h1 id="h">${esc(C.person.display)}</h1>
  <p class="line">${esc(C.person.line)}</p>
  <p class="role sub">${esc(C.person.employment)} ${esc(C.person.location)}</p>
  ${actions()}
</section>
<section class="section" id="work" aria-labelledby="w"><h2 id="w">Work</h2><p class="lead sub">Four things I built. Each says whether it is live.</p><div class="grid4">${tiles}</div></section>
<section class="section" aria-labelledby="x"><h2 id="x">Experiments</h2><p class="lead sub">Explored, not used day to day.</p><div class="cols2">${exp}</div></section>
<section class="section" aria-labelledby="a"><h2 id="a">Also real</h2><div class="cols2">${also}</div></section>
<section class="section" id="about" aria-labelledby="p"><h2 id="p">Path</h2><ul class="rows card item" style="margin-top:24px">${path_}</ul>
<h2 style="margin-top:48px;font-size:28px">Education, certification, publication</h2><ul class="rows card item" style="margin-top:24px">${edu}</ul></section>
<section class="contact" aria-labelledby="c"><h2 id="c">Write to me.</h2><p class="sub" style="margin-top:8px">One email is the best way to reach me.</p><div style="margin-top:20px">${actions()}</div></section>` });
}

function project(p) {
  const nums = (p.numbers || [p.key]).map((n) => `<div><p class="num">${esc(n.value)}</p><p class="sub">${esc(n.label)}</p></div>`).join('');
  const li = (xs) => xs.map((x) => `<li>${esc(x)}</li>`).join('');
  const fam = p.families ? `<h2 style="margin-top:28px">Families</h2><ul class="fam">${p.families.map((f) => `<li>${tag(f.status)}<span><b>${esc(f.name)}.</b> ${esc(f.text)}</span></li>`).join('')}</ul>` : '';
  const link = p.link ? `<p style="margin-top:28px"><a class="btn ghost" href="${p.link.href}">${esc(p.link.label)}</a></p>` : '';
  return page({ title: `${p.name} · ${C.person.name}`, description: p.oneLine, path: `work/${p.id}/`, current: 'work', body: `
<article style="padding:16px 0 40px">
  <p class="back"><a href="${B}#work">← Work</a></p>
  <p style="margin-top:16px">${tag(p.status)}</p>
  <h1 class="ptitle">${esc(p.name)}</h1>
  <p class="pone">${esc(p.oneLine)}</p>
  <div class="nums">${nums}</div>
  <div class="pcols">
    <section><h2>What I built</h2><ul>${li(p.built)}</ul></section>
    <section><h2>How it was checked</h2><ul>${li(p.checked)}</ul>${fam}</section>
    <section><h2>Not claimed</h2><ul>${li(p.notClaimed)}</ul>${link}</section>
  </div>
</article>
<section class="contact" aria-labelledby="c"><h2 id="c">Questions about this?</h2><div style="margin-top:20px">${actions()}</div></section>` });
}

function writingIndex() {
  let inner;
  if (!hasWriting) {
    inner = `<div class="card empty"><p style="font-size:20px;font-weight:700">First post coming.</p>
<p class="sub" style="margin-top:8px">Planned: reading agent traces and eval failures; one concept explained simply; weekly build notes, including what went wrong.</p>
<p style="margin-top:16px"><a href="${mailto}">Email me</a> to hear when it is up.</p></div>`;
  } else {
    const byYear = {};
    for (const p of posts) (byYear[p.date.slice(0, 4)] ||= []).push(p);
    inner = Object.keys(byYear).sort().reverse().map((y) => `<h2 class="year">${y}</h2><ul class="entries">${byYear[y].map((p) => `<li><a href="${B}writing/${p.slug}/"><p class="kind sub">${p.date} · ${p.kind === 'curated' ? 'Curated' : 'Written'}</p><h3>${esc(p.title)}</h3>${p.summary ? `<p class="sub">${esc(p.summary)}</p>` : ''}</a></li>`).join('')}</ul>`).join('');
  }
  return page({ title: `Writing · ${C.person.name}`, path: 'writing/', current: 'writing', body: `
<section style="padding:16px 0 40px"><h1 class="ptitle">Writing</h1>
<p class="pone sub" style="font-size:16px">Two kinds of entry: <b>Written</b> (my own posts) and <b>Curated</b> (a link, its source, and my note). Grouped by year.</p>${inner}</section>` });
}

function postPage(p) {
  const curated = p.kind === 'curated' && p.link ? `<div class="card curated"><p class="sub" style="font-size:14px">Curated from ${esc(p.source || new URL(p.link).hostname)}</p><p><a href="${esc(p.link)}">${esc(p.link)}</a></p></div>` : '';
  return page({ title: `${p.title} · ${C.person.name}`, description: p.summary || C.site.description, path: `writing/${p.slug}/`, current: 'writing', mono: true, body: `
<article class="post" style="padding:16px 0 40px">
  <p class="back"><a href="${B}writing/">← Writing</a></p>
  <p class="kind sub" style="margin-top:20px">${p.date} · ${p.kind === 'curated' ? 'Curated' : 'Written'}</p>
  <h1>${esc(p.title)}</h1>
  ${p.summary ? `<p class="pone sub">${esc(p.summary)}</p>` : ''}
  ${curated}
  <div class="prose">${marked.parse(p.body)}</div>
  <p class="sub" style="margin-top:32px;font-size:14px">Last changed ${p.updated || p.date}. <a href="${B}writing/">Back to Writing</a></p>
</article>` });
}

function notFound() {
  return page({ title: `Not found · ${C.person.name}`, path: '404.html', body: `
<section class="nf"><p class="num">404</p><h1 style="font-size:28px;margin-top:16px">This page is not here.</h1>
<p class="sub" style="margin-top:8px;max-width:520px">The link may be old. The work is on the home page, and my email still works.</p>
<div class="actions" style="margin-top:24px"><a class="btn cta" href="${B}">Go to the home page</a><a class="btn ghost" href="${mailto}">Email me</a></div></section>` });
}

const out = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
out('index.html', home());
for (const p of C.projects) out(`work/${p.id}/index.html`, project(p));
out('writing/index.html', writingIndex());
for (const p of posts) out(`writing/${p.slug}/index.html`, postPage(p));
out('404.html', notFound());
out('.nojekyll', '');
out('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${C.site.url}sitemap.xml\n`);
const urls = ['', ...C.projects.map((p) => `work/${p.id}/`), ...(hasWriting ? ['writing/', ...posts.map((p) => `writing/${p.slug}/`)] : [])];
out('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((u) => `<url><loc>${C.site.url}${u}</loc></url>`).join('')}</urlset>\n`);
console.log(`built ${2 + C.projects.length + 1 + posts.length} pages; writing ${hasWriting ? 'visible' : 'hidden (no published post)'}`);
