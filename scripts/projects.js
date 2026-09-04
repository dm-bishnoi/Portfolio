// projects.js — per-project hover behaviors

(function () {
  // Stack visual lift is CSS-only. Nothing more needed here for prototype.
  // Reserved for scroll-triggered entrance animation tuning.

  const items = document.querySelectorAll('.project-item');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.05 });

    items.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.7s cubic-bezier(0.2,0.7,0.2,1), transform 0.7s cubic-bezier(0.2,0.7,0.2,1)';
      io.observe(item);
    });
  }
})();
