// Every font any style uses, with the weights Google Fonts serves for it (asking for a missing weight fails the request).
// The customizer's font picker offers exactly this list.
export const FONTS = {
  Manrope: '400;500;600;700;800', Figtree: '400;500;600;700', 'Zen Kaku Gothic New': '400;500;700', 'IBM Plex Sans': '400;500;600;700',
  Jost: '400;500;600;700', Nunito: '400;600;700;800;900', 'Public Sans': '400;500;600;700', 'Big Shoulders Display': '700;800;900',
  Barlow: '400;500;600;700', Unbounded: '500;700', Karla: '400;500;700', 'Source Sans 3': '400;600;700',
  // rounds 5 and 6
  'Bricolage Grotesque': '400;600;800', Geist: '400;500;600;700', 'Geist Mono': '400;500', Anton: '400', 'Inter Tight': '400;500;700',
  'Plus Jakarta Sans': '400;500;600;700;800', 'DM Serif Display': '400', 'Space Grotesk': '500;700', 'JetBrains Mono': '400;700;800',
  Syne: '500;700;800', 'Work Sans': '400;500;600', 'Instrument Serif': '400', 'Instrument Sans': '400;500;600', 'IBM Plex Mono': '400;600',
  Archivo: '400;500;700;800', 'Barlow Condensed': '500;600;700', 'Cormorant Garamond': '500;600', Onest: '400;500;700;800', 'Schibsted Grotesk': '400;500;700;900',
};
export const SERIF = ['DM Serif Display', 'Instrument Serif', 'Cormorant Garamond'];
export const MONO = ['Geist Mono', 'JetBrains Mono', 'IBM Plex Mono'];
export const fontStack = (name) => `"${name}", ${['DM Serif Display', 'Instrument Serif', 'Cormorant Garamond'].includes(name) ? 'Georgia, serif' : /Mono/.test(name) ? 'ui-monospace, monospace' : 'system-ui, sans-serif'}`;
export function fontsQuery(names, mono = false) {
  const uniq = [...new Set(names)].filter((n) => FONTS[n]);
  const fam = uniq.map((n) => `family=${n.replace(/ /g, '+')}:wght@${FONTS[n]}`);
  if (mono && !uniq.includes('IBM Plex Mono')) fam.push('family=IBM+Plex+Mono:wght@400');
  return `${fam.join('&')}&display=swap`;
}
