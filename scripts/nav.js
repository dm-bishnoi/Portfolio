// nav.js — magnetic hover on nav links + CTA, mobile menu

(function () {
  // ---- magnetic hover ----
  document.querySelectorAll('.nav-link, .nav-cta, .footer-top-btn').forEach(link => {
    link.addEventListener('mousemove', (e) => {
      const rect = link.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      link.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
    });
    link.addEventListener('mouseleave', () => {
      link.style.transform = '';
    });
  });

  // also apply magnetic to .btn globally
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.10}px, ${y * 0.10}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  // ---- mobile menu ----
  const menuBtn = document.getElementById('nav-menu-btn');
  const overlay = document.getElementById('nav-overlay');
  if (menuBtn && overlay) {
    const open = () => overlay.classList.add('open');
    const close = () => overlay.classList.remove('open');
    menuBtn.addEventListener('click', () => {
      overlay.classList.contains('open') ? close() : open();
    });
    overlay.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  }
})();
