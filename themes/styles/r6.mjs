// Round 6: six object-led home pages (Design-Research-Factory rounds/r6, v2 boards after fixes).
// Gallery keeps its serif display as drawn; the font control swaps it in one step.
const std = { 'live-bg': '#dff3e6', live: '#0f5c34', 'ready-bg': '#e2ebfb', ready: '#1c4a94', 'n-bg': '#eceef1', n: '#353b43', 'x-bg': '#fbefd6', x: '#74470a', focus: '#2f6fed', 'ok-bg': '#dff3e6', ok: '#0f5c34' };
const flat = (c) => ({ sh: 'none', 'sh-s': 'none', 'sh-in': `inset 0 0 0 1px ${c}` });
const plainNav = '.nav{background:none;box-shadow:none}.nav a[aria-current]{background:none;box-shadow:none;text-decoration:underline;color:var(--ink)}';

export default {
  'r6-manpage': {
    name: 'abishek(1)', round: 'R6', note: 'A Unix manual page: monospace, amber links, a blinking cursor.',
    fonts: { body: 'IBM Plex Mono', display: 'IBM Plex Mono', mono: 'IBM Plex Mono' }, global: { display: '28px', 'w-d': '600', 'track-d': '0', radius: '6px' },
    modes: { dark: { bg: '#161412', card: '#1d1a17', ink: '#e6e0d2', sub: '#b0a998', line: '#3a352e', sh: 'none', 'sh-s': '0 0 0 1px #4a453d', 'sh-in': '0 0 0 1px #4a453d', 'live-bg': 'transparent', live: '#8fe0a0', 'ready-bg': 'transparent', ready: '#9cc3ff', 'n-bg': 'transparent', n: '#e6e0d2', 'x-bg': 'transparent', x: '#c8c1b0', focus: '#2f6fed', 'ok-bg': '#1d1a17', ok: '#8fe0a0', accent: '#f2b84b', 'accent-2': '#3a352e' } },
    skin: `a{color:#f2b84b}a:hover{color:#fff}${plainNav}.nav a{color:var(--ink)}.tag{padding:0;font-weight:600}.tag::before{display:none}.card{background:none;box-shadow:none;border-radius:0}.tile.card,.item.card{padding:12px 0 0;border-top:1px solid var(--line)}
.btn{border-radius:0}.cta{background:#f2b84b;color:#161412}.cta:hover{background:#ffd27a;opacity:1}.ghost{background:none;box-shadow:0 0 0 1px #4a453d;color:var(--ink)}.num{font-weight:600}.section>h2,.contact h2{font-size:16px;font-weight:600;text-transform:uppercase;letter-spacing:0}::selection{background:#f2b84b;color:#161412}`,
    defaults: { header: 'topleft', hero: 'manpage', work: 'list', frame: 'plain', blocks: 'plain', project: 'stacked' },
  },
  'r6-datasheet': {
    name: 'Datasheet', round: 'R6', note: 'A component datasheet: thick rules, tables, blue links.',
    fonts: { body: 'Archivo', display: 'Archivo', mono: 'IBM Plex Mono' }, global: { display: 'clamp(36px, 4vw, 54px)', 'w-d': '800', 'track-d': '-.01em', radius: '6px' },
    modes: { light: { bg: '#fbfbf7', card: '#ffffff', ink: '#141414', sub: '#55554f', line: '#cfcfc6', ...flat('#cfcfc6'), ...std, accent: '#0a47b8', 'accent-2': '#cfcfc6' } },
    skin: `a{color:#0a47b8}${plainNav}.nav a{color:var(--ink)}.card{background:none;box-shadow:none;border-radius:0}.section>h2{font-size:16px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;border-bottom:2px solid var(--ink);padding-bottom:6px}
.btn{border-radius:2px}.cta{background:#0a47b8;color:#fff}.cta:hover{background:#08378f;opacity:1}.ghost{background:none;box-shadow:inset 0 0 0 1.5px var(--ink);color:var(--ink)}.num{font-family:var(--font-m);font-weight:500}`,
    defaults: { header: 'topleft', hero: 'datasheet', work: 'sheet', frame: 'plain', blocks: 'plain', project: 'columns' },
  },
  'r6-departures': {
    name: 'Departures board', round: 'R6', note: 'An airport split-flap board of what is running.',
    fonts: { body: 'Barlow', display: 'Barlow Condensed' }, global: { display: 'clamp(36px, 5vw, 56px)', 'w-d': '700', 'track-d': '.02em', radius: '6px' },
    modes: { dark: { bg: '#1c1d1f', card: '#0e0f10', ink: '#f1f1ee', sub: '#b3b5b7', line: '#2c2e31', sh: 'none', 'sh-s': '0 0 0 1px #3a3c40', 'sh-in': '0 0 0 1px #3a3c40', 'live-bg': 'transparent', live: '#7ee2a0', 'ready-bg': 'transparent', ready: '#9cc3ff', 'n-bg': '#26282b', n: '#e6e6e2', 'x-bg': 'transparent', x: '#e8d9a8', focus: '#2f6fed', 'ok-bg': '#26282b', ok: '#7ee2a0', accent: '#ffd23c', 'accent-2': '#2c2e31' } },
    skin: `${plainNav}.nav a{color:var(--ink);text-transform:uppercase;letter-spacing:.08em}.tag{text-transform:uppercase;letter-spacing:.08em}.card{box-shadow:none}.cta{background:#ffd23c;color:#141414}.cta:hover{background:#ffe07a;opacity:1}.ghost{background:#26282b;box-shadow:none}.ptitle,.post h1,.contact h2{text-transform:uppercase}`,
    defaults: { header: 'topleft', hero: 'flap', work: 'departures', frame: 'plain', blocks: 'cards', project: 'columns' },
  },
  'r6-gallery': {
    name: 'Gallery wall', round: 'R6', note: 'Works hung plainly in frames, a placard under each. Serif display.',
    fonts: { body: 'Karla', display: 'Cormorant Garamond' }, global: { display: 'clamp(40px, 5vw, 64px)', 'w-d': '500', 'track-d': '0', radius: '6px' },
    modes: { light: { bg: '#f6f6f3', card: '#ffffff', ink: '#1f1c18', sub: '#5e574c', line: '#d8d4cc', ...flat('#d8d4cc'), ...std, accent: '#1f1c18', 'accent-2': '#d8d4cc' } },
    skin: `${plainNav}.nav a{color:var(--ink)}.card{box-shadow:none;border:1px solid var(--line)}.btn{border-radius:0}.cta{background:var(--ink);color:#f6f6f3}.ghost{background:none;box-shadow:inset 0 0 0 1.5px var(--ink)}.section>h2,.contact h2{font-family:var(--font-d);font-weight:500;font-size:36px}.num{font-family:var(--font);font-weight:700}`,
    defaults: { header: 'topleft', hero: 'gallery', work: 'frames', frame: 'plain', blocks: 'plain', project: 'columns' },
  },
  'r6-stories': {
    name: 'Stories', round: 'R6', note: 'Each project as a phone story: bold colour, progress bars.',
    fonts: { body: 'Onest', display: 'Onest' }, global: { display: 'clamp(32px, 4vw, 48px)', 'w-d': '800', 'track-d': '-.02em', radius: '10px' },
    modes: { dark: { bg: '#131313', card: '#1e1e1e', ink: '#ffffff', sub: '#c9c9c9', line: '#333333', sh: 'none', 'sh-s': '0 0 0 1px #3a3a3a', 'sh-in': '0 0 0 1px #3a3a3a', 'live-bg': '#123a24', live: '#8fe0ae', 'ready-bg': '#1c2a55', ready: '#b8ccff', 'n-bg': '#2a2a2a', n: '#e6e6e6', 'x-bg': '#3a2a0e', x: '#f2c879', focus: '#2f6fed', 'ok-bg': '#123a24', ok: '#8fe0ae', accent: '#8f8fff', 'accent-2': '#333333' } },
    skin: `${plainNav}.nav a{color:var(--sub)}.card{border-radius:22px}.cta{background:#fff;color:#1a1aa6;border-radius:14px;font-weight:800}.ghost{background:#262626;box-shadow:none;border-radius:14px}`,
    defaults: { header: 'topleft', hero: 'statement', work: 'stories', frame: 'plain', blocks: 'cards', project: 'columns' },
  },
  'r6-swiss': {
    name: 'Swiss poster', round: 'R6', note: 'A 12-column grid, one red bar, type at poster scale.',
    fonts: { body: 'Schibsted Grotesk', display: 'Schibsted Grotesk' }, global: { display: 'clamp(64px, 10vw, 150px)', 'w-d': '900', 'track-d': '-.04em', radius: '6px' },
    modes: { light: { bg: '#f5f5f2', card: '#f5f5f2', ink: '#161513', sub: '#5a5750', line: '#161513', ...flat('#161513'), ...std, accent: '#c80900', 'accent-2': '#d8d6cf' } },
    skin: `body{background-image:repeating-linear-gradient(90deg,rgba(22,21,19,.08) 0 1px,transparent 1px calc(100% / 12));background-attachment:fixed}${plainNav}.nav a{color:var(--ink);font-weight:700}.card{background:none;box-shadow:none;border-radius:0;border-top:1.5px solid var(--ink)}.tile.card,.item.card{padding:12px 0 0}
.btn{border-radius:0}.cta{background:var(--ink);color:#f5f5f2}.cta:hover{background:#c80900;opacity:1}.ghost{background:none;box-shadow:inset 0 0 0 2px var(--ink)}.section>h2{font-weight:900;letter-spacing:-.02em}`,
    defaults: { header: 'topleft', hero: 'swiss', work: 'swissrows', frame: 'plain', blocks: 'plain', project: 'columns' },
  },
};
