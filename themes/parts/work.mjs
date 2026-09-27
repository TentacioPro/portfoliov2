// Work-list variants (the home page's project list). Every item links to its project page and shows its status label.
import { chart } from './viz.mjs';
const link = (x, p) => `${x.B}work/${p.id}/`;
const SHAPES = [
  (c) => `<svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="${c}"/></svg>`,
  (c) => `<svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true"><rect x="2" y="2" width="60" height="60" fill="${c}"/></svg>`,
  (c) => `<svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true"><path d="M32 3 62 61H2z" fill="${c}"/></svg>`,
  (c) => `<svg width="56" height="56" viewBox="0 0 64 64" aria-hidden="true"><path d="M2 32h60M32 2v60" stroke="${c}" stroke-width="10"/></svg>`,
];
const SHAPE_C = ['var(--accent)', 'var(--ink)', 'var(--ready)', 'var(--ink)'];
export default {
  tiles: {
    label: 'Tiles', from: 'R11, R10 Soft, Candy', css: '',
    render: (x) => `<div class="grid4">${x.C.projects.map((p) => `<a class="card tile" href="${link(x, p)}">
  <span>${x.tag(p.status)}</span><h3>${x.esc(p.short)}</h3>
  <p class="num">${x.esc(p.key.value)}</p><p class="k sub">${x.esc(p.key.label)}</p>
  <p class="one">${x.esc(p.oneLine)}</p><span class="more">What I built, and what I don’t claim →</span></a>`).join('\n')}</div>`,
  },
  rows: {
    label: 'Rows', from: 'R10 Ink, Hollow',
    css: '.wrows{margin-top:24px}.wrow{display:grid;grid-template-columns:minmax(0,1fr) 240px;gap:40px;padding:20px;margin-top:20px;text-decoration:none}.wrow h3{font-size:28px;line-height:1.2;font-weight:700}.wrow h3 .tag{margin-left:8px}.wrow .num{font-size:36px}.wrow p.sub{margin-top:8px}@media (max-width:720px){.wrow{grid-template-columns:minmax(0,1fr);gap:12px}.wrow h3{font-size:20px}}',
    render: (x) => `<div class="wrows">${x.C.projects.map((p) => `<a class="card wrow" href="${link(x, p)}"><div><h3>${x.esc(p.short)}${x.tag(p.status)}</h3><p class="sub">${x.esc(p.oneLine)}</p></div><div><p class="num">${x.esc(p.key.value)}</p><p class="sub" style="font-size:14px;margin-top:4px">${x.esc(p.key.label)}</p></div></a>`).join('')}</div>`,
  },
  list: {
    label: 'Quiet list', from: 'R10 Ma',
    css: '.wlist li{margin-top:36px}.wlist h3{font-size:20px;font-weight:500;margin-top:6px}.wlist h3 a{text-decoration:none}.wlist h3 a:hover{text-decoration:underline}.wlist p{margin-top:6px;line-height:1.8}',
    render: (x) => `<ul class="wlist">${x.C.projects.map((p) => `<li><p style="font-size:14px">${x.tag(p.status)}</p><h3><a href="${link(x, p)}">${x.esc(p.short)}</a></h3><p class="sub">${x.esc(p.oneLine)} <b style="color:var(--ink)">${x.esc(p.key.value)}</b> ${x.esc(p.key.label)}.</p></li>`).join('')}</ul>`,
  },
  charts: {
    label: 'Charts', from: 'R10 Chart',
    css: '.wcharts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:24px}.wcharts>*{min-width:0}.wchart{padding:24px;text-decoration:none}.wchart .head{display:flex;justify-content:space-between;align-items:center;gap:8px 12px;flex-wrap:wrap}.wchart h3{font-size:20px;font-weight:600}.wchart .row{display:flex;align-items:flex-end;gap:24px;margin-top:16px;flex-wrap:wrap}.wchart .num{font-size:36px;line-height:1}.wchart p.one{margin-top:12px}@media (max-width:720px){.wcharts{grid-template-columns:minmax(0,1fr)}}',
    render: (x) => `<div class="wcharts">${x.C.projects.map((p) => `<a class="card wchart" href="${link(x, p)}"><div class="head"><h3>${x.esc(p.short)}</h3>${x.tag(p.status)}</div><div class="row"><p class="num">${x.esc(p.key.value)}</p>${chart(p, x.esc)}</div><p class="sub" style="font-size:14px;margin-top:6px">${x.esc(p.key.label)}</p><p class="one sub">${x.esc(p.oneLine)}</p></a>`).join('')}</div>`,
  },
  shapes: {
    label: 'Shapes', from: 'R10 Geometric',
    css: '.wshapes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:32px;margin-top:28px}.wshapes>*{min-width:0;text-decoration:none}.wshapes h3{font-size:20px;margin-top:16px}.wshapes .tag{margin-top:8px}.wshapes .num{font-size:36px;margin-top:12px}@media (max-width:1100px){.wshapes{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:520px){.wshapes{grid-template-columns:minmax(0,1fr)}}',
    render: (x) => `<div class="wshapes">${x.C.projects.map((p, i) => `<a href="${link(x, p)}">${SHAPES[i % 4](SHAPE_C[i % 4])}<h3>${x.esc(p.short)}</h3><p>${x.tag(p.status)}</p><p class="num">${x.esc(p.key.value)}</p><p class="sub" style="font-size:14px">${x.esc(p.key.label)}</p></a>`).join('')}</div>`,
  },
  table: {
    label: 'Table', from: 'R10 Product',
    css: '.wtable{margin-top:24px;padding:4px 8px}.tbl{width:100%;border-collapse:collapse;font-size:14px}.tbl th{color:var(--sub);font-weight:500;text-align:left;padding:10px 12px;border-bottom:1px solid var(--line)}.tbl td{padding:14px 12px;border-bottom:1px solid var(--line);vertical-align:middle}.tbl tr:last-child td{border-bottom:0}.tbl .num{font-size:20px}.tbl a{font-weight:600}@media (max-width:720px){.tbl thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.tbl tr{display:block;padding:12px 4px;border-bottom:1px solid var(--line)}.tbl td{display:block;padding:3px 0;border:0}}',
    render: (x) => `<div class="card wtable"><table class="tbl"><thead><tr><th scope="col">Project</th><th scope="col">Status</th><th scope="col">Key value</th><th scope="col">What it is</th></tr></thead><tbody>${x.C.projects.map((p) => `<tr><td><a href="${link(x, p)}">${x.esc(p.short)}</a></td><td>${x.tag(p.status)}</td><td><span class="num">${x.esc(p.key.value)}</span> <span class="sub">${x.esc(p.key.label)}</span></td><td class="sub">${x.esc(p.oneLine)}</td></tr>`).join('')}</tbody></table></div>`,
  },
  poster: {
    label: 'Poster numbers', from: 'R10 Poster',
    css: '.wposter{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:28px}.wposter>*{min-width:0;text-decoration:none}.wposter .num{font-size:clamp(48px,5vw,80px)}.wposter .l{font-weight:600;margin-top:8px}.wposter h3{font-size:20px;margin-top:12px}.wposter .tag{margin-top:8px}@media (max-width:1100px){.wposter{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:520px){.wposter{grid-template-columns:minmax(0,1fr)}}',
    render: (x) => `<div class="wposter">${x.C.projects.map((p) => `<a class="card" href="${link(x, p)}"><p class="num">${x.esc(p.key.value)}</p><p class="l">${x.esc(p.key.label)}</p><h3>${x.esc(p.short)}</h3><p>${x.tag(p.status)}</p></a>`).join('')}</div>`,
  },
  letter: {
    label: 'Letter paragraphs', from: 'R10 Issue',
    css: '.wletter section{padding:20px 0;border-top:1px solid var(--line)}.wletter h3{font-size:20px}.wletter h3 a{text-decoration:none}.wletter h3 .tag{margin-left:8px}.wletter p{margin-top:8px}',
    render: (x) => `<div class="wletter">${x.C.projects.map((p) => `<section><h3><a href="${link(x, p)}">${x.esc(p.short)}</a>${x.tag(p.status)}</h3><p>${x.esc(p.oneLine)} <b>${x.esc(p.key.value)}</b> ${x.esc(p.key.label)}.</p></section>`).join('')}</div>`,
  },
};
