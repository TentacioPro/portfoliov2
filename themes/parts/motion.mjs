// Parts from rounds 5 and 6 (the animated and object-led home pages), rebuilt as fluid parts that read site.json.
// Every looping animation sits under .mo, so the Pause button (site.js), `motion: false` in theme.json and
// prefers-reduced-motion all stop it (WCAG 2.2.2).
import fs from 'node:fs';
import { markup } from './header.mjs';
const ASCII = fs.readFileSync(new URL('../assets/ascii-signal.txt', import.meta.url), 'utf8');
const link = (x, p) => `${x.B}work/${p.id}/`;
const facts = (p) => (p.numbers || [p.key]).map((n) => `${n.value} ${n.label}`);
const initials = (name) => name.split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const STATUS_ORDER = ['live', 'ready', 'repo', 'daily', 'experiment'];
const sortByLive = (ps) => [...ps].sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
const pause = '<button class="btn ghost pause" type="button" data-motion-toggle aria-pressed="false">Pause motion</button>';
const flap = (esc, text, cls = '') => `<span class="sr">${esc(text)}</span><span aria-hidden="true" class="flaps ${cls}">${[...text].map((c, i) => `<span class="flap" style="animation-delay:${(i * 0.03).toFixed(2)}s">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('')}</span>`;

export const hero = {
  kinetic: {
    label: 'Kinetic marquee', from: 'R5 Kinetic',
    css: `.hero-kinetic{padding-top:8px}.mq{margin:0 calc(50% - 50vw);overflow:hidden;font-family:var(--font-d);text-transform:uppercase;line-height:.92;font-size:clamp(64px,10vw,150px);white-space:nowrap}
.mq>span{display:inline-block;animation:mq 26s linear infinite}.mq.rev>span{animation-direction:reverse;animation-duration:32s}.mq.out{color:transparent;-webkit-text-stroke:2px var(--ink)}.mq.acc{color:var(--accent)}
@keyframes mq{to{transform:translateX(-50%)}}.hero-kinetic .below{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:48px;align-items:start;margin-top:36px}
.hero-kinetic h1{font-size:28px;line-height:1.3;font-weight:500;letter-spacing:-.01em;max-width:900px}.hero-kinetic .w{animation:lit 9s steps(1) infinite}@keyframes lit{0%{color:var(--sub)}10%,85%{color:var(--ink)}100%{color:var(--sub)}}
.ringlink{position:relative;display:block;width:180px;height:180px;border-radius:50%;background:var(--accent);color:var(--ink);text-decoration:none}.ringlink svg{position:absolute;inset:0;animation:rot 16s linear infinite}.ringlink b{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-size:36px}
@keyframes rot{to{transform:rotate(360deg)}}@media (max-width:720px){.hero-kinetic .below{grid-template-columns:minmax(0,1fr)}.ringlink{width:120px;height:120px}.hero-kinetic h1{font-size:20px}}`,
    render: (x) => {
      const rep = (t) => `<span>${x.esc(`${t} ✺ `).repeat(6)}</span>`;
      const labels = [...new Set(x.C.projects.map((p) => x.C.statuses[p.status].label))].join(' ✺ ');
      const words = x.C.person.line.split(' ').map((w, i) => `<span class="w" style="animation-delay:${(i * 0.12).toFixed(2)}s">${x.esc(w)}</span>`).join(' ');
      return `<section class="hero hero-kinetic mo" aria-labelledby="h">
  <div aria-hidden="true"><div class="mq">${rep(x.C.projects.map((p) => p.short).join(' ✺ '))}</div><div class="mq rev out">${rep(labels)}</div><div class="mq acc">${rep(`${x.C.person.role} ✺ ${x.C.person.place}`)}</div></div>
  <div class="below"><div><h1 id="h">${words}</h1><p class="role sub">${x.esc(x.C.person.employment)} ${x.esc(x.C.person.location)}</p>${x.actions()}<p style="margin-top:12px">${pause}</p></div>
  <a class="ringlink" href="${x.mailto}" aria-label="Email ${x.esc(x.C.person.email)}"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs><text font-weight="700" font-size="15" letter-spacing="3" fill="currentColor"><textPath href="#ring">EMAIL ME · EMAIL ME · EMAIL ME · EMAIL ME ·</textPath></text></svg><b aria-hidden="true">→</b></a></div>
</section>`;
    },
  },
  window: {
    label: 'Desktop window', from: 'R5 abishek.os',
    css: `.hero-window{padding-top:8px}.win{border-radius:16px;overflow:hidden}.winbar{height:38px;display:flex;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid var(--line);font-size:14px;font-weight:600;color:var(--sub)}.winbar i{width:12px;height:12px;border-radius:50%}.winbar i:nth-child(1){background:#ff5f57}.winbar i:nth-child(2){background:#febc2e}.winbar i:nth-child(3){background:#28c840}.winbar span{margin-left:8px}
.hero-window .win{max-width:640px}.hero-window .winbody{padding:28px 30px 30px}.hero-window h1{font-family:var(--font-d);font-size:var(--display);line-height:1.05;font-weight:var(--w-d);letter-spacing:var(--track-d)}.hero-window .line{margin-top:14px}`,
    render: (x) => `<section class="hero hero-window" aria-labelledby="h"><div class="card win"><div class="winbar" aria-hidden="true"><i></i><i></i><i></i><span>about-me.txt</span></div><div class="winbody">
  <h1 id="h">${x.esc(x.C.person.display)}</h1><p class="line">${x.esc(x.C.person.line)}</p><p class="role sub">${x.esc(x.C.person.employment)} ${x.esc(x.C.person.location)}</p>${x.actions()}</div></div></section>`,
  },
  aurora: {
    label: 'Aurora (centred)', from: 'R5 Aurora glass',
    css: `.hero-aurora{text-align:center;padding:56px 0 40px}.hero-aurora .pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;font-size:14px;font-weight:600}.hero-aurora h1{font-family:var(--font-d);font-size:var(--display);line-height:.98;font-weight:var(--w-d);letter-spacing:var(--track-d);max-width:1100px;margin:22px auto 0}
.hero-aurora .line{margin:22px auto 0;max-width:640px}.hero-aurora .role{margin:8px auto 0;max-width:640px}.hero-aurora .actions{justify-content:center}`,
    render: (x) => {
      const live = x.C.projects.find((p) => p.status === 'live');
      return `<section class="hero hero-aurora" aria-labelledby="h">${live ? `<span class="card pill">${x.tag('live')} ${x.esc(live.short)} · ${x.esc(x.C.person.place)}</span>` : ''}
  <h1 id="h">${x.esc(x.C.person.display)}</h1><p class="line">${x.esc(x.C.person.line)}</p><p class="role sub">${x.esc(x.C.person.employment)}</p>${x.actions()}</section>`;
    },
  },
  ascii: {
    label: 'ASCII signal', from: 'R5 ASCII signal',
    css: `.hero-ascii .meta{font-size:14px;font-weight:700;text-transform:uppercase}.field{margin:18px calc(50% - 50vw) 0;overflow:hidden}.field pre{margin:0;white-space:pre;line-height:1;font:13px/1 var(--font);width:max-content;animation:flow 14s linear infinite}@keyframes flow{to{transform:translateX(-50%)}}
.hero-ascii .flash{display:inline-block;margin-top:10px;padding:2px 8px;font-size:14px;font-weight:700;animation:fl 7s steps(1) infinite}@keyframes fl{0%,62%{background:transparent;color:var(--ink)}63%,92%{background:var(--ink);color:var(--bg)}}
.hero-ascii h1{font-family:var(--font-d);font-size:var(--display);line-height:1;font-weight:var(--w-d);letter-spacing:var(--track-d);margin-top:28px;max-width:1100px}.hero-ascii .blink{animation:bl 1s steps(1) infinite}@keyframes bl{50%{opacity:0}}@media (max-width:720px){.field pre{font-size:12px}}`,
    render: (x) => {
      const art = ASCII.split('\n').map((l) => l + l).join('\n');
      return `<section class="hero hero-ascii mo" aria-labelledby="h"><p class="meta">${x.esc(`${x.C.person.name.replace(/\s+/g, '_')} / ${x.C.person.role} / ${x.C.person.place}`)}</p>
  <div class="field" aria-hidden="true"><pre>${x.esc(art)}</pre></div><p class="flash" aria-hidden="true">[ seconds before hang-up: tool → database ✓ ]</p>
  <h1 id="h">${x.esc(x.C.person.line)}</h1><p class="role sub">${x.esc(x.C.person.employment)} ${x.esc(x.C.person.location)}</p>${x.actions()}<p style="margin-top:12px">${pause}</p></section>`;
    },
  },
  manpage: {
    label: 'Man page', from: 'R6 abishek(1)',
    css: `.hero-man .mh{display:flex;justify-content:space-between;gap:16px;color:var(--sub);flex-wrap:wrap}.hero-man h2,.hero-man h1{font-size:16px;font-weight:600;color:var(--ink);margin-top:18px;letter-spacing:0}.hero-man .in{margin-left:7ch;max-width:72ch}.hero-man h1 .in{display:block;font-weight:400;margin-top:0}.hero-man .actions{margin-left:7ch;margin-top:12px}
.hero-man .cur{display:inline-block;width:.6em;height:1.1em;background:var(--ink);vertical-align:-.2em;animation:bl 1.1s steps(1) infinite}@keyframes bl{50%{opacity:0}}@media (max-width:720px){.hero-man .in,.hero-man .actions{margin-left:2ch}}`,
    render: (x) => {
      const n = x.C.person.name.split(/\s+/)[0].toUpperCase();
      return `<section class="hero hero-man" aria-labelledby="h"><p class="mh" aria-hidden="true"><span>${x.esc(n)}(1)</span><span>${x.esc(x.C.person.role)} Manual</span><span>${x.esc(n)}(1)</span></p>
  <h1 id="h">NAME<span class="in">${x.esc(x.C.person.name.toLowerCase())} — ${x.esc(x.C.person.line.replace(/^I /, '').replace(/\.$/, ''))}</span></h1>
  <h2>SYNOPSIS</h2><p class="in">email <a href="${x.mailto}">${x.esc(x.C.person.email)}</a> <span class="cur mo" aria-hidden="true"></span></p>${x.actions()}
  <h2>DESCRIPTION</h2><p class="in">${x.esc(x.C.person.employment)} ${x.esc(x.C.person.location)}</p></section>`;
    },
  },
  datasheet: {
    label: 'Datasheet header', from: 'R6 Datasheet',
    css: `.hero-sheet{padding-top:8px}.hero-sheet .top2{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;border-bottom:4px solid var(--ink);padding-bottom:12px;flex-wrap:wrap}.hero-sheet .code{font:14px var(--font-m);color:var(--sub)}
.hero-sheet h1{font-family:var(--font-d);font-size:var(--display);line-height:1;font-weight:var(--w-d);letter-spacing:var(--track-d);margin-top:6px}.hero-sheet h1 span{font-weight:500;color:var(--sub)}.hero-sheet .loc{text-align:right}.hero-sheet .line{margin-top:18px;max-width:820px}`,
    render: (x) => `<section class="hero hero-sheet" aria-labelledby="h"><div class="top2"><div><p class="code">${x.esc(initials(x.C.person.name))}-01 · DATASHEET · REV ${x.rev}</p><h1 id="h">${x.esc(x.C.person.name)}<span> · ${x.esc(x.C.person.role)}</span></h1></div><p class="loc sub">${x.esc(x.C.person.location)}</p></div>
  <p class="line">${x.esc(x.C.person.line)}</p><p class="role sub">${x.esc(x.C.person.employment)}</p>${x.actions()}</section>`,
  },
  flap: {
    label: 'Split-flap board', from: 'R6 Departures',
    css: `.hero-flap .board{--fl-bg:#26282b;background:#0e0f10;color:#f1f1ee;border-radius:14px;padding:22px 32px 26px;box-shadow:0 20px 50px rgba(0,0,0,.35)}.hero-flap .board .sub{color:#b3b5b7}.hero-flap h1{font-family:var(--font-d);font-size:clamp(28px,4vw,44px);font-weight:700;letter-spacing:.02em;line-height:1.3}
.flaps{display:inline}.hero-flap .flap{display:inline-block;min-width:.72em;text-align:center;background:var(--fl-bg);margin:0 2px 4px 0;border-radius:3px;position:relative;line-height:1.35;animation:flip .5s cubic-bezier(.3,.1,.3,1) both}.flap::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:#0006}
@keyframes flip{0%{transform:rotateX(90deg);opacity:.2}60%{transform:rotateX(-12deg)}100%{transform:none;opacity:1}}.hero-flap .acc{color:#ffd23c}.hero-flap .line{margin-top:16px}`,
    render: (x) => `<section class="hero hero-flap" aria-labelledby="h"><div class="board"><p class="sub" style="font-size:14px;letter-spacing:.12em;text-transform:uppercase">${x.esc(x.C.person.role)} · ${x.esc(x.C.person.place)}</p>
  <h1 id="h">${flap(x.esc, x.C.person.display.toUpperCase(), 'acc')}</h1><p class="line">${x.esc(x.C.person.line)}</p><p class="role sub">${x.esc(x.C.person.employment)} ${x.esc(x.C.person.location)}</p>${x.actions()}</div></section>`,
  },
  gallery: {
    label: 'Gallery title', from: 'R6 Gallery wall',
    css: `.hero-gallery{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:64px;align-items:end;padding-top:32px}.hero-gallery h1{font-family:var(--font-d);font-size:var(--display);line-height:1;font-weight:var(--w-d);letter-spacing:var(--track-d)}@media (max-width:900px){.hero-gallery{grid-template-columns:minmax(0,1fr);gap:20px}}`,
    render: (x) => `<section class="hero hero-gallery" aria-labelledby="h"><h1 id="h">${x.esc(x.C.person.display)}</h1><div><p>${x.esc(x.C.person.line)}</p><p class="sub" style="margin-top:8px">${x.esc(x.C.person.employment)}</p><div class="actions" style="margin-top:16px"><a class="btn cta" href="${x.mailto}">Enquiries: ${x.esc(x.C.person.email)}</a></div></div></section>`,
  },
  swiss: {
    label: 'Swiss poster', from: 'R6 Swiss poster',
    css: `.hero-swiss{position:relative;display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:36px;padding-top:40px}.hero-swiss::before{content:"";position:absolute;left:calc(50% - 50vw);top:-120px;width:min(396px,40vw);height:14px;background:var(--accent);animation:slide .9s cubic-bezier(.23,1,.32,1) .3s both}@keyframes slide{from{transform:translateX(-100%)}}
.hero-swiss h1{font-family:var(--font-d);font-size:var(--display);line-height:.84;font-weight:var(--w-d);letter-spacing:var(--track-d);overflow-wrap:normal}.hero-swiss h1 em{font-style:normal;color:var(--accent)}.hero-swiss .right{padding-top:12px;font-size:18px}@media (max-width:900px){.hero-swiss{grid-template-columns:minmax(0,1fr)}}`,
    render: (x) => {
      const words = x.C.person.role.split(' '); const last = words.pop();
      return `<section class="hero hero-swiss" aria-labelledby="h"><h1 id="h">${x.esc(words.join(' '))} <em>${x.esc(last)}</em></h1><div class="right"><p>${x.esc(x.C.person.line)}</p><p class="sub" style="margin-top:8px">${x.esc(x.C.person.employment)}</p>${x.actions()}</div></section>`;
    },
  },
};

export const work = {
  stack: {
    label: 'Card stack', from: 'R5 Stack',
    css: `.wstack{margin-top:24px}.wstack a{position:sticky;top:calc(24px + var(--i) * 28px);display:block;min-height:280px;margin-top:20px;border-radius:36px;padding:34px 38px;text-decoration:none;box-shadow:0 -10px 40px rgba(60,20,0,.12)}
.wstack a:nth-child(4n+1){background:#ff6a45;color:#1a1614}.wstack a:nth-child(4n+2){background:#2f55ff;color:#fff}.wstack a:nth-child(4n+3){background:#ffd23f;color:#1a1614}.wstack a:nth-child(4n+4){background:#1f6b47;color:#fff}
.wstack .tag{background:#fff;color:#1a1614}.wstack h3{font-size:36px;line-height:1.05;font-weight:800;letter-spacing:-.02em;margin-top:18px}.wstack p.one{font-size:16px;line-height:1.45;margin-top:10px;max-width:470px}.wstack .num{font-size:56px;margin-top:16px;text-align:right}.wstack .k{font-size:14px;font-weight:600;text-align:right}
@media (max-width:720px){.wstack a{padding:22px;border-radius:24px}.wstack h3{font-size:28px}.wstack .num{font-size:36px}}`,
    render: (x) => `<div class="wstack">${x.C.projects.map((p, i) => `<a href="${link(x, p)}" style="--i:${i}">${x.tag(p.status)}<h3>${x.esc(p.short)}</h3><p class="one">${x.esc(p.oneLine)}</p><p class="num">${x.esc(p.key.value)}</p><p class="k">${x.esc(p.key.label)}</p></a>`).join('')}</div>`,
  },
  bento: {
    label: 'Glow bento', from: 'R5 Glow bento',
    css: `@property --a{syntax:'<angle>';inherits:false;initial-value:0deg}.wbento{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:24px}.wbento>*{min-width:0;padding:24px;border-radius:22px;text-decoration:none}
.wbento .k{font:13px var(--font-m);letter-spacing:.02em;color:var(--sub);text-transform:uppercase}.wbento h3{font-size:24px;font-weight:600;margin-top:14px}.wbento p.one{margin-top:8px;color:var(--sub)}.wbento .num{font-size:56px;font-weight:600;letter-spacing:-.04em;margin-top:24px}
.wbento .big{grid-column:span 2;padding:1px;background:conic-gradient(from var(--a),var(--accent),#8b7bff,var(--line) 40%,var(--line) 60%,var(--accent));animation:spin 6s linear infinite}.wbento .big>div{height:100%;border-radius:21px;background:var(--card);padding:24px}@keyframes spin{to{--a:360deg}}
.ping{position:relative;display:inline-block;width:10px;height:10px;border-radius:50%;background:var(--accent);margin-right:8px}.ping::after{content:"";position:absolute;inset:0;border-radius:50%;background:var(--accent);animation:ping 1.8s ease-out infinite}@keyframes ping{to{transform:scale(3);opacity:0}}
@media (max-width:1100px){.wbento{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:620px){.wbento{grid-template-columns:minmax(0,1fr)}.wbento .big{grid-column:auto}}`,
    render: (x) => {
      const [first, ...rest] = x.C.projects;
      const tile = (p) => `<a class="card" href="${link(x, p)}"><p class="k">${x.esc(x.C.statuses[p.status].label)}</p><h3>${x.esc(p.short)}</h3><p class="one">${x.esc(p.oneLine)}</p><p class="num">${x.esc(p.key.value)}</p><p class="sub" style="font-size:14px">${x.esc(p.key.label)}</p></a>`;
      return `<div class="wbento mo">${first ? `<a class="big" href="${link(x, first)}"><div><p class="k" style="color:var(--accent)">${first.status === 'live' ? '<span class="ping" aria-hidden="true"></span>' : ''}${x.esc(x.C.statuses[first.status].label)}</p><h3>${x.esc(first.short)}</h3><p class="one">${x.esc(first.oneLine)}</p><p class="k" style="margin-top:12px">${x.esc(facts(first).join(' · '))}</p></div></a>` : ''}${rest.map(tile).join('')}</div>`;
    },
  },
  orbit: {
    label: 'Orbit', from: 'R5 Orbit',
    css: `.worbit{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px);gap:32px;align-items:center;margin-top:24px}.sky{position:relative;aspect-ratio:1;max-width:640px;width:100%;margin:0 auto}
.ring{position:absolute;border-radius:50%;border:1.5px dashed color-mix(in srgb,var(--ink) 28%,transparent);animation:spin linear infinite}.pl{position:absolute;left:50%;top:50%;width:0;height:0}.chip{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:var(--card);box-shadow:0 6px 18px rgba(80,30,60,.14);font-size:14px;font-weight:700;animation:cspin linear infinite}
.chip i{width:10px;height:10px;border-radius:50%}@keyframes spin{to{transform:rotate(360deg)}}@keyframes cspin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(-360deg)}}
.core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:22%;aspect-ratio:1;border-radius:50%;background:var(--ink);color:var(--bg);display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-size:28px}
.olist li{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}.olist a{font-weight:700;text-decoration:none}@media (max-width:900px){.worbit{grid-template-columns:minmax(0,1fr)}.chip span{display:none}.chip{padding:0;width:16px;height:16px}}`,
    render: (x) => {
      const col = { live: 'var(--live)', ready: 'var(--ready)', repo: 'var(--ink)', daily: 'var(--ink)', experiment: 'var(--x)' };
      const rings = [['live'], ['ready', 'repo', 'daily'], ['experiment']].map((ks, r) => [...x.C.projects.filter((p) => ks.includes(p.status)).map((p) => [p.short, p.status]), ...(r === 2 ? x.C.experiments.map((e) => [e.name, 'experiment']) : [])]);
      const html = rings.map((items, r) => {
        const R = [20, 34, 47][r]; const dur = [70, 110, 160][r];
        return `<div class="ring" style="width:${2 * R}%;height:${2 * R}%;left:${50 - R}%;top:${50 - R}%;animation-duration:${dur}s">${items.map(([name, st], i) => { const a = (i / Math.max(1, items.length)) * 2 * Math.PI + r; return `<div class="pl" style="left:${50 + 50 * Math.cos(a)}%;top:${50 + 50 * Math.sin(a)}%"><div class="chip" style="animation-duration:${dur}s"><i style="background:${col[st]}"></i><span>${x.esc(name)}</span></div></div>`; }).join('')}</div>`;
      }).join('');
      return `<div class="worbit"><div class="sky mo" aria-hidden="true">${html}<div class="core">${x.esc(initials(x.C.person.name))}</div></div>
  <ul class="olist">${sortByLive(x.C.projects).map((p) => `<li>${x.tag(p.status)}<a href="${link(x, p)}">${x.esc(p.short)}</a></li>`).join('')}</ul></div><p style="margin-top:12px">${pause}</p>`;
    },
  },
  windows: {
    label: 'Windows', from: 'R5 abishek.os',
    css: `.wwin{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px;margin-top:24px}.wwin>*{min-width:0;text-decoration:none;animation:open .8s cubic-bezier(.2,.9,.25,1.1) both}.wwin>:nth-child(2){animation-delay:.1s}.wwin>:nth-child(3){animation-delay:.2s}.wwin>:nth-child(4){animation-delay:.3s}
@keyframes open{from{transform:scale(.9) translateY(30px);opacity:0}}.wwin .winbody{padding:20px 24px 24px}.wwin h3{font-size:20px}.wwin .minis{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:14px}.wwin .minis div{background:var(--bg);border-radius:12px;padding:10px 12px;min-width:0}.wwin .minis b{font-size:20px;display:block}.wwin .minis span{font-size:13px}
.win{border-radius:16px;overflow:hidden}.winbar{height:38px;display:flex;align-items:center;gap:8px;padding:0 14px;border-bottom:1px solid var(--line);font-size:14px;font-weight:600;color:var(--sub)}.winbar i{width:12px;height:12px;border-radius:50%}.winbar i:nth-child(1){background:#ff5f57}.winbar i:nth-child(2){background:#febc2e}.winbar i:nth-child(3){background:#28c840}.winbar span{margin-left:8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
@media (max-width:900px){.wwin{grid-template-columns:minmax(0,1fr)}}@media (max-width:420px){.wwin .minis{grid-template-columns:repeat(2,minmax(0,1fr))}}`,
    render: (x) => `<div class="wwin">${x.C.projects.map((p) => `<a class="card win" href="${link(x, p)}"><div class="winbar"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i><span>${x.esc(p.short)}</span></div><div class="winbody">${x.tag(p.status)}<p style="margin-top:10px">${x.esc(p.oneLine)}</p><div class="minis">${(p.numbers || [p.key]).slice(0, 3).map((n) => `<div><b>${x.esc(n.value)}</b><span class="sub">${x.esc(n.label)}</span></div>`).join('')}</div></div></a>`).join('')}</div>`,
  },
  cells: {
    label: 'Signal cells', from: 'R5 ASCII signal',
    css: `.wcells{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:24px}.wcells>*{min-width:0;border-top:2px solid var(--ink);padding:16px 18px 0 0;text-decoration:none;font-size:14px;line-height:1.55}.wcells b{display:block;margin-top:10px;font-size:16px}.wcells p{margin-top:4px}@media (max-width:1100px){.wcells{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:520px){.wcells{grid-template-columns:minmax(0,1fr)}}`,
    render: (x) => `<div class="wcells">${x.C.projects.map((p) => `<a href="${link(x, p)}">${x.tag(p.status)}<b>${x.esc(p.short)}</b><p>${x.esc(p.oneLine)}</p><p><b style="display:inline;margin:0">${x.esc(p.key.value)}</b> ${x.esc(p.key.label)}</p></a>`).join('')}</div>`,
  },
  reel: {
    label: 'Reel', from: 'R5 Reel',
    css: `.wreel{display:flex;gap:24px;overflow-x:auto;scroll-snap-type:x mandatory;margin-top:24px;padding-bottom:12px}.wreel:focus-visible{outline:2px solid var(--focus);outline-offset:4px}.wreel>a{flex:none;width:min(520px,80vw);scroll-snap-align:start;border-radius:28px;padding:34px;text-decoration:none}
.wreel .n{font-family:var(--font-d);font-weight:800;font-size:clamp(96px,12vw,160px);line-height:.8;color:transparent;-webkit-text-stroke:2px var(--accent)}.wreel .tag{margin-top:22px}.wreel h3{font-family:var(--font-d);font-size:32px;line-height:1.05;margin-top:14px}.wreel p.one{margin-top:12px;color:var(--sub)}.wreel li{padding:8px 0;border-top:1px solid var(--line)}.wreel ul{margin-top:14px}
@media (forced-colors: active){.wreel .n{color:CanvasText;-webkit-text-stroke:0}}`,
    render: (x) => `<div class="wreel" tabindex="0" role="region" aria-label="Work, scroll sideways">${sortByLive(x.C.projects).map((p, i) => `<a class="card" href="${link(x, p)}"><p class="n" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p>${x.tag(p.status)}<h3>${x.esc(p.short)}</h3><p class="one">${x.esc(p.oneLine)}</p><ul>${facts(p).map((f) => `<li>${x.esc(f)}</li>`).join('')}</ul></a>`).join('')}</div><p class="sub" style="font-size:14px;margin-top:8px">Scroll sideways; arrow keys work when the reel is focused.</p>`,
  },
  glass: {
    label: 'Glass cards', from: 'R5 Aurora glass',
    css: `.wglass{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-top:24px}.wglass>*{min-width:0;border-radius:24px;padding:22px 24px;text-decoration:none;animation:bob 6s ease-in-out infinite}.wglass>:nth-child(2){animation-delay:-1.5s}.wglass>:nth-child(3){animation-delay:-3s}.wglass>:nth-child(4){animation-delay:-4.5s}@keyframes bob{50%{transform:translateY(-8px)}}
.wglass h3{font-size:20px;font-weight:600;margin-top:10px}.wglass p{margin-top:6px}@media (max-width:1100px){.wglass{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:520px){.wglass{grid-template-columns:minmax(0,1fr)}}`,
    render: (x) => `<div class="wglass mo">${x.C.projects.map((p) => `<a class="card" href="${link(x, p)}">${x.tag(p.status)}<h3>${x.esc(p.short)}</h3><p class="sub">${x.esc(p.key.value)} ${x.esc(p.key.label)}</p></a>`).join('')}</div><p style="margin-top:12px">${pause}</p>`,
  },
  departures: {
    label: 'Departures board', from: 'R6 Departures',
    css: `.wdep{--fl-bg:#26282b;--fl-ink:#ffd23c;background:#0e0f10;color:#f1f1ee;border-radius:14px;padding:18px 32px 20px;margin-top:24px;box-shadow:0 20px 50px rgba(0,0,0,.35)}.wdep .sub{color:#b3b5b7}.wdep a{color:#f1f1ee}.wdep .hd,.wdep a{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,4fr) minmax(0,2fr);gap:24px;align-items:center}.wdep .hd{font-size:14px;letter-spacing:.12em;color:#b3b5b7;text-transform:uppercase;font-weight:600;padding-bottom:10px}
.wdep a{padding:14px 0;border-top:1px solid #2c2e31;text-decoration:none}.wdep .nm{font-family:var(--font-d);font-size:clamp(20px,2.4vw,30px);color:var(--fl-ink);text-transform:uppercase}.wdep .flap{display:inline-block;min-width:.72em;text-align:center;background:var(--fl-bg);margin:0 2px 4px 0;border-radius:3px;position:relative;line-height:1.35;animation:flip .5s cubic-bezier(.3,.1,.3,1) both}.flap::after{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:#0006}
@keyframes flip{0%{transform:rotateX(90deg);opacity:.2}60%{transform:rotateX(-12deg)}100%{transform:none;opacity:1}}@media (max-width:820px){.wdep{padding:14px 18px}.wdep .hd{display:none}.wdep a{grid-template-columns:minmax(0,1fr);gap:6px}}`,
    render: (x) => `<div class="wdep"><div class="hd" aria-hidden="true"><span>Work</span><span>Key value</span><span>Status</span></div>${sortByLive(x.C.projects).map((p) => `<a href="${link(x, p)}"><span class="nm">${flap(x.esc, p.short.toUpperCase())}</span><span class="sub">${x.esc(p.key.value)} ${x.esc(p.key.label)}</span><span>${x.tag(p.status)}</span></a>`).join('')}</div>`,
  },
  frames: {
    label: 'Framed placards', from: 'R6 Gallery wall',
    css: `.wframes{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:40px;margin-top:40px}.wframes>*{min-width:0;text-decoration:none}.wframes .fr{background:#fff;border:10px solid #2a2621;box-shadow:0 18px 30px rgba(40,30,20,.18);aspect-ratio:5/4;display:flex;flex-direction:column;justify-content:center;gap:6px;padding:18px;color:#1f1c18}
.wframes .fr b{font-size:28px;line-height:1.1}.wframes .fr span{font-size:14px}.wframes .fr:nth-child(1){}.wframes>:nth-child(4n+1) .fr{background:#e9f1ec}.wframes>:nth-child(4n+2) .fr{background:#eef0f7}.wframes>:nth-child(4n+3) .fr{background:#f6efe6}.wframes>:nth-child(4n+4) .fr{background:#f1eef6}
.wframes .label{margin-top:14px;font-size:14px;max-width:34ch}.wframes .label b{font-family:var(--font-d);font-size:21px;font-weight:600;display:block;line-height:1.15}.wframes .tag{margin-top:6px}@media (max-width:1100px){.wframes{grid-template-columns:repeat(2,minmax(0,1fr))}}@media (max-width:520px){.wframes{grid-template-columns:minmax(0,1fr)}}`,
    render: (x) => `<div class="wframes">${x.C.projects.map((p) => `<a href="${link(x, p)}"><div class="fr"><b>${x.esc(p.key.value)}</b><span>${x.esc(p.key.label)}</span></div><p class="label"><b>${x.esc(p.name)}</b>${x.esc(p.oneLine)}</p>${x.tag(p.status)}</a>`).join('')}</div>`,
  },
  stories: {
    label: 'Stories', from: 'R6 Stories',
    css: `.wstories{display:flex;gap:20px;overflow-x:auto;scroll-snap-type:x mandatory;margin-top:24px;padding-bottom:12px}.wstories:focus-visible{outline:2px solid var(--focus);outline-offset:4px}.wstories>a{flex:none;width:min(340px,78vw);aspect-ratio:9/16;max-height:640px;border-radius:22px;padding:22px;scroll-snap-align:start;text-decoration:none;display:flex;flex-direction:column;color:#fff}
.wstories>a:nth-child(4n+1){background:#2323c8}.wstories>a:nth-child(4n+2){background:#7a2a1c}.wstories>a:nth-child(4n+3){background:#0f5c46}.wstories>a:nth-child(4n+4){background:#3a3a3a}.segs{display:flex;gap:6px}.seg{flex:1;height:4px;border-radius:4px;background:rgba(255,255,255,.35);overflow:hidden}.seg i{display:block;height:100%;background:#fff;transform-origin:0 50%;animation:fill 6s linear both}@keyframes fill{from{transform:scaleX(0)}}
.wstories .who{display:flex;align-items:center;gap:10px;margin-top:14px;font-size:14px;font-weight:700}.wstories .av{width:34px;height:34px;border-radius:50%;background:#fff;color:#2323c8;display:flex;align-items:center;justify-content:center;font-weight:800}.wstories h3{font-size:28px;line-height:1.16;font-weight:800;margin-top:auto}.wstories p{margin-top:12px;opacity:.95}.wstories .tag{align-self:flex-start;margin-top:14px;background:#fff;color:#111}`,
    render: (x) => `<div class="wstories" tabindex="0" role="region" aria-label="Work stories, scroll sideways">${x.C.projects.map((p, i, all) => `<a href="${link(x, p)}"><div class="segs" aria-hidden="true">${all.map((_, j) => `<span class="seg"><i style="${j < i ? 'animation:none' : j > i ? 'transform:scaleX(0);animation:none' : ''}"></i></span>`).join('')}</div><p class="who"><span class="av" aria-hidden="true">${x.esc(initials(x.C.person.name))}</span>${x.esc(x.C.person.name)} · ${i + 1} of ${all.length}</p><h3>${x.esc(p.oneLine)}</h3><p>${x.esc(p.short)}: ${x.esc(p.key.value)} ${x.esc(p.key.label)}.</p>${x.tag(p.status)}</a>`).join('')}</div>`,
  },
  swissrows: {
    label: 'Swiss rows', from: 'R6 Swiss poster',
    css: `.wswiss{margin-top:24px}.wswiss a{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr) minmax(0,4fr);gap:24px;padding:12px 0;border-top:1.5px solid var(--ink);text-decoration:none;font-size:17px}.wswiss a:last-child{border-bottom:1.5px solid var(--ink)}.wswiss a:hover b{color:var(--accent)}@media (max-width:720px){.wswiss a{grid-template-columns:minmax(0,1fr);gap:4px}}`,
    render: (x) => `<div class="wswiss">${x.C.projects.map((p) => `<a href="${link(x, p)}"><b>${x.esc(p.short)}</b><span>${x.tag(p.status)}</span><span class="sub">${x.esc(p.key.value)} ${x.esc(p.key.label)}</span></a>`).join('')}</div>`,
  },
  sheet: {
    label: 'Datasheet table', from: 'R6 Datasheet',
    css: `.wsheet{margin-top:16px}.wsheet table{border-collapse:collapse;width:100%}.wsheet th{text-align:left;font-weight:700;border-bottom:1px solid var(--ink);padding:7px 10px 7px 0;font-size:14px;text-transform:uppercase;letter-spacing:.06em}.wsheet td{border-bottom:1px solid var(--line);padding:9px 12px 9px 0;vertical-align:top}.wsheet td.n{font:15px var(--font-m)}
@media (max-width:900px){.wsheet thead{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}.wsheet tr{display:block;padding:10px 0;border-bottom:1px solid var(--line)}.wsheet td{display:block;border:0;padding:2px 0}}`,
    render: (x) => `<div class="wsheet"><table><thead><tr><th scope="col">Feature</th><th scope="col">Spec</th><th scope="col">Status</th></tr></thead><tbody>${x.C.projects.map((p) => `<tr><td><a href="${link(x, p)}"><b>${x.esc(p.short)}</b></a><br><span class="sub">${x.esc(p.oneLine)}</span></td><td class="n">${x.esc(p.key.value)} <span class="sub">${x.esc(p.key.label)}</span></td><td>${x.tag(p.status)}</td></tr>`).join('')}</tbody></table></div>`,
  },
};

export const header = {
  dock: {
    label: 'Dock', from: 'R5 abishek.os',
    css: `.h-dock .nav{background:none;box-shadow:none;padding:0}@media (min-width:721px){.h-dock .nav{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:5;display:flex;gap:10px;padding:10px 12px;border-radius:22px;background:color-mix(in srgb,var(--card) 70%,transparent);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);box-shadow:0 0 0 1px var(--line),0 20px 40px rgba(20,20,60,.15)}
.h-dock .nav a,.h-dock .nav a[aria-current]{height:48px;padding:0 18px;border-radius:14px;background:var(--ink);color:var(--bg);box-shadow:none;text-decoration:none;font-weight:700;transition:transform .2s ease}.h-dock .nav a[aria-current]{box-shadow:0 0 0 2px var(--bg),0 0 0 4px var(--ink)}.h-dock .nav a:hover{transform:translateY(-4px) scale(1.06);color:var(--bg)}body.s-header-dock{padding-bottom:96px}}`,
    render: (x) => markup(x, 'dock'),
  },
};

export const frame = {
  split: {
    label: 'Split: intro left, work right', from: 'R5 Stack, Orbit, Reel',
    css: `@media (min-width:1100px){body.s-frame-split main{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);column-gap:64px;align-items:start}body.s-frame-split main>*{grid-column:1/-1}body.s-frame-split main>.hero{grid-column:1;grid-row:1;position:sticky;top:24px}body.s-frame-split main>#work{grid-column:2;grid-row:1;padding-top:24px}body.s-frame-split.s-hero-statement .hero h1{font-size:clamp(40px,4.4vw,76px)}}`,
  },
};
