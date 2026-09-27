// Round 10: ten styles, each drawn for every page (Design-Research-Factory rounds/r10/gen10.py).
// Colours are the boards' own; layouts are rebuilt as fluid parts (themes/parts) instead of fixed 1440/390 boards.
import { SOFT_LIGHT, INK_DARK } from './r11.mjs';
const std = { 'live-bg': '#dff3e6', live: '#0f5c34', 'ready-bg': '#e2ebfb', ready: '#1c4a94', 'n-bg': '#eceef1', n: '#353b43', 'x-bg': '#fbefd6', x: '#74470a', focus: '#2f6fed', 'ok-bg': '#dff3e6', ok: '#0f5c34' };
const flat = (c) => ({ sh: 'none', 'sh-s': 'none', 'sh-in': `inset 0 0 0 1px ${c}` });
const noCard = '.card{background:none;box-shadow:none}';
const hairCard = '.card{background:none;box-shadow:none;border-radius:0;border-top:1px solid var(--line);padding-top:20px}.tile.card,.item.card{padding:20px 0 0}';
const plainNav = '.nav a[aria-current]{background:none;box-shadow:none}';
const S = (o) => o;

export default {
  'r10-soft': S({
    name: 'Soft', round: 'R10', note: 'Raised surfaces, soft shadows, no outlines.',
    fonts: { body: 'Figtree', display: 'Figtree' }, global: { display: 'clamp(40px, 5vw, 56px)', 'w-d': '700', 'track-d': '-.02em', radius: '10px' },
    modes: { light: { ...SOFT_LIGHT, ink: '#1b1f24', sub: '#4e5661', 'n-bg': '#e2e5ea' } },
    skin: '.num{font-weight:700;letter-spacing:-.02em}',
    defaults: { header: 'pillbar', hero: 'statement', work: 'tiles', frame: 'plain', blocks: 'cards', project: 'columns' },
  }),
  'r10-ink': S({
    name: 'Ink', round: 'R10', note: 'Black page, one voice, type does the work.',
    fonts: { body: 'Manrope', display: 'Manrope' }, global: { display: 'clamp(44px, 7vw, 88px)', 'w-d': '800', 'track-d': '-.03em', radius: '10px' },
    modes: { dark: { ...INK_DARK, ...flat('#3a3a3e'), card: '#1d1d1f' } },
    skin: `${hairCard}${plainNav}.nav a[aria-current]{text-decoration:underline}.nav a{color:var(--sub)}.ghost{background:#1d1d1f;box-shadow:none}.cta:hover{opacity:1;background:#fff}`,
    defaults: { header: 'bottom', hero: 'statement', work: 'rows', frame: 'plain', blocks: 'plain', project: 'columns' },
  }),
  'r10-ma': S({
    name: 'Ma', round: 'R10', note: 'Space first, small type, one narrow column.',
    fonts: { body: 'Zen Kaku Gothic New', display: 'Zen Kaku Gothic New' }, global: { display: '36px', 'w-d': '500', 'track-d': '0', radius: '6px' },
    modes: { light: { bg: '#f4f5f5', card: '#f4f5f5', ink: '#1e2222', sub: '#5a6060', line: '#dde0e0', ...flat('#dde0e0'), ...std, 'live-bg': 'transparent', live: '#0f6b3a', 'ready-bg': 'transparent', 'n-bg': 'transparent', n: '#474d4d', 'x-bg': 'transparent', x: '#7a4b00', accent: '#1e2222', 'accent-2': '#dde0e0' } },
    skin: `${noCard}${plainNav}.tag{padding:0}.nav a{font-size:14px;color:var(--sub)}.nav a[aria-current]{color:var(--ink)}
.cta{background:none;color:var(--ink);text-decoration:underline;padding:0 4px;font-weight:500}.ghost{background:none;box-shadow:none;color:var(--sub);text-decoration:underline;font-weight:400;padding:0 8px}
.num{font-weight:500}.section>h2{font-size:20px}.hero h1{line-height:1.4}.contact h2{font-size:28px;font-weight:500}`,
    defaults: { header: 'vertical', hero: 'quiet', work: 'list', frame: 'column', blocks: 'plain', project: 'stacked' },
  }),
  'r10-chart': S({
    name: 'Chart', round: 'R10', note: 'The numbers drawn honestly: unit and fraction charts.',
    fonts: { body: 'IBM Plex Sans', display: 'IBM Plex Sans' }, global: { display: 'clamp(40px, 5vw, 64px)', 'w-d': '500', 'track-d': '-.02em', radius: '10px' },
    modes: { light: { bg: '#fafbfc', card: '#ffffff', ink: '#15191e', sub: '#525a64', line: '#e3e7ec', sh: '0 1px 2px rgba(0,0,0,.05), 0 6px 20px rgba(0,0,0,.05)', 'sh-s': '0 1px 2px rgba(0,0,0,.06)', 'sh-in': 'inset 0 0 0 1px #e3e7ec', ...std, accent: '#2f63c0', 'accent-2': '#d5dbe3' } },
    skin: `${plainNav}.nav{background:none;box-shadow:none}.nav a[aria-current]{font-weight:600;color:var(--ink)}.ghost{background:#eceef1;box-shadow:none}.num{font-weight:500;letter-spacing:-.02em}`,
    defaults: { header: 'topleft', hero: 'number', work: 'charts', frame: 'plain', blocks: 'cards', project: 'columns' },
  }),
  'r10-geometric': S({
    name: 'Geometric', round: 'R10', note: 'Circle, square, triangle as the index.',
    fonts: { body: 'Jost', display: 'Jost' }, global: { display: 'clamp(44px, 6vw, 80px)', 'w-d': '700', 'track-d': '-.02em', radius: '6px' },
    modes: { light: { bg: '#ffffff', card: '#ffffff', ink: '#111111', sub: '#4d4d4d', line: '#e5e5e5', ...flat('#e5e5e5'), ...std, 'n-bg': '#efefef', n: '#333333', accent: '#e8591a', 'accent-2': '#e5e5e5' } },
    skin: `${noCard}${plainNav}.cta{background:#e8591a;color:#111}.cta:hover{opacity:1;background:#f06a2a}.ghost{background:#111;color:#fff;box-shadow:none}
.nav a[aria-current]{color:var(--ink);text-decoration:underline;text-decoration-thickness:3px;text-decoration-color:#e8591a}.num{font-weight:600;letter-spacing:-.02em}`,
    defaults: { header: 'topright', hero: 'statement', work: 'shapes', frame: 'plain', blocks: 'plain', project: 'columns' },
  }),
  'r10-candy': S({
    name: 'Candy', round: 'R10', note: 'Friendly, rounded, one pastel per project.',
    fonts: { body: 'Nunito', display: 'Nunito' }, global: { display: 'clamp(40px, 5vw, 64px)', 'w-d': '800', 'track-d': '-.02em', radius: '10px' },
    modes: { light: { bg: '#fff6fa', card: '#ffffff', ink: '#2a1633', sub: '#4a3552', line: '#f0d9e3', ...flat('#f0d9e3'), ...std, 'live-bg': '#ffffff', 'ready-bg': '#ffffff', 'n-bg': '#ffffff', n: '#3d2a45', 'x-bg': '#ffffff', accent: '#2a1633', 'accent-2': '#ffe3ec' } },
    skin: `${plainNav}.grid4>:nth-child(4n+1){background:#d9f5e3}.grid4>:nth-child(4n+2){background:#dfe8ff}.grid4>:nth-child(4n+3){background:#ffe3ec}.grid4>:nth-child(4n+4){background:#fff0c9}
.nav{background:none;box-shadow:none}.nav a{font-weight:700;color:var(--ink)}.nav a[aria-current]{background:var(--ink);color:#fff}.ghost{background:#ffe3ec;box-shadow:none}.num{font-weight:900;letter-spacing:-.02em}`,
    defaults: { header: 'pillbar', hero: 'statement', work: 'tiles', frame: 'plain', blocks: 'cards', project: 'columns' },
  }),
  'r10-product': S({
    name: 'Product', round: 'R10', note: 'A dark app screen, dense and exact.',
    fonts: { body: 'Public Sans', display: 'Public Sans' }, global: { display: '36px', 'w-d': '600', 'track-d': '-.01em', radius: '10px' },
    modes: { dark: { bg: '#111214', card: '#18191c', ink: '#e9eaec', sub: '#9ea3ab', line: '#26282c', sh: '0 0 0 1px #1f2023', 'sh-s': '0 0 0 1px #26282c', 'sh-in': '0 0 0 1px #26282c', 'live-bg': '#123a24', live: '#8fe0ae', 'ready-bg': '#15294a', ready: '#a9c4f5', 'n-bg': '#26282c', n: '#d4d6da', 'x-bg': '#3a2a0e', x: '#f2c879', focus: '#2f6fed', 'ok-bg': '#123a24', ok: '#8fe0ae', accent: '#a9c4f5', 'accent-2': '#26282c' } },
    skin: `${plainNav}.nav a{height:36px;padding:0 12px;border-radius:6px;font-size:14px;color:var(--sub)}.nav a[aria-current]{background:#26282c;color:var(--ink)}.ghost{background:#26282c;box-shadow:none}.num{font-weight:600;font-variant-numeric:tabular-nums}`,
    defaults: { header: 'tabs', hero: 'metrics', work: 'table', frame: 'app', blocks: 'cards', project: 'columns' },
  }),
  'r10-poster': S({
    name: 'Poster', round: 'R10', note: 'Condensed display type at wall scale.',
    fonts: { body: 'Barlow', display: 'Big Shoulders Display' }, global: { display: 'clamp(56px, 9vw, 96px)', 'w-d': '900', 'track-d': '.005em', radius: '6px' },
    modes: { light: { bg: '#d8dbd5', card: '#d8dbd5', ink: '#0e0f0d', sub: '#3c3f3a', line: '#0e0f0d', ...flat('#0e0f0d'), 'live-bg': '#0e0f0d', live: '#9ff0bd', 'ready-bg': '#0e0f0d', ready: '#bcd2fb', 'n-bg': '#0e0f0d', n: '#e6e8e2', 'x-bg': '#0e0f0d', x: '#f5d38c', focus: '#2f6fed', 'ok-bg': '#0e0f0d', ok: '#9ff0bd', accent: '#0e0f0d', 'accent-2': '#b9bdb6' } },
    skin: `.card{background:none;box-shadow:none;border-radius:0;border-top:3px solid var(--ink);padding-top:12px}.tile.card,.item.card{padding:12px 0 0}${plainNav}
.hero h1,.ptitle,.post h1,.contact h2,.nf .num,.num{font-family:var(--font-d);text-transform:uppercase}.num{font-weight:900;line-height:.9}
.cta{background:var(--ink);color:var(--bg)}.ghost{background:none;box-shadow:inset 0 0 0 2px var(--ink)}.nav{background:none;box-shadow:none}
.nav a{font-weight:600;text-transform:uppercase;letter-spacing:.06em;color:var(--ink)}.nav a[aria-current]{text-decoration:underline;text-decoration-thickness:3px}`,
    defaults: { header: 'topleft', hero: 'poster', work: 'poster', frame: 'plain', blocks: 'plain', project: 'columns' },
  }),
  'r10-hollow': S({
    name: 'Hollow', round: 'R10', note: 'Outlined display type, filled where it matters.',
    fonts: { body: 'Karla', display: 'Unbounded' }, global: { display: 'clamp(40px, 6vw, 72px)', 'w-d': '700', 'track-d': '-.02em', radius: '10px' },
    modes: { light: { bg: '#ececeb', card: '#ececeb', ink: '#121212', sub: '#474747', line: '#c9c9c6', ...flat('#c9c9c6'), ...std, 'n-bg': '#dcdcd9', n: '#2e2e2e', accent: '#121212', 'accent-2': '#c9c9c6' } },
    skin: `${hairCard}${plainNav}.hero h1{color:transparent;-webkit-text-stroke:1.5px var(--ink)}@media (forced-colors: active){.hero h1{color:CanvasText;-webkit-text-stroke:0}}
.ptitle,.post h1,.contact h2,.num{font-family:var(--font-d);letter-spacing:-.02em}.ghost{background:#dcdcd9;box-shadow:none}.nav{background:none;box-shadow:none}.nav a{color:var(--ink)}.nav a[aria-current]{text-decoration:underline}`,
    defaults: { header: 'topright', hero: 'statement', work: 'rows', frame: 'plain', blocks: 'plain', project: 'columns' },
  }),
  'r10-issue': S({
    name: 'Issue', round: 'R10', note: 'The site reads like a letter in your inbox.',
    fonts: { body: 'Source Sans 3', display: 'Source Sans 3' }, global: { display: '36px', 'w-d': '700', 'track-d': '-.01em', radius: '10px' },
    modes: { light: { bg: '#e4e7eb', card: '#ffffff', ink: '#1d2126', sub: '#545b64', line: '#e0e3e7', sh: '0 1px 2px rgba(0,0,0,.06), 0 10px 30px rgba(0,0,0,.06)', 'sh-s': '0 1px 2px rgba(0,0,0,.08)', 'sh-in': 'inset 0 0 0 1px #e0e3e7', ...std, accent: '#1c4a94', 'accent-2': '#e0e3e7' } },
    skin: `${plainNav}.ghost{background:#eceef1;box-shadow:none}.num{font-weight:700}`,
    defaults: { header: 'none', hero: 'letter', work: 'letter', frame: 'sheet', blocks: 'plain', project: 'stacked' },
  }),
};
