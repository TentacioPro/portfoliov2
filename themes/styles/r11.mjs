// Round 11 (the live site): Soft + Ink. Light = Soft (raised surfaces, soft shadows), dark = Ink (black page, hairlines).
export const SOFT_LIGHT = {
  bg: '#e8ebef', card: '#eef1f4', ink: '#16191d', sub: '#4c545e', line: '#d3d8df',
  sh: '6px 6px 16px #cfd4db, -6px -6px 16px #fbfcfd', 'sh-s': '4px 4px 10px #cfd4db, -4px -4px 10px #fbfcfd',
  'sh-in': 'inset 3px 3px 7px #cfd4db, inset -3px -3px 7px #fbfcfd',
  'live-bg': '#d9f0e1', live: '#0f5c34', 'ready-bg': '#dce6f7', ready: '#1c4a94', 'n-bg': '#e0e3e8', n: '#353b43', 'x-bg': '#f6ead2', x: '#6e4406',
  focus: '#2f6fed', 'ok-bg': '#d9f0e1', ok: '#0f5c34', accent: '#2f63c0', 'accent-2': '#cfd6e0',
};
export const INK_DARK = {
  bg: '#0b0b0c', card: '#141416', ink: '#f2f2f0', sub: '#a3a39e', line: '#2a2a2d',
  sh: '0 0 0 1px #242427', 'sh-s': '0 0 0 1px #2c2c2f', 'sh-in': '0 0 0 1px #3a3a3e',
  'live-bg': '#123a24', live: '#8fe0ae', 'ready-bg': '#15294a', ready: '#a9c4f5', 'n-bg': '#232325', n: '#d6d6d2', 'x-bg': '#3a2a0e', x: '#f2c879',
  focus: '#2f6fed', 'ok-bg': '#123a24', ok: '#8fe0ae', accent: '#a9c4f5', 'accent-2': '#2c2c2f',
};
export default {
  'r11-soft-ink': {
    name: 'Soft + Ink', round: 'R11', note: 'The live design. Light is Soft, dark is Ink; one layout, a theme switch.',
    fonts: { body: 'Manrope', display: 'Manrope' },
    global: { display: 'clamp(40px, 6vw, 72px)', 'w-d': '800', 'track-d': '-.035em', radius: '10px' },
    modes: { light: SOFT_LIGHT, dark: INK_DARK },
    skin: '',
    defaults: { header: 'pillbar', hero: 'statement', work: 'tiles', frame: 'plain', blocks: 'cards', project: 'columns' },
  },
};
