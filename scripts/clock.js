// clock.js — footer clock + nav coordinate readout

(function () {
  const clockEl = document.getElementById('footer-clock');
  const coordsEl = document.getElementById('nav-coords');

  function pad(n) { return n.toString().padStart(2, '0'); }

  function tick() {
    const now = new Date();
    const hh = pad(now.getHours());
    const mm = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    if (clockEl) clockEl.textContent = `LOCAL · ${hh}:${mm}:${ss}`;

    if (coordsEl) {
      // Show local time in nav too
      coordsEl.textContent = `LOCAL · ${hh}:${mm}:${ss}`;
    }
  }

  tick();
  setInterval(tick, 1000);
})();
