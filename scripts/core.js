// core.js — hero core readout ticking + label

(function () {
  const phi = document.getElementById('core-phi');
  const tau = document.getElementById('core-tau');
  const grad = document.getElementById('core-grad');
  if (!phi) return;

  let t = 0;
  setInterval(() => {
    t += 0.05;
    const p = (0.214 + Math.sin(t) * 0.06).toFixed(3);
    const g = Math.round(40 + Math.sin(t * 0.7) * 12);
    const secs = (18.4 + (t * 0.05) % 6).toFixed(1);
    phi.textContent = p;
    grad.textContent = g + '%';
    tau.textContent = secs + 's';
  }, 600);
})();
