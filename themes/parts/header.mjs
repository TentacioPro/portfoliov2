// Header variants. Same markup (so the theme switch and skip link behave the same); layout comes from CSS.
// From: pillbar (R10 Soft, R11), topleft (Chart, Poster), topright (Geometric, Hollow), tabs (Product),
// bottom (Ink: a fixed bar at the foot of the screen on wider screens), vertical (Ma: a left rail on wide screens), none (Issue).
export const markup = (x, cls, withNav = true) => `<header class="top h-${cls}">
  <a class="name" href="${x.B}">${x.esc(x.C.person.name)}</a>
  ${withNav ? `<nav class="nav card" aria-label="Site">${x.nav.map(([t, h, k]) => `<a href="${h}"${k === x.current ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>` : ''}
  <div class="aside"><span class="social">${x.C.person.links.map((l) => `<a href="${l.href}">${x.esc(l.label)}</a>`).join('')}</span>${x.toggle ? `
  <button class="theme" type="button" data-theme-toggle aria-label="Switch colour mode"><i aria-hidden="true"></i><span>Dark</span></button>` : ''}</div>
</header>`;
const bare = '.h-X .nav{background:none;box-shadow:none;padding:0}';
export default {
  pillbar: { label: 'Pill bar', from: 'R11 Soft + Ink, R10 Soft, Candy', css: '', render: (x) => markup(x, 'pillbar') },
  topleft: { label: 'Top left', from: 'R10 Chart, Poster', css: `${bare.replace('X', 'topleft')}.h-topleft{justify-content:flex-start;gap:40px}.h-topleft .aside{margin-left:auto}`, render: (x) => markup(x, 'topleft') },
  topright: { label: 'Top right', from: 'R10 Geometric, Hollow', css: `${bare.replace('X', 'topright')}.h-topright{justify-content:flex-end;gap:32px}.h-topright .aside{order:-1;margin-right:auto}`, render: (x) => markup(x, 'topright') },
  tabs: { label: 'Tabs', from: 'R10 Product', css: `${bare.replace('X', 'tabs')}.h-tabs{padding:14px 0;border-bottom:1px solid var(--line);margin-bottom:24px}.h-tabs .nav a{height:36px;padding:0 12px;border-radius:6px;font-size:14px}`, render: (x) => markup(x, 'tabs') },
  bottom: {
    label: 'Bottom bar', from: 'R10 Ink',
    css: `${bare.replace('X', 'bottom')}@media (min-width: 721px){.h-bottom{position:fixed;left:0;right:0;bottom:0;z-index:5;background:var(--bg);border-top:1px solid var(--line);padding:14px max(24px, calc((100vw - var(--wrap)) / 2 + 72px))}body.s-header-bottom{padding-bottom:80px}.s-header-bottom main{padding-top:48px}}`,
    render: (x) => markup(x, 'bottom'),
  },
  vertical: {
    label: 'Left rail', from: 'R10 Ma',
    css: `${bare.replace('X', 'vertical')}@media (min-width: 1100px){body.s-header-vertical .wrap{padding-left:280px}.h-vertical{position:fixed;top:0;bottom:0;left:max(24px, calc((100vw - var(--wrap)) / 2 + 40px));width:200px;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:28px;padding:56px 0}
.h-vertical .nav{flex-direction:column;align-items:flex-start;gap:0}.h-vertical .nav a{height:36px;padding:0}.h-vertical .aside{flex-direction:column;align-items:flex-start;margin-top:auto;gap:12px}.h-vertical .social{flex-direction:column;gap:6px}}`,
    render: (x) => markup(x, 'vertical'),
  },
  none: { label: 'No menu (name only)', from: 'R10 Issue', css: '', render: (x) => markup(x, 'none', false) },
};
