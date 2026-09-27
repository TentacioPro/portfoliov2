// Round 5: eight animated home pages (Design-Research-Factory rounds/r5/source/gen.py), as styles with their own parts.
// Serif fonts (Orbit, Aurora) are kept as drawn; the customizer's font control swaps them for any sans in one step.
const std = { 'live-bg': '#dff3e6', live: '#0f5c34', 'ready-bg': '#e2ebfb', ready: '#1c4a94', 'n-bg': '#eceef1', n: '#353b43', 'x-bg': '#fbefd6', x: '#74470a', focus: '#2f6fed', 'ok-bg': '#dff3e6', ok: '#0f5c34' };
const darkTags = { 'live-bg': '#123a24', live: '#8fe0ae', 'ready-bg': '#15294a', ready: '#a9c4f5', 'n-bg': '#26262e', n: '#d6d6dc', 'x-bg': '#3a2a0e', x: '#f2c879', focus: '#2f6fed', 'ok-bg': '#123a24', ok: '#8fe0ae' };
const flat = (c) => ({ sh: 'none', 'sh-s': 'none', 'sh-in': `inset 0 0 0 1px ${c}` });
const plainNav = '.nav{background:none;box-shadow:none}.nav a[aria-current]{background:none;box-shadow:none;text-decoration:underline;color:var(--ink)}';
const pillBtn = '.btn{border-radius:999px}';

export default {
  'r5-stack': {
    name: 'Stack', round: 'R5', note: 'Warm gradient, one coloured card per project, stacking as you scroll.',
    fonts: { body: 'Bricolage Grotesque', display: 'Bricolage Grotesque' }, global: { display: 'clamp(44px, 6vw, 76px)', 'w-d': '800', 'track-d': '-.035em', radius: '10px' },
    modes: { light: { bg: '#ffeadb', card: '#fff8f1', ink: '#1a1614', sub: '#5e4133', line: '#f0cdb6', ...flat('#f0cdb6'), ...std, accent: '#ff6a45', 'accent-2': '#f0cdb6' } },
    skin: `body{background:linear-gradient(180deg,#fff5ea 0%,#ffe2cf 100%) fixed}${plainNav}${pillBtn}.nav a{color:var(--ink)}.ghost{background:#fff;box-shadow:none}.cta{background:var(--ink);color:#fff5ea}`,
    defaults: { header: 'topleft', hero: 'statement', work: 'stack', frame: 'split', blocks: 'cards', project: 'columns' },
  },
  'r5-glow': {
    name: 'Glow bento', round: 'R5', note: 'Near-black bento, a lime glow round the live tile.',
    fonts: { body: 'Geist', display: 'Geist', mono: 'Geist Mono' }, global: { display: 'clamp(36px, 4.5vw, 52px)', 'w-d': '600', 'track-d': '-.035em', radius: '10px' },
    modes: { dark: { bg: '#07070a', card: '#111116', ink: '#ededf0', sub: '#a3a3b0', line: '#23232c', sh: '0 0 0 1px #23232c', 'sh-s': '0 0 0 1px #33333d', 'sh-in': '0 0 0 1px #33333d', ...darkTags, accent: '#c6ff3d', 'accent-2': '#23232c' } },
    skin: `${plainNav}.card{border-radius:22px}.cta{background:var(--accent);color:#07070a;border-radius:12px}.ghost{background:none;box-shadow:0 0 0 1px #33333d;border-radius:12px}.nav a{color:var(--sub)}.section>h2{font-weight:600}`,
    defaults: { header: 'topleft', hero: 'quiet', work: 'bento', frame: 'plain', blocks: 'cards', project: 'columns' },
  },
  'r5-kinetic': {
    name: 'Kinetic type', round: 'R5', note: 'Three marquee rows of condensed type, words lighting up in turn.',
    fonts: { body: 'Inter Tight', display: 'Anton' }, global: { display: 'clamp(48px, 8vw, 120px)', 'w-d': '400', 'track-d': '0', radius: '6px' },
    modes: { light: { bg: '#efebe2', card: '#f7f4ee', ink: '#111111', sub: '#4d4a44', line: '#d6d0c3', ...flat('#d6d0c3'), ...std, accent: '#e04400', 'accent-2': '#d6d0c3' } },
    skin: `${plainNav}.card{box-shadow:none;background:none;border-top:2px solid var(--ink);border-radius:0}.tile.card,.item.card{padding:16px 0 0}.ptitle,.post h1,.contact h2,.nf .num{text-transform:uppercase;font-weight:400}.ghost{background:none;box-shadow:inset 0 0 0 2px var(--ink)}.nav a{color:var(--ink)}`,
    defaults: { header: 'topleft', hero: 'kinetic', work: 'rows', frame: 'plain', blocks: 'plain', project: 'columns' },
  },
  'r5-os': {
    name: 'abishek.os', round: 'R5', note: 'A pastel desktop: glass windows, a dock.',
    fonts: { body: 'Plus Jakarta Sans', display: 'Plus Jakarta Sans' }, global: { display: 'clamp(32px, 4vw, 44px)', 'w-d': '800', 'track-d': '-.03em', radius: '10px' },
    modes: { light: { bg: '#eef0ff', card: '#fbfbff', ink: '#1b1b2f', sub: '#45455f', line: '#dcdef0', sh: 'inset 0 1px 0 rgba(255,255,255,.9), 0 0 0 1px rgba(30,30,70,.08), 0 24px 60px rgba(40,40,110,.14)', 'sh-s': '0 0 0 1px rgba(30,30,70,.1)', 'sh-in': 'inset 0 0 0 1px rgba(30,30,70,.12)', ...std, accent: '#5e8dff', 'accent-2': '#dcdef0' } },
    skin: `body{background:radial-gradient(60% 70% at 15% 20%,#c9c3ff 0%,transparent 60%),radial-gradient(50% 60% at 85% 25%,#a8e0ff 0%,transparent 60%),radial-gradient(60% 60% at 60% 95%,#ffd9c2 0%,transparent 60%),#eef0ff fixed}
.card{background:rgba(255,255,255,.78);backdrop-filter:blur(22px) saturate(160%);-webkit-backdrop-filter:blur(22px) saturate(160%);border-radius:16px}.ghost{background:rgba(255,255,255,.8)}`,
    defaults: { header: 'dock', hero: 'window', work: 'windows', frame: 'plain', blocks: 'cards', project: 'columns' },
  },
  'r5-orbit': {
    name: 'Orbit', round: 'R5', note: 'Work arranged in rings by how live it is. Serif display.',
    fonts: { body: 'Manrope', display: 'DM Serif Display' }, global: { display: 'clamp(40px, 5vw, 66px)', 'w-d': '400', 'track-d': '-.01em', radius: '10px' },
    modes: { light: { bg: '#fde3db', card: '#fffaf6', ink: '#2b1d2e', sub: '#56465a', line: '#e9bfc9', sh: '0 6px 18px rgba(80,30,60,.12)', 'sh-s': '0 4px 12px rgba(80,30,60,.1)', 'sh-in': 'inset 0 0 0 1px #e9bfc9', ...std, live: '#146b3b', ready: '#2f47b8', x: '#8a2f63', 'x-bg': '#fbe3ef', accent: '#2b1d2e', 'accent-2': '#e9bfc9' } },
    skin: `body{background:radial-gradient(circle at 72% 40%,#fff7ef 0%,#ffe0cc 34%,#fcc8d8 70%,#e9c6f0 100%) fixed}${plainNav}${pillBtn}.nav a{color:var(--ink)}.cta{background:var(--ink);color:#fff7ef}.num{font-family:var(--font);font-weight:800}`,
    defaults: { header: 'topleft', hero: 'statement', work: 'orbit', frame: 'split', blocks: 'cards', project: 'columns' },
  },
  'r5-ascii': {
    name: 'ASCII signal', round: 'R5', note: 'Yellow field, a flowing ASCII waveform, monospace everything.',
    fonts: { body: 'JetBrains Mono', display: 'Space Grotesk' }, global: { display: 'clamp(36px, 4.5vw, 62px)', 'w-d': '700', 'track-d': '-.03em', radius: '6px' },
    modes: { light: { bg: '#f2ee4f', card: '#f2ee4f', ink: '#111111', sub: '#2e2d10', line: '#111111', ...flat('#111111'), 'live-bg': '#111111', live: '#f2ee4f', 'ready-bg': 'transparent', ready: '#111111', 'n-bg': 'transparent', n: '#111111', 'x-bg': 'transparent', x: '#111111', focus: '#2f6fed', 'ok-bg': '#111111', ok: '#f2ee4f', accent: '#111111', 'accent-2': '#c9c53f' } },
    skin: `${plainNav}.tag{border-radius:0;box-shadow:inset 0 0 0 2px #111;font-weight:800;text-transform:uppercase}.tag::before{display:none}.card{background:none;box-shadow:none;border-top:2px solid var(--ink);border-radius:0}.tile.card,.item.card{padding:16px 0 0}
.btn{border-radius:0}.cta{background:#111;color:#f2ee4f}.ghost{background:none;box-shadow:inset 0 0 0 2px #111}.nav a{color:var(--ink);text-transform:uppercase}`,
    defaults: { header: 'topleft', hero: 'ascii', work: 'cells', frame: 'plain', blocks: 'plain', project: 'columns' },
  },
  'r5-reel': {
    name: 'Reel', round: 'R5', note: 'Deep green, big outlined numbers, a sideways reel of work.',
    fonts: { body: 'Work Sans', display: 'Syne' }, global: { display: 'clamp(36px, 4vw, 54px)', 'w-d': '800', 'track-d': '-.02em', radius: '10px' },
    modes: { dark: { bg: '#0f2a1f', card: '#163a2b', ink: '#f3ead3', sub: '#d6ceb7', line: '#2f5a48', sh: 'none', 'sh-s': '0 0 0 1px #2f5a48', 'sh-in': '0 0 0 1px #2f5a48', 'live-bg': 'transparent', live: '#8fe3a8', 'ready-bg': 'transparent', ready: '#ffc58a', 'n-bg': 'transparent', n: '#f3ead3', 'x-bg': 'transparent', x: '#f2c879', focus: '#2f6fed', 'ok-bg': '#163a2b', ok: '#8fe3a8', accent: '#ff9a3c', 'accent-2': '#2a5040' } },
    skin: `${plainNav}${pillBtn}.tag{box-shadow:inset 0 0 0 1.5px currentColor;text-transform:uppercase;letter-spacing:.05em}.card{border-radius:28px}.cta{background:var(--accent);color:#0f2a1f}.ghost{background:none;box-shadow:inset 0 0 0 1.5px var(--ink)}.nav a{color:var(--sub)}`,
    defaults: { header: 'topleft', hero: 'quiet', work: 'reel', frame: 'split', blocks: 'cards', project: 'columns' },
  },
  'r5-aurora': {
    name: 'Aurora glass', round: 'R5', note: 'Drifting colour behind frosted glass. Serif display.',
    fonts: { body: 'Instrument Sans', display: 'Instrument Serif' }, global: { display: 'clamp(48px, 7vw, 104px)', 'w-d': '400', 'track-d': '-.02em', radius: '10px' },
    modes: { light: { bg: '#fbfbfd', card: '#ffffff', ink: '#14121f', sub: '#3b3850', line: '#e4e2ee', sh: 'inset 0 1px 0 rgba(255,255,255,.95), 0 0 0 1px rgba(20,18,31,.08), 0 20px 50px rgba(60,40,120,.12)', 'sh-s': '0 0 0 1px rgba(20,18,31,.1)', 'sh-in': 'inset 0 0 0 1px rgba(20,18,31,.12)', ...std, accent: '#14121f', 'accent-2': '#e4e2ee' } },
    skin: `body::before{content:"";position:fixed;inset:-20%;z-index:-1;pointer-events:none;background:radial-gradient(28% 32% at 12% 12%,#7ee8fa,transparent 70%),radial-gradient(30% 34% at 88% 8%,#ff9ad5,transparent 70%),radial-gradient(32% 36% at 45% 70%,#b8a6ff,transparent 70%),radial-gradient(26% 30% at 85% 75%,#ffd29a,transparent 70%);filter:blur(40px);opacity:.7;animation:drift 18s ease-in-out infinite alternate}
@keyframes drift{50%{transform:translate(4%,-3%) scale(1.08)}100%{transform:translate(-3%,4%) scale(.96)}}body{background:var(--bg)}.card{background:rgba(255,255,255,.62);backdrop-filter:blur(18px) saturate(170%);-webkit-backdrop-filter:blur(18px) saturate(170%);border-radius:24px}
${plainNav}${pillBtn}.nav a{color:var(--ink)}.cta{background:var(--ink);color:#fff}.num{font-family:var(--font);font-weight:600}.section>h2,.contact h2{font-family:var(--font-d);font-weight:400;font-size:36px}`,
    defaults: { header: 'pillbar', hero: 'aurora', work: 'glass', frame: 'plain', blocks: 'cards', project: 'columns' },
  },
};
