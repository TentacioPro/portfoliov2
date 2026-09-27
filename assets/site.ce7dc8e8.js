// The only script on the site: the theme switch and the copy-email button. Pages work without it.
(() => {
  const root = document.documentElement;
  const dark = () => root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
  const label = () => {
    for (const b of document.querySelectorAll('[data-theme-toggle]')) {
      const next = dark() ? 'Light' : 'Dark';
      b.querySelector('span').textContent = next;
      b.setAttribute('aria-label', `Switch to ${next.toLowerCase()} mode`);
    }
  };
  label();
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('[data-theme-toggle]');
    if (t) {
      root.dataset.theme = dark() ? 'light' : 'dark';
      try { localStorage.setItem('theme', root.dataset.theme); } catch { /* private mode: still switches */ }
      label();
      return;
    }
    const c = e.target.closest('[data-copy]');
    if (c) {
      try {
        await navigator.clipboard.writeText(c.dataset.copy);
        const idle = c.textContent;
        c.dataset.state = 'copied';
        c.textContent = 'Copied';
        setTimeout(() => { c.dataset.state = ''; c.textContent = idle; }, 2000);
      } catch {
        c.textContent = c.dataset.copy; // clipboard blocked: show the address so it can be selected
      }
    }
  });
})();
