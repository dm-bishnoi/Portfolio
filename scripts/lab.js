// lab.js — lab tile hover + particle canvas + typography scrub

(function () {
  const grid = document.getElementById('lab-grid');
  if (grid) {
    grid.addEventListener('mouseover', (e) => {
      const tile = e.target.closest('.lab-tile');
      if (tile) {
        grid.classList.add('has-hover');
        grid.querySelectorAll('.lab-tile').forEach(t => {
          if (t !== tile) t.style.opacity = '0.35';
          else t.style.opacity = '1';
        });
      }
    });
    grid.addEventListener('mouseleave', () => {
      grid.classList.remove('has-hover');
      grid.querySelectorAll('.lab-tile').forEach(t => {
        t.style.opacity = '';
      });
    });
  }

  // ---- typography scrub ----
  const slider = document.querySelector('#lab input[type="range"]');
  const typoEl = document.getElementById('lab-typo');
  if (slider && typoEl) {
    const words = ['drift', 'shift', 'bloom', 'fade', 'quiet', 'glow', 'pulse', 'rise', 'fall', 'loop'];
    slider.addEventListener('input', () => {
      const idx = Math.floor((slider.value / 100) * (words.length - 1));
      typoEl.textContent = words[idx];
    });
  }

  // ---- particle canvas in lab tile 4 ----
  const particleCanvas = document.getElementById('lab-particles');
  if (particleCanvas) {
    const w = particleCanvas.offsetWidth || 300;
    const h = particleCanvas.offsetHeight || 150;

    // Simple CSS particles as fallback (canvas avoided for simplicity)
    for (let i = 0; i < 20; i++) {
      const dot = document.createElement('div');
      const size = Math.random() * 3 + 1;
      dot.style.cssText = `
        position: absolute;
        width: ${size}px; height: ${size}px;
        background: ${Math.random() > 0.5 ? '#7C5CFF' : '#5CC8FF'};
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        opacity: ${Math.random() * 0.5 + 0.2};
        animation: lab-particle ${5 + Math.random() * 8}s ease-in-out infinite;
        animation-delay: ${Math.random() * 5}s;
      `;
      particleCanvas.appendChild(dot);
    }

    // inject keyframes once
    if (!document.getElementById('lab-particle-style')) {
      const style = document.createElement('style');
      style.id = 'lab-particle-style';
      style.textContent = `
        @keyframes lab-particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50%       { transform: translateY(-40px) scale(1.3); opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
  }
})();
