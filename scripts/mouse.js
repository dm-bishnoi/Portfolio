// mouse.js — global mouse tracking → CSS vars + cursor

(function () {
  const root = document.documentElement;
  const cursor = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursor-ring');

  let mx = 0, my = 0;
  let ringX = 0, ringY = 0;
  let raf;

  // Throttle: update CSS vars at 60fps but cursor position at full speed
  function loop() {
    // Smooth ring lag
    ringX += (mx - ringX) * 0.12;
    ringY += (my - ringY) * 0.12;

    root.style.setProperty('--mx', (mx / window.innerWidth - 0.5).toFixed(3));
    root.style.setProperty('--my', (my / window.innerHeight - 0.5).toFixed(3));

    if (cursor && cursorRing) {
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top  = ringY + 'px';
    }
    raf = requestAnimationFrame(loop);
  }

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  // Cursor state changes
  document.querySelectorAll('[data-cursor="link"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursorRing) cursorRing.classList.add('expand');
    });
    el.addEventListener('mouseleave', () => {
      if (cursorRing) cursorRing.classList.remove('expand');
    });
  });

  document.querySelectorAll('[data-cursor="core"]').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (cursorRing) {
        cursorRing.classList.remove('expand');
        cursorRing.classList.add('core');
      }
    });
    el.addEventListener('mouseleave', () => {
      if (cursorRing) cursorRing.classList.remove('core');
    });
  });

  // Hide cursor when mouse leaves window
  document.addEventListener('mouseleave', () => {
    if (cursor) cursor.style.opacity = '0';
    if (cursorRing) cursorRing.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    if (cursor) cursor.style.opacity = '1';
    if (cursorRing) cursorRing.style.opacity = '1';
  });

  raf = requestAnimationFrame(loop);
})();
