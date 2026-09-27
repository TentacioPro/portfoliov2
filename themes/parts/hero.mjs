// Hero variants (the top of the home page). All read from site.json: person.display, line, employment, location.
import { chart } from './viz.mjs';
const role = (x) => `<p class="role sub">${x.esc(x.C.person.employment)} ${x.esc(x.C.person.location)}</p>`;
export default {
  statement: {
    label: 'Statement', from: 'R11, R10 Soft, Ink, Geometric, Candy, Hollow', css: '',
    render: (x) => `<section class="hero" aria-labelledby="h">
  <h1 id="h">${x.esc(x.C.person.display)}</h1>
  <p class="line">${x.esc(x.C.person.line)}</p>
  ${role(x)}
  ${x.actions()}
</section>`,
  },
  quiet: {
    label: 'Quiet', from: 'R10 Ma', css: '.hero-quiet .eyebrow{font-size:14px}.hero-quiet h1{font-family:var(--font-d);font-size:28px;line-height:1.35;font-weight:600;max-width:820px;margin-top:10px}',
    render: (x) => `<section class="hero hero-quiet" aria-labelledby="h">
  <p class="eyebrow sub">${x.esc(x.C.person.role)} · ${x.esc(x.C.person.place)}</p>
  <h1 id="h">${x.esc(x.C.person.line)}</h1>
  ${role(x)}
  ${x.actions()}
</section>`,
  },
  metrics: {
    label: 'Quiet + key numbers', from: 'R10 Product',
    css: '.hero-metrics h1{font-family:var(--font-d);font-size:28px;line-height:1.3;font-weight:600;max-width:900px;margin-top:6px}.metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-top:24px}.metrics>*{min-width:0;padding:16px}.metrics .num{font-size:28px;margin-top:6px}@media (max-width:720px){.metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}',
    render: (x) => `<section class="hero hero-metrics" aria-labelledby="h">
  <p class="eyebrow sub" style="font-size:14px">${x.esc(x.C.person.role)} · ${x.esc(x.C.person.place)}</p>
  <h1 id="h">${x.esc(x.C.person.line)}</h1>
  ${role(x)}
  ${x.actions()}
  <div class="metrics">${x.C.projects.map((p) => `<div class="card"><p class="sub" style="font-size:14px">${x.esc(p.short)}</p><p class="num">${x.esc(p.key.value)}</p><p class="sub" style="font-size:14px">${x.esc(p.key.label)}</p></div>`).join('')}</div>
</section>`,
  },
  number: {
    label: 'Headline number', from: 'R10 Chart',
    css: '.hero-number{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:48px;align-items:end}.hero-number>*{min-width:0}.hero-number h1{font-family:var(--font-d);font-size:28px;line-height:1.3;font-weight:500}.hero-number .big{padding:24px}.hero-number .big .num{font-size:var(--display);line-height:1}.hero-number .big .bar,.hero-number .big .dots{margin-top:14px}@media (max-width:900px){.hero-number{grid-template-columns:minmax(0,1fr);gap:24px}}',
    render: (x) => {
      const p = x.C.projects[0];
      return `<section class="hero hero-number" aria-labelledby="h">
  <div><h1 id="h">${x.esc(x.C.person.line)}</h1>${role(x)}${x.actions()}</div>
  ${p ? `<a class="card big" href="${x.B}work/${p.id}/" style="text-decoration:none"><p class="num">${x.esc(p.key.value)}</p><p class="sub">${x.esc(p.key.label)} · ${x.tag(p.status)}</p>${chart(p, x.esc)}</a>` : ''}
</section>`;
    },
  },
  poster: {
    label: 'Poster', from: 'R10 Poster',
    css: '.hero-poster h1{line-height:.9}.hero-poster .under{display:flex;justify-content:space-between;align-items:flex-end;gap:32px;margin-top:20px;flex-wrap:wrap}.hero-poster .under p{font-size:20px;line-height:1.4;max-width:620px}',
    render: (x) => `<section class="hero hero-poster" aria-labelledby="h">
  <h1 id="h">${x.C.person.display.split(/,\s*/).map(x.esc).join(',<br>')}</h1>
  <div class="under"><p>${x.esc(x.C.person.line)} <span class="sub">${x.esc(x.C.person.employment)}</span></p>${x.actions()}</div>
</section>`,
  },
  letter: {
    label: 'Letter', from: 'R10 Issue',
    css: '.hero-letter .meta{font-size:14px}.hero-letter .meta+.meta{margin-top:4px}.hero-letter h1{font-family:var(--font-d);font-size:28px;line-height:1.25;font-weight:700;margin-top:24px}.hero-letter .role{margin-top:12px}',
    render: (x) => `<section class="hero hero-letter" aria-labelledby="h">
  <p class="meta sub">From: ${x.esc(x.C.person.name)} &lt;${x.esc(x.C.person.email)}&gt; · ${x.esc(x.C.person.place)}</p>
  <p class="meta sub">Re: what I build, and what is live</p>
  <h1 id="h">${x.esc(x.C.person.line)}</h1>
  <p class="role">${x.esc(x.C.person.employment)} Below: my work, each with its status.</p>
  ${x.actions()}
</section>`,
  },
};
