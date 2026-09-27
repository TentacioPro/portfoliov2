// Every font any style uses, with the weights Google Fonts serves for it (asking for a missing weight fails the request).
// The customizer's font picker offers exactly this list.
export const FONTS = {
  Manrope: '400;500;600;700;800', Figtree: '400;500;600;700', 'Zen Kaku Gothic New': '400;500;700', 'IBM Plex Sans': '400;500;600;700',
  Jost: '400;500;600;700', Nunito: '400;600;700;800;900', 'Public Sans': '400;500;600;700', 'Big Shoulders Display': '700;800;900',
  Barlow: '400;500;600;700', Unbounded: '500;700', Karla: '400;500;700', 'Source Sans 3': '400;600;700',
};
export const fontStack = (name) => `"${name}", system-ui, sans-serif`;
export function fontsQuery(names, mono = false) {
  const uniq = [...new Set(names)].filter((n) => FONTS[n]);
  const fam = uniq.map((n) => `family=${n.replace(/ /g, '+')}:wght@${FONTS[n]}`);
  if (mono) fam.push('family=IBM+Plex+Mono:wght@400');
  return `${fam.join('&')}&display=swap`;
}
