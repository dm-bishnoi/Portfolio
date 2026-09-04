// particle-sphere.js — Three.js glowing particle sphere for the hero.
// Loaded as a module via the importmap in index.html.
// Pure THREE.Points (no shaders, no textures) so the payload is small.

import * as THREE from 'three';

const canvas = document.getElementById('particle-sphere');
const wrap = canvas?.parentElement;
if (!canvas || !wrap) {
  console.warn('[particle-sphere] canvas or wrapper not found, skipping');
} else {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COUNT = 3000;
  const RADIUS = 1.4;
  const PRIMARY = new THREE.Color('#A855F7');
  const ACCENT = new THREE.Color('#C084FC');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 4.2;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // Generate vertices on a sphere using the Fibonacci lattice (visually even).
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < COUNT; i++) {
    const y = 1 - (i / (COUNT - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = golden * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;
    positions[i * 3 + 0] = x * RADIUS;
    positions[i * 3 + 1] = y * RADIUS;
    positions[i * 3 + 2] = z * RADIUS;
    // Mix two violets so the sphere has depth, not flat color
    const t = (y + 1) / 2; // 0 at bottom, 1 at top
    const c = PRIMARY.clone().lerp(ACCENT, t);
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.025,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geom, mat);
  scene.add(points);

  // A second, sparser outer ring of points to give the sphere a "halo" feel.
  const haloCount = 700;
  const haloPositions = new Float32Array(haloCount * 3);
  for (let i = 0; i < haloCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = 2 * Math.PI * u;
    const phi = Math.acos(2 * v - 1);
    const r = RADIUS * (1.12 + Math.random() * 0.12);
    haloPositions[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
    haloPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    haloPositions[i * 3 + 2] = r * Math.cos(phi);
  }
  const haloGeom = new THREE.BufferGeometry();
  haloGeom.setAttribute('position', new THREE.BufferAttribute(haloPositions, 3));
  const haloMat = new THREE.PointsMaterial({
    size: 0.012,
    color: 0xC084FC,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Points(haloGeom, haloMat);
  scene.add(halo);

  // Mouse state — we lerp the rotation toward the target on every frame
  // so movement feels smooth and springs back when the cursor leaves.
  const target = { x: 0, y: 0 };
  const current = { x: 0, y: 0 };
  let pointerActive = false;

  function onPointerMove(e) {
    const rect = wrap.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width / 2);  // -1 .. 1
    const ny = (e.clientY - cy) / (rect.height / 2);
    target.x = THREE.MathUtils.clamp(nx, -1, 1) * 0.35;
    target.y = THREE.MathUtils.clamp(ny, -1, 1) * 0.25;
    pointerActive = true;
  }
  function onPointerLeave() { pointerActive = false; target.x = 0; target.y = 0; }
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  wrap.addEventListener('pointerleave', onPointerLeave);

  // Resize — keep the canvas filling its container.
  function resize() {
    const { width, height } = wrap.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(wrap);
  resize();

  // Pulse the points size for a subtle "alive" feel.
  let pulse = 0;

  function tick() {
    if (!reduceMotion) {
      // Auto-rotation — slow, on two axes
      points.rotation.y += 0.0012;
      points.rotation.x += 0.0006;
      halo.rotation.y -= 0.0008;
      halo.rotation.z += 0.0004;

      // Ease the cursor-driven offset toward the target
      current.x += (target.x - current.x) * 0.05;
      current.y += (target.y - current.y) * 0.05;
      points.rotation.y += current.x * 0.02;
      points.rotation.x += current.y * 0.02;
      halo.rotation.y += current.x * 0.015;

      pulse += 0.04;
      mat.size = 0.022 + Math.sin(pulse) * 0.006;
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();

  // If the canvas ever scrolls out of view, pause the loop to save battery.
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) tick();
  }, { threshold: 0 });
  io.observe(wrap);
}
