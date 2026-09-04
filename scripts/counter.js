// counter.js — stats counter animation on enter

(function () {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) {
    counters.forEach(c => c.textContent = c.dataset.target);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const duration = 900;
      const start = performance.now();

      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        // ease-out
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target;
      }
      requestAnimationFrame(step);
      io.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach(c => io.observe(c));
})();
