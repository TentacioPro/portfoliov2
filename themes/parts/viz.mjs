// Honest small charts drawn from a project's key value: "N of M" -> a fraction bar; a count -> one dot per unit
// (capped at 200); "~N months" -> one dot per week. Anything else draws nothing. Numbers stay in the text next to it.
export const vizCss = '.bar{height:12px;border-radius:6px;background:var(--accent-2);overflow:hidden}.bar i{display:block;height:100%;background:var(--accent)}.dots{display:flex;flex-wrap:wrap;gap:3px;max-width:240px}.dots i{width:8px;height:8px;border-radius:2px;background:var(--accent)}.dots.one i{width:24px;height:24px;border-radius:6px}';
export function chart(p, esc) {
  const v = String(p.key.value).trim(); const label = esc(`${v} ${p.key.label}`); let m;
  if ((m = v.match(/^([\d,]+) of ([\d,]+)$/))) {
    const a = +m[1].replace(/,/g, ''); const b = +m[2].replace(/,/g, '');
    return b > 0 ? `<div class="bar" role="img" aria-label="${label}"><i style="width:${Math.min(100, (a / b) * 100).toFixed(1)}%"></i></div>` : '';
  }
  const dots = (n) => `<div class="dots${n === 1 ? ' one' : ''}" role="img" aria-label="${label}">${'<i></i>'.repeat(n)}</div>`;
  if ((m = v.match(/^~?\s*(\d+)\s*months?$/i))) return dots(Math.min(200, +m[1] * 4));
  if ((m = v.match(/^(\d+)$/))) return +m[1] > 0 ? dots(Math.min(200, +m[1])) : '';
  return '';
}
