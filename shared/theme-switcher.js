// shared/theme-switcher.js — single uniform 3-pill theme switcher.
//
// Loaded by every theme page. Reads which theme is "current" from
// PortfolioThemes.currentId(), then renders a compact 3-pill nav in
// #theme-switcher (or, if not present, in a fixed corner).
//
// Persistence: localStorage key "portfolio.theme" (semantic, replaces the
// old "portfolio.version" key). On load:
//   1. If the URL carries ?theme=<id> or #theme=<id>, that wins (deep link).
//   2. Else if localStorage has a stored id, that wins.
//   3. Else the theme's default.
// After that, the stored value is canonical.
// On click, we update the URL hash (so deep links survive a refresh) and
// navigate to the registered path.

(function () {
  'use strict';
  if (window.__themeSwitcherInit) return;
  window.__themeSwitcherInit = true;

  const STORAGE_KEY = 'portfolio.theme';
  const LEGACY_KEY  = 'portfolio.version'; // read once, then write the new key

  // ---- persistence ----
  function readStored() {
    try {
      return localStorage.getItem(STORAGE_KEY) ||
             localStorage.getItem(LEGACY_KEY) || null; // legacy migration
    } catch (_) { return null; }
  }
  function writeStored(id) {
    try {
      localStorage.setItem(STORAGE_KEY, id);
      // clean legacy so it never overrides again
      try { localStorage.removeItem(LEGACY_KEY); } catch (_) {}
    } catch (_) {}
  }

  // ---- deep link ----
  function readDeepLink() {
    // #theme=foo or ?theme=foo
    const h = (location.hash || '').match(/theme=([\w-]+)/);
    if (h) return h[1];
    const q = (location.search || '').match(/[?&]theme=([\w-]+)/);
    if (q) return q[1];
    return null;
  }
  function writeDeepLink(id) {
    // history.replaceState so we don't spam browser history
    try {
      const url = new URL(location.href);
      url.searchParams.set('theme', id);
      url.hash = '';
      history.replaceState(null, '', url.toString());
    } catch (_) {}
  }

  // ---- resolve current theme ----
  function resolveCurrentId() {
    if (!window.PortfolioThemes) return null;
    const deep = readDeepLink();
    if (deep && window.PortfolioThemes.get(deep)) {
      writeStored(deep);
      return deep;
    }
    const stored = readStored();
    if (stored && window.PortfolioThemes.get(stored)) return stored;
    return window.PortfolioThemes.currentId() || window.PortfolioThemes.defaultId();
  }

  // ---- render ----
  function render(activeId) {
    const list = window.PortfolioThemes.list();
    const switcher = document.getElementById('theme-switcher');
    const host = switcher || document.body;
    if (switcher) switcher.innerHTML = '';

    const nav = document.createElement('nav');
    nav.className = 'theme-switcher';
    nav.setAttribute('aria-label', 'Portfolio theme');
    nav.setAttribute('role', 'navigation');

    list.forEach(t => {
      const a = document.createElement('a');
      a.className = 'theme-pill' + (t.id === activeId ? ' is-active' : '');
      // Resolve to absolute URL so it works from any sub-directory.
      a.href = location.origin + '/' + t.path.replace(/^\//, '');
      a.setAttribute('data-theme', t.id);
      a.setAttribute('role', 'button');
      a.setAttribute('aria-label', `Switch to ${t.label}`);
      if (t.id === activeId) {
        a.setAttribute('aria-current', 'true');
      }
      a.innerHTML =
        `<span class="theme-pill-label">${t.label}</span>` +
        `<span class="theme-pill-desc">${t.description}</span>`;
      a.addEventListener('click', () => {
        writeStored(t.id);
        writeDeepLink(t.id);
        // default browser navigation handles the rest
      });
      nav.appendChild(a);
    });

    host.appendChild(nav);
  }

  // ---- boot ----
  function boot() {
    if (!window.PortfolioThemes) {
      // Registry failed to load; bail silently.
      return;
    }
    const currentId = resolveCurrentId();
    // If the stored/deep-linked theme differs from the page we're on,
    // bounce to the right page (only if we're not already on it).
    const hereId = window.PortfolioThemes.currentId();
    if (currentId !== hereId) {
      const target = window.PortfolioThemes.targetFor(currentId);
      if (target) {
        // Avoid an infinite bounce: only redirect once per page load.
        if (!sessionStorage.getItem('__themeRedirected')) {
          sessionStorage.setItem('__themeRedirected', '1');
          window.location.replace(target);
          return;
        }
      }
    }
    // canonicalize stored key
    writeStored(currentId);
    render(currentId);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
