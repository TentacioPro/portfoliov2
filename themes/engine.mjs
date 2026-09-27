// Theme engine: content/theme.json -> the chosen style, a part per slot, the modes, and one generated stylesheet.
// theme.json: { style, modes: "both"|"light"|"dark", slots: {header, hero, work, frame, blocks, project},
//   tokens: {all: {...}, light: {...}, dark: {...}}, font: {body, display}, home: {sections: [...], hidden: [...]}, css }
// Any slot can take any part, whichever style it came from: that is the mix-and-match.
import fs from 'node:fs';
import STYLES from './styles/index.mjs';
import header from './parts/header.mjs';
import hero from './parts/hero.mjs';
import work from './parts/work.mjs';
import { frame, blocks, project } from './parts/layout.mjs';
import { vizCss } from './parts/viz.mjs';
import * as M from './parts/motion.mjs';
import { FONTS, fontStack, fontsQuery } from './fonts.mjs';

export const PARTS = {
  header: { ...header, ...M.header }, hero: { ...hero, ...M.hero }, work: { ...work, ...M.work },
  frame: { ...frame, ...M.frame }, blocks, project,
};
export const SECTIONS = ['hero', 'work', 'experiments', 'alsoReal', 'path', 'education', 'contact'];
export const DEFAULT_STYLE = 'r11-soft-ink';
export { STYLES, FONTS };

const BASE = fs.readFileSync(new URL('./base.css', import.meta.url), 'utf8');
const decl = (o) => Object.entries(o).map(([k, v]) => `--${k}: ${v};`).join(' ');

export function resolve(theme = {}) {
  const errors = [];
  const styleId = STYLES[theme.style] ? theme.style : DEFAULT_STYLE;
  if (theme.style && !STYLES[theme.style]) errors.push(`unknown style "${theme.style}", using ${DEFAULT_STYLE}`);
  const st = STYLES[styleId];
  const slots = {};
  for (const [slot, variants] of Object.entries(PARTS)) {
    const want = theme.slots?.[slot] || st.defaults[slot];
    if (!variants[want]) errors.push(`unknown ${slot} part "${want}"`);
    slots[slot] = variants[want] ? want : Object.keys(variants)[0];
  }
  const have = Object.keys(st.modes);
  let modes = have;
  if (theme.modes === 'light' || theme.modes === 'dark') modes = have.includes(theme.modes) ? [theme.modes] : have;
  const font = { body: st.fonts.body, display: st.fonts.display, mono: st.fonts.mono || 'IBM Plex Mono', ...(theme.font || {}) };
  for (const k of ['body', 'display', 'mono']) if (!FONTS[font[k]]) { errors.push(`unknown font "${font[k]}"`); font[k] = st.fonts[k] || 'IBM Plex Mono'; }
  const global = { wrap: '1296px', font: fontStack(font.body), 'font-d': fontStack(font.display), 'font-m': fontStack(font.mono), ...st.global, ...(theme.tokens?.all || {}) };
  const tok = (m) => ({ ...st.modes[m], ...(theme.tokens?.[m] || {}) });
  let tokens;
  if (modes.length === 2) {
    const dark = `${decl(tok('dark'))} color-scheme: dark;`;
    tokens = `:root { ${decl(global)} ${decl(tok('light'))} color-scheme: light; }\n:root[data-theme="dark"] { ${dark} }\n@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${dark} } }`;
  } else {
    tokens = `:root { ${decl(global)} ${decl(tok(modes[0]))} color-scheme: ${modes[0]}; }`;
  }
  const partCss = Object.entries(slots).map(([slot, v]) => PARTS[slot][v].css).filter(Boolean).join('\n');
  const motion = theme.motion === false
    ? '*,*::before,*::after{animation:none!important}.pause{display:none}'
    : '@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation:none!important}.pause{display:none}}:root[data-motion="off"] .mo,:root[data-motion="off"] .mo *,:root[data-motion="off"] body::before{animation-play-state:paused!important}';
  const css = `${tokens}\n\n${BASE}\n/* parts */\n${vizCss}\n${partCss}\n/* style: ${st.name} */\n${st.skin}\n/* motion */\n${motion}\n${theme.css || ''}\n`;
  const sections = (theme.home?.sections || SECTIONS).filter((s) => SECTIONS.includes(s));
  for (const s of SECTIONS) if (!sections.includes(s)) sections.push(s);
  const hidden = new Set(theme.home?.hidden || []);
  return {
    styleId, style: st, slots, modes, css, errors,
    fonts: (mono) => fontsQuery([font.body, font.display, ...(st.fonts.mono || theme.font?.mono ? [font.mono] : [])], mono),
    themeColor: Object.fromEntries(modes.map((m) => [m, tok(m).bg])),
    bodyClass: Object.entries(slots).map(([k, v]) => `s-${k}-${v}`).join(' '),
    sections: sections.filter((s) => !hidden.has(s)),
  };
}

export function catalog() {
  return {
    styles: Object.fromEntries(Object.entries(STYLES).map(([id, s]) => [id, { name: s.name, round: s.round, note: s.note, modes: Object.keys(s.modes), fonts: s.fonts, defaults: s.defaults }])),
    parts: Object.fromEntries(Object.entries(PARTS).map(([slot, vs]) => [slot, Object.fromEntries(Object.entries(vs).map(([id, v]) => [id, { label: v.label, from: v.from }]))])),
    fonts: Object.keys(FONTS), sections: SECTIONS,
  };
}
