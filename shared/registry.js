// shared/registry.js — theme registry
//
// One source of truth for which themes exist, how to label them, and where
// each theme's page lives. Adding a fourth theme later = one entry here,
// one HTML page, optionally a renderer.
//
// A theme does NOT duplicate portfolio content. The shared content lives in
// data/portfolio.json and is consumed per-theme at the page level (each
// theme's HTML is free to inline or fetch — this registry just declares the
// id, label, and target path).
//
// The registry is exposed as a global `PortfolioThemes` so it works without
// a module system and so the shared switcher can pick it up regardless of
// which page loaded first.

(function (root) {
  'use strict';

  const THEMES = [
    {
      id: 'v3-dark',
      label: 'V3 Dark',
      description: 'Dark, scroll-driven 3D',
      path: '/index.html',          // root
      isDefault: true,
      visual: 'topology-3d'         // the heavy three-scene.js lives here
    },
    {
      id: 'v3-mono',
      label: 'V3 Mono',
      description: 'White, editorial',
      path: '/v3/index.html',
      isDefault: false,
      visual: 'none'                // no 3D
    },
    {
      id: 'v2',
      label: 'V2',
      description: 'Particle sphere',
      path: '/v2/index.html',
      isDefault: false,
      visual: 'particle-sphere'
    }
  ];

  const BY_ID = Object.freeze(
    THEMES.reduce((acc, t) => { acc[t.id] = t; return acc; }, {})
  );

  function list() {
    return THEMES.slice();
  }

  function get(id) {
    return BY_ID[id] || null;
  }

  function defaultId() {
    const def = THEMES.find(t => t.isDefault);
    return def ? def.id : THEMES[0].id;
  }

  // Resolve which theme the current page represents by matching the path
  // of the current document against registered theme paths.
  function currentId() {
    const here = root.location.pathname.replace(/\\/g, '/');
    // Pick the registered theme whose absolute path best matches the current URL.
    let best = null;
    for (const t of THEMES) {
      if (here === t.path || here.endsWith('/' + t.path)) {
        if (!best || t.path.length > best.path.length) best = t;
      }
    }
    return best ? best.id : defaultId();
  }

  function targetFor(id) {
    const t = get(id);
    if (!t) return null;
    // If we're already on this page, return the same path so refresh
    // honors a deep link without bouncing.
    const p = t.path;
    // Ensure absolute URL so relative resolution works from any page.
    if (p.startsWith('/')) {
      return root.location.origin + p;
    }
    return p;
  }

  root.PortfolioThemes = {
    list,
    get,
    defaultId,
    currentId,
    targetFor
  };
})(window);
