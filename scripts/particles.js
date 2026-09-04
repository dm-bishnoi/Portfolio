// particles.js — background particle field

(function () {
  const container = document.getElementById('bg-particles');
  if (!container) return;

  // Deterministic-ish seeded random
  let seed = 42;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const COUNT = 50;
  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'bg-particle';
    const size = rand() * 2 + 1;
    const x = rand() * 100;
    const duration = 30 + rand() * 60;
    const delay = -rand() * duration;
    const dx = (rand() - 0.5) * 80;
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${x}%;
      bottom: -10px;
      animation-duration: ${duration}s;
      animation-delay: ${delay}s;
      --dx: ${dx}px;
    `;
    container.appendChild(p);
  }
})();
