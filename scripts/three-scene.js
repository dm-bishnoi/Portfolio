// three-scene.js — ORGANIC WIREFRAME BLOB
// Persistent scroll-driven 3D layer with a premium organic purple blob
// that morphs through 6 conceptual stages as the user scrolls.
//
// Architecture:
//   SCROLL owns: world/core position, scale, base rotation, camera Z/FOV,
//                master scene alpha, blob deformation/color/glow parameters.
//   MOUSE  owns: additive parallax, additive tilt, hover intensity, blob deformation bias.
//   IDLE   owns: slow spin, noise-based surface breathing, particle drift.
// Material opacity: base × stage × master × interaction (no compounding).
// Hover uses window-level pointer + NDC-projected final core position.
// Reduced motion renders a calm, section-appropriate pose.

(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 0. Init guard + feature detection
  // ------------------------------------------------------------------
  if (window.__sceneInit) return;
  window.__sceneInit = true;

  const canvas = document.getElementById('core-canvas');
  const stage  = document.getElementById('scene-stage');
  const host    = document.getElementById('core');
  if (!canvas || !stage) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let webglOk = false;
  try {
    const probe = document.createElement('canvas').getContext('webgl2') ||
                  document.createElement('canvas').getContext('webgl');
    webglOk = !!probe;
  } catch (e) {
    webglOk = false;
  }
  if (!webglOk) {
    if (host) host.classList.add('core-static');
    return;
  }

  function loadThree() {
    return new Promise((resolve) => {
      if (window.THREE) return resolve(window.THREE);
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/three@0.160.0/build/three.min.js';
      s.async = false;
      s.onload  = () => resolve(window.THREE || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
  }

  loadThree().then((THREE) => {
    if (!THREE) { if (host) host.classList.add('core-static'); return; }
    init(THREE);
  }).catch(() => {
    if (host) host.classList.add('core-static');
  });

  // ------------------------------------------------------------------
  // 1. Stage table — conceptual 3D state targets across the journey
  // ------------------------------------------------------------------
  const STAGES_META = {
    HERO:       { domId: 'hero' },
    ABOUT:      { domId: 'about' },
    ECOSYSTEM:  { domId: 'skills' },
    PROJECTS:   { domId: 'projects' },
    RADARDRAFT: { domId: 'casestudy' },
    REMAINING:  { domId: 'experience' },
  };
  const STAGE_ORDER = ['HERO', 'ABOUT', 'ECOSYSTEM', 'PROJECTS', 'RADARDRAFT', 'REMAINING'];
  const END_KEY = 'END';

  // Extended stage table: scroll/position/rotation + BLOB visual parameters.
  //   deform:     noise displacement amplitude (0=pristine sphere, 1=highly deformed)
  //   morphFreq:  noise frequency multiplier (higher = more complex surface)
  //   morphSpeed: noise animation speed multiplier
  //   colorTone:  0=full purple, 0.5=balanced purple/magenta, 1=full magenta
  //   wireOp:     wireframe opacity (0=hidden, 1=fully visible)
  //   glowInt:    emissive/glow intensity multiplier
  //   rimPow:     rim lighting exponent (higher = sharper rim)
  //   wireColor:  wireframe color tint: 0=violet, 0.5=purple, 1=magenta
  const STAGES = [
    { name:'HERO',       t:0.00,
      root:{x:0, y:0, z:0, scale:1.00},
      core:{x:0.55, y:0.20, z:0.00, scale:1.00, rx:0.00, ry:0.00, rz:0.00},
      cam:{z:6.4, fov:42}, alpha:1.00,
      blob:{deform:0.55, morphFreq:1.0, morphSpeed:1.0, colorTone:0.10, wireOp:0.90, glowInt:1.0, rimPow:2.8, wireColor:0.15} },
    { name:'ABOUT',      t:0.16,
      root:{x:0, y:0, z:0, scale:1.00},
      core:{x:0.85, y:0.55, z:-0.30, scale:0.82, rx:0.10, ry:-0.18, rz:0.04},
      cam:{z:6.8, fov:44}, alpha:0.88,
      blob:{deform:0.70, morphFreq:1.3, morphSpeed:1.2, colorTone:0.30, wireOp:0.75, glowInt:0.90, rimPow:2.5, wireColor:0.30} },
    { name:'ECOSYSTEM',  t:0.34,
      root:{x:0, y:0, z:0, scale:1.00},
      core:{x:0.00, y:0.00, z:0.00, scale:0.95, rx:0.18, ry:0.28, rz:0.04},
      cam:{z:6.6, fov:43}, alpha:0.95,
      blob:{deform:0.85, morphFreq:1.6, morphSpeed:1.4, colorTone:0.50, wireOp:1.00, glowInt:0.85, rimPow:2.2, wireColor:0.50} },
    { name:'PROJECTS',   t:0.54,
      root:{x:0, y:0, z:0, scale:0.78},
      core:{x:-0.95, y:0.05, z:-0.30, scale:0.55, rx:0.05, ry:0.20, rz:0.0},
      cam:{z:7.2, fov:46}, alpha:0.65,
      blob:{deform:0.65, morphFreq:1.1, morphSpeed:0.8, colorTone:0.35, wireOp:0.60, glowInt:0.60, rimPow:3.0, wireColor:0.35} },
    { name:'RADARDRAFT', t:0.72,
      root:{x:0, y:0, z:0, scale:0.55},
      core:{x:0.80, y:0.20, z:-0.50, scale:0.42, rx:0.10, ry:-0.20, rz:0.0},
      cam:{z:7.8, fov:49}, alpha:0.42,
      blob:{deform:0.40, morphFreq:0.8, morphSpeed:0.5, colorTone:0.20, wireOp:0.35, glowInt:0.30, rimPow:3.5, wireColor:0.20} },
    { name:'REMAINING',  t:0.88,
      root:{x:0, y:0, z:0, scale:0.42},
      core:{x:0.55, y:0.30, z:-0.80, scale:0.32, rx:0.18, ry:0.28, rz:0.0},
      cam:{z:8.2, fov:51}, alpha:0.25,
      blob:{deform:0.25, morphFreq:0.6, morphSpeed:0.4, colorTone:0.10, wireOp:0.20, glowInt:0.18, rimPow:4.0, wireColor:0.10} },
    { name:END_KEY,     t:1.00,
      root:{x:0, y:0, z:0, scale:0.42},
      core:{x:0.55, y:0.30, z:-0.80, scale:0.32, rx:0.18, ry:0.28, rz:0.0},
      cam:{z:8.2, fov:51}, alpha:0.22,
      blob:{deform:0.20, morphFreq:0.5, morphSpeed:0.3, colorTone:0.08, wireOp:0.15, glowInt:0.15, rimPow:4.2, wireColor:0.08} },
  ];
  const STAGE_BY_NAME = {};
  STAGES.forEach(s => { STAGE_BY_NAME[s.name] = s; });

  // ------------------------------------------------------------------
  // 2. Spring constants
  // ------------------------------------------------------------------
  const SPRING_SCROLL = 0.06;
  const SPRING_POS    = 0.08;
  const SPRING_ROT    = 0.07;
  const SPRING_SCALE  = 0.08;
  const SPRING_ALPHA  = 0.06;
  const SPRING_MOUSE  = 0.08;
  const SPRING_BLOB   = 0.05; // blob morph params converge slower
  const HOVER_SPRING  = 0.05;

  // ------------------------------------------------------------------
  // 3. Section anchor system
  // ------------------------------------------------------------------
  let anchors = [];

  function recomputeAnchors() {
    const out = [];
    for (const key of STAGE_ORDER) {
      const meta = STAGES_META[key];
      const el = document.getElementById(meta.domId);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      const center = r.top + window.scrollY + r.height / 2;
      out.push({ key, domId: meta.domId, center });
    }
    if (out.length < 2) { anchors = []; return; }
    const first = out[0].center, last = out[out.length - 1].center;
    for (const a of out) a.t = (a.center - first) / Math.max(1, (last - first));
    anchors = out;
  }

  // ------------------------------------------------------------------
  // 4. Responsive profile
  // ------------------------------------------------------------------
  function makeResponsiveProfile() {
    const w = window.innerWidth;
    if (w < 640) {
      return { key:'mobile', coreScale:0.68, particleScale:0.22, detail:3,
               particleMul:{far:0.25, mid:0.25, near:0.20} };
    }
    if (w < 1100) {
      return { key:'tablet', coreScale:0.85, particleScale:0.55, detail:4,
               particleMul:{far:0.55, mid:0.55, near:0.55} };
    }
    return { key:'desktop', coreScale:1.00, particleScale:1.00, detail:5,
             particleMul:{far:1.00, mid:1.00, near:1.00} };
  }

  // ------------------------------------------------------------------
  // 5. Helpers
  // ------------------------------------------------------------------
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (t) => t * t * (3 - 2 * t);
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ------------------------------------------------------------------
  // 6. init(THREE)
  // ------------------------------------------------------------------
  function init(THREE) {


    // ---------- renderer ----------
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    // ---------- scene & camera ----------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.015);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 6.4);
    camera.lookAt(0, 0, 0);

    // ---------- environment map (simplified — blob handles its own color) ----------
    function buildEnvMap() {
      const envScene = new THREE.Scene();
      envScene.add(new THREE.AmbientLight(0x202030, 0.3));
      const pmrem = new THREE.PMREMGenerator(renderer);
      pmrem.compileEquirectangularShader();
      const target = pmrem.fromScene(envScene, 0.04);
      pmrem.dispose();
      return target.texture;
    }
    const envMap = buildEnvMap();
    scene.environment = envMap;

    // ---------- lights ----------
    const ambient = new THREE.AmbientLight(0x1a1530, 0.3);
    scene.add(ambient);
    const hemi = new THREE.HemisphereLight(0x8a7cff, 0x0a0814, 0.4);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xddd6ff, 1.2);
    keyLight.position.set(2.8, 3.2, 3.0);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x6cc8ff, 0.6);
    fillLight.position.set(-3.2, 0.5, 1.6);
    scene.add(fillLight);
    const rimViolet = new THREE.PointLight(0x7C5CFF, 12, 20, 1.4);
    rimViolet.position.set(-2.4, -0.6, -1.8);
    scene.add(rimViolet);
    const rimMagenta = new THREE.PointLight(0xff5cc8, 8, 14, 1.5);
    rimMagenta.position.set(0, -2.0, 0.6);
    scene.add(rimMagenta);

    // ------------------------------------------------------------------
    // 8. ORGANIC BLOB — the hero 3D object
    // ------------------------------------------------------------------
    const root     = new THREE.Group();
    const coreGroup = new THREE.Group();
    root.add(coreGroup);
    scene.add(root);

    // ---- Blob uniforms (shared across shader materials) ----
    const blobUniforms = {
      uTime:       { value: 0 },
      uDeform:     { value: 0.55 },
      uMorphFreq:  { value: 1.0 },
      uMorphSpeed: { value: 1.0 },
      uColorTone:  { value: 0.10 },
      uGlowInt:    { value: 1.0 },
      uRimPow:     { value: 2.8 },
      uWireColor:  { value: 0.15 },
      uPulse:      { value: 1.0 },
      uMouse:      { value: new THREE.Vector2(0, 0) },
    };

    // GLSL noise functions (kept for legacy; not currently used)
    const NOISE_GLSL = `
      float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
      float noise3(vec3 p){
        vec3 i=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        float n=hash3(i)+hash3(i+vec3(1,0,0))+hash3(i+vec3(0,1,0))+hash3(i+vec3(1,1,0))
               +hash3(i+vec3(0,0,1))+hash3(i+vec3(1,0,1))+hash3(i+vec3(0,1,1))+hash3(i+vec3(1,1,1));
        return n/8.0;
      }
      float fbm3(vec3 p,float freq,float amp){
        float v=0.0,a=amp,f=freq;
        for(int i=0;i<4;i++){v+=a*noise3(p*f);f*=2.0;a*=0.5;}
        return v;
      }
    `;

    // ---- Build a procedural vertical gradient texture for the surface ----
    // Matches the reference: deep blue/violet at top → hot pink/magenta at bottom
    function makeGradientTexture(size = 256) {
      const c = document.createElement('canvas');
      c.width = 8; c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createLinearGradient(0, 0, 0, size);
      g.addColorStop(0.00, '#3a2e80');   // deep blue-violet (top)
      g.addColorStop(0.30, '#5a30a8');   // violet
      g.addColorStop(0.55, '#8a32c8');   // mid purple
      g.addColorStop(0.78, '#c438c0');   // hot magenta
      g.addColorStop(1.00, '#e848a8');   // pink (bottom)
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 8, size);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    }
    const gradientTex = makeGradientTexture(256);

    // ---- Build a custom "lobed" organic surface ----
    // The reference shows 5-6 flowing organic surfaces. We achieve this with
    // high-subdivision icosahedron + multi-octave noise displacement applied
    // directly to vertex positions (no shader needed — this works in JS only).
    const BLOB_GEO = new THREE.IcosahedronGeometry(1.0, 6); // very dense (~10k verts)
    const basePositions = BLOB_GEO.attributes.position.array.slice();
    const baseNormals   = BLOB_GEO.attributes.normal.array.slice();
    const numVerts      = BLOB_GEO.attributes.position.count;

    // Pre-compute each vertex's deformed position using a CPU FBM.
    // We'll re-displace every frame using a small JS noise.
    function jsNoise3(x, y, z) {
      // Simple value noise via sin hashing (cheap, stable)
      const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
      return (s - Math.floor(s));
    }
    function jsFbm(x, y, z, freq, amp) {
      let v = 0, a = amp, f = freq;
      for (let i = 0; i < 4; i++) {
        v += a * jsNoise3(x * f, y * f, z * f);
        f *= 2.0; a *= 0.5;
      }
      return v;
    }
    // Track time + params for per-frame displacement
    const blobDisplace = {
      time: 0, deform: 0.55, morphFreq: 1.0, morphSpeed: 1.0, mouse: [0, 0]
    };
    function applyBlobDeform() {
      const t  = blobDisplace.time;
      const D  = blobDisplace.deform;
      const F  = blobDisplace.morphFreq;
      const S  = blobDisplace.morphSpeed;
      const mx = blobDisplace.mouse[0];
      const my = blobDisplace.mouse[1];
      const pos = BLOB_GEO.attributes.position.array;
      const nor = BLOB_GEO.attributes.normal.array;
      for (let i = 0; i < numVerts; i++) {
        const ix = i * 3;
        const bx = basePositions[ix], by = basePositions[ix+1], bz = basePositions[ix+2];
        // Multi-octave noise displacement, similar to the reference's lobed surface
        const n = jsFbm((bx + mx*0.2) * F + t * S * 0.18,
                        (by + my*0.2) * F + t * S * 0.12,
                        (bz) * F + t * S * 0.15,
                        1.2, D * 0.55)
                + jsNoise3((bx) * F * 1.8 + t * S * 0.12,
                           (by) * F * 1.8 + t * S * 0.10,
                           (bz) * F * 1.8 + t * S * 0.09) * D * 0.20;
        pos[ix]   = bx + baseNormals[ix]   * n;
        pos[ix+1] = by + baseNormals[ix+1] * n;
        pos[ix+2] = bz + baseNormals[ix+2] * n;
        // Slight normal displacement to keep lighting coherent
        nor[ix]   = baseNormals[ix];
        nor[ix+1] = baseNormals[ix+1];
        nor[ix+2] = baseNormals[ix+2];
      }
      BLOB_GEO.attributes.position.needsUpdate = true;
      BLOB_GEO.attributes.normal.needsUpdate   = true;
      BLOB_GEO.computeVertexNormals();
    }
    applyBlobDeform(); // initial

    // ---- Main blob surface: MeshBasicMaterial with vertical gradient map ----
    // This sidesteps all shader compile issues. The gradient map gives the
    // purple→magenta top→bottom look from the reference. The mesh is rendered
    // both with the gradient (back lobes, more transparent) and front (solid).
    const blobMat = new THREE.MeshBasicMaterial({
      map:         gradientTex,
      color:       0xffffff,
      transparent: true,
      opacity:     0.55,
      side:        THREE.DoubleSide,
      depthWrite:  false,
      blending:    THREE.NormalBlending,
    });
    blobMat.userData = { baseOpacity: 0.55 };
    const blob = new THREE.Mesh(BLOB_GEO, blobMat);
    coreGroup.add(blob);

    // ---- Front-face pass: same surface, slightly more opaque, to give depth ----
    const blobFrontMat = new THREE.MeshBasicMaterial({
      map:         gradientTex,
      color:       0xffffff,
      transparent: true,
      opacity:     0.30,
      side:        THREE.FrontSide,
      depthWrite:  false,
      blending:    THREE.NormalBlending,
    });
    blobFrontMat.userData = { baseOpacity: 0.30 };
    const blobFront = new THREE.Mesh(BLOB_GEO, blobFrontMat);
    blobFront.renderOrder = 2;
    coreGroup.add(blobFront);

    // ---- Dense wireframe overlay ----
    // Built from the same BLOB_GEO so it follows the displaced surface exactly.
    const wireGeo = new THREE.WireframeGeometry(BLOB_GEO);
    const wireMat = new THREE.LineBasicMaterial({
      color:       0xd0a8ff,
      transparent: true,
      opacity:     0.55,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });
    wireMat.userData = { baseOpacity: 0.55 };
    const wireframe = new THREE.LineSegments(wireGeo, wireMat);
    wireframe.renderOrder = 3;
    coreGroup.add(wireframe);

    // Update the wireframe geometry each frame to match the displaced surface.
    // WireframeGeometry is built once, but it references positions. We rebuild
    // it (cheap at ~10k verts) only every N frames to keep it light.
    let wireRebuildCounter = 0;
    function maybeRebuildWire() {
      if (++wireRebuildCounter < 6) return; // every 6 frames
      wireRebuildCounter = 0;
      // Dispose the old geometry's position buffer (rebuilding from scratch)
      wireGeo.dispose();
      const newWireGeo = new THREE.WireframeGeometry(BLOB_GEO);
      wireframe.geometry = newWireGeo;
    }

    // ---- Outer glow shell — simple transparent shell ----
    const glowGeo = new THREE.IcosahedronGeometry(1.18, 3);
    const glowMat = new THREE.MeshBasicMaterial({
      color:       0x8a40d0,
      transparent: true,
      opacity:     0.15,
      side:        THREE.BackSide,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });
    glowMat.userData = { baseOpacity: 0.15 };
    const glowShell = new THREE.Mesh(glowGeo, glowMat);
    glowShell.renderOrder = 0;
    coreGroup.add(glowShell);

    // ---- Inner core — small bright accent ----
    const innerGeo = new THREE.IcosahedronGeometry(0.35, 3);
    const innerMat = new THREE.MeshBasicMaterial({
      color:       0xc060ff,
      transparent: true,
      opacity:     0.50,
      blending:    THREE.AdditiveBlending,
      depthWrite:  false,
    });
    innerMat.userData = { baseOpacity: 0.50 };
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    innerCore.renderOrder = 4;
    coreGroup.add(innerCore);

    // ------------------------------------------------------------------
    // 9. Halo sprite (atmospheric glow behind the blob)
    // ------------------------------------------------------------------
    function makeRadialTexture(THREE, size, rgbaPrefix) {
      const c = document.createElement('canvas');
      c.width = c.height = size;
      const ctx = c.getContext('2d');
      const g = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
      g.addColorStop(0,    rgbaPrefix + '1.0)');
      g.addColorStop(0.3,  rgbaPrefix + '0.4)');
      g.addColorStop(0.7,  rgbaPrefix + '0.08)');
      g.addColorStop(1,    rgbaPrefix + '0.0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    }

    const haloMat = new THREE.SpriteMaterial({
      map: makeRadialTexture(THREE, 512, 'rgba(180,160,255,'),
      blending: THREE.AdditiveBlending,
      transparent: true, depthWrite: false, opacity: 0.50,
    });
    haloMat.userData = { baseOpacity: 0.50 };
    const halo = new THREE.Sprite(haloMat);
    halo.scale.set(4.0, 4.0, 1);
    root.add(halo);

    // ------------------------------------------------------------------
    // 10. Particle layers (atmospheric depth — preserved from prior impl)
    // ------------------------------------------------------------------
    function makeParticleLayer(count, opts) {
      const positions = new Float32Array(count * 3);
      const sizes  = new Float32Array(count);
      const phases = new Float32Array(count);
      const depth  = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        const r = opts.rMin + Math.random() * (opts.rMax - opts.rMin);
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        positions[i*3]   = r * Math.sin(p) * Math.cos(t);
        positions[i*3+1]= r * Math.sin(p) * Math.sin(t);
        positions[i*3+2]= opts.zBias + r * Math.cos(p) * opts.zSpread;
        sizes[i]  = opts.sizeMin + Math.random() * (opts.sizeMax - opts.sizeMin);
        phases[i] = Math.random() * Math.PI * 2;
        depth[i]  = (positions[i*3+2] + 2) / 4;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      g.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
      return { g, count, phases, depth };
    }
    const farLayer  = makeParticleLayer(80, {rMin:3.0, rMax:6.5, zBias:-1.5, zSpread:0.4, sizeMin:0.008, sizeMax:0.022});
    const midLayer  = makeParticleLayer(70, {rMin:1.8, rMax:3.2, zBias: 0,   zSpread:0.6, sizeMin:0.012, sizeMax:0.030});
    const nearLayer = makeParticleLayer(35, {rMin:1.0, rMax:2.2, zBias: 0.6, zSpread:0.5, sizeMin:0.022, sizeMax:0.050});

    function makeParticleSystem(layer, color, size, opacity) {
      const mat = new THREE.PointsMaterial({
        color, size, sizeAttenuation: true,
        transparent: true, opacity,
        blending: THREE.AdditiveBlending, depthWrite: false,
        map: makeRadialTexture(THREE, 64, 'rgba(255,255,255,'),
      });
      mat.userData = { baseOpacity: opacity };
      const pts = new THREE.Points(layer.g, mat);
      pts.userData.layer = layer;
      scene.add(pts);
      return pts;
    }
    const farParticles  = makeParticleSystem(farLayer,  0x8090c8, 0.022, 0.35);
    const midParticles  = makeParticleSystem(midLayer,  0xa8b0ff, 0.030, 0.55);
    const nearParticles = makeParticleSystem(nearLayer, 0xc8d0ff, 0.040, 0.75);

    // ------------------------------------------------------------------
    // 11. State
    // ------------------------------------------------------------------
    const S_HERO = STAGES[0];
    const state = {
      pointer:      new THREE.Vector2(0, 0),
      smoothed:     new THREE.Vector2(0, 0),
      hover:        0, hoverSmoothed: 0,
      cursor:       'default',
      targetScrollProgress: 0, smoothScrollProgress: 0,

      // Transform spring accumulators
      rootX: S_HERO.root.x, rootY: S_HERO.root.y, rootZ: S_HERO.root.z, rootS: S_HERO.root.scale,
      cCoreX: S_HERO.core.x, cCoreY: S_HERO.core.y, cCoreZ: S_HERO.core.z, cCoreS: S_HERO.core.scale,
      cRotX: S_HERO.core.rx, cRotY: S_HERO.core.ry, cRotZ: S_HERO.core.rz,
      camZ: S_HERO.cam.z, camFov: S_HERO.cam.fov,
      sceneAlpha: S_HERO.alpha,

      // Base targets (per-frame from STAGES blended)
      baseRootX: S_HERO.root.x, baseRootY: S_HERO.root.y,
      baseRootZ: S_HERO.root.z, baseRootS: S_HERO.root.scale,
      baseCoreX: S_HERO.core.x, baseCoreY: S_HERO.core.y,
      baseCoreZ: S_HERO.core.z, baseCoreS: S_HERO.core.scale,
      coreBaseRotX: S_HERO.core.rx, coreBaseRotY: S_HERO.core.ry, coreBaseRotZ: S_HERO.core.rz,
      baseCamZ: S_HERO.cam.z, baseCamFov: S_HERO.cam.fov,
      baseSceneAlpha: S_HERO.alpha,

      // Blob morph accumulators
      bDeform:    S_HERO.blob.deform,
      bMorphFreq: S_HERO.blob.morphFreq,
      bMorphSpeed:S_HERO.blob.morphSpeed,
      bColorTone: S_HERO.blob.colorTone,
      bWireOp:    S_HERO.blob.wireOp,
      bGlowInt:   S_HERO.blob.glowInt,
      bRimPow:    S_HERO.blob.rimPow,
      bWireColor: S_HERO.blob.wireColor,

      stageIndex: 0, t: 0,
    };

    const _v3    = new THREE.Vector3();
    const _color = new THREE.Color();

    window.setHeroScrollProgress = function (v) {
      state.targetScrollProgress = clamp(v, 0, 1);
    };

    // ---------- Hero DOM anchor ----------
    // Project the #core host element's on-screen box into world space so the
    // 3D artifact sits exactly where the layout reserves room for it (the hero's
    // right-hand column on desktop, the centered slot below the copy on mobile).
    // This keeps the headline readable at every viewport instead of relying on
    // fixed world offsets that only happen to work at one aspect ratio.
    function projectHostTarget(camFov, camZ, coreZ) {
      if (!host) return null;
      const r = host.getBoundingClientRect();
      const vw = window.innerWidth, vh = window.innerHeight;
      if (!r.width || !vw || !vh) return null;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const ndcX = (cx / vw) * 2 - 1;
      const ndcY = -((cy / vh) * 2 - 1);
      const dist = Math.max(0.1, camZ - coreZ);
      const halfH = Math.tan((camFov * Math.PI / 180) / 2) * dist;
      const halfW = halfH * (vw / vh);
      // Fit the ~1.3-unit solid blob to a fraction of the host's half-width so
      // it fills its slot without spilling over the copy.
      const hostHalfWorld = (r.width / vw) * halfW;
      const BLOB_R = 1.3;
      const s = clamp((hostHalfWorld * 0.82) / BLOB_R, 0.4, 1.1) /
                Math.max(0.001, responsive.coreScale);
      return { x: ndcX * halfW, y: ndcY * halfH, s };
    }

    // ---------- Mouse ----------
    function onPointerMove(e) {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      state.pointer.x = clamp(nx, -1, 1);
      state.pointer.y = clamp(ny, -1, 1);
    }
    function onPointerLeave() { state.pointer.set(0, 0); }
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    // ---------- Resize ----------
    let responsive = makeResponsiveProfile();

    function resize() {
      const w = Math.max(1, window.innerWidth);
      const h = Math.max(1, window.innerHeight);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    resize();
    recomputeAnchors();

    let _resizeTimer = null;
    function onResizeCoalesced() {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(() => {
        resize();
        recomputeAnchors();
        responsive = makeResponsiveProfile();
      }, 200);
    }
    window.addEventListener('resize', onResizeCoalesced, { passive: true });
    const bodyRO = ('ResizeObserver' in window) ? new ResizeObserver(onResizeCoalesced) : null;
    if (bodyRO) bodyRO.observe(document.body);

    window.addEventListener('load', () => {
      setTimeout(recomputeAnchors, 250);
      setTimeout(recomputeAnchors, 1000);
    });

    // ------------------------------------------------------------------
    // 12. Animation loop
    // ------------------------------------------------------------------
    let lastFrame = performance.now();
    let rafId = 0;

    function tick() {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      state.t += dt;

      // ---- Mouse smoothing ----
      state.smoothed.x += (state.pointer.x - state.smoothed.x) * SPRING_MOUSE;
      state.smoothed.y += (state.pointer.y - state.smoothed.y) * SPRING_MOUSE;
      state.hoverSmoothed += (state.hover - state.hoverSmoothed) * HOVER_SPRING;

      // ==================================================================
      // A. SCROLL — compute blended stage base values
      // ==================================================================
      let i = 0;
      const scrollMid = window.scrollY + window.innerHeight * 0.5;
      if (anchors.length >= 2) {
        while (i < anchors.length - 1 && scrollMid > anchors[i+1].center) i++;
        const A = anchors[i];
        const B = anchors[Math.min(i+1, anchors.length-1)];
        const fLocal = A.center === B.center ? 0 :
          clamp((scrollMid - A.center) / (B.center - A.center), 0, 1);
        state.targetScrollProgress = A.t + (B.t - A.t) * fLocal;
      } else {
        state.targetScrollProgress = 0;
      }
      state.smoothScrollProgress +=
        (state.targetScrollProgress - state.smoothScrollProgress) * SPRING_SCROLL;
      const p = state.smoothScrollProgress;

      // Identify surrounding STAGES
      let si = 0;
      while (si < STAGES.length - 2 && p > STAGES[si+1].t) si++;
      const S0 = STAGES[si], S1 = STAGES[Math.min(si+1, STAGES.length-1)];
      const sl = (S1.t > S0.t) ? (p - S0.t) / (S1.t - S0.t) : 0;
      const f = smoothstep(clamp(sl, 0, 1));

      // ---- Body class ----
      if (si !== state.stageIndex) {
        state.stageIndex = si;
        document.body.classList.toggle('stage-hero', si === 0);
      }

      // ---- Transform base values ----
      state.baseRootX = lerp(S0.root.x, S1.root.x, f);
      state.baseRootY = lerp(S0.root.y, S1.root.y, f);
      state.baseRootZ = lerp(S0.root.z, S1.root.z, f);
      state.baseRootS = lerp(S0.root.scale, S1.root.scale, f);
      state.baseCoreX = lerp(S0.core.x, S1.core.x, f);
      state.baseCoreY = lerp(S0.core.y, S1.core.y, f);
      state.baseCoreZ = lerp(S0.core.z, S1.core.z, f);
      state.baseCoreS = lerp(S0.core.scale, S1.core.scale, f);
      state.coreBaseRotX = lerp(S0.core.rx, S1.core.rx, f);
      state.coreBaseRotY = lerp(S0.core.ry, S1.core.ry, f);
      state.coreBaseRotZ = lerp(S0.core.rz, S1.core.rz, f);
      state.baseCamZ   = lerp(S0.cam.z, S1.cam.z, f);
      state.baseCamFov = lerp(S0.cam.fov, S1.cam.fov, f);
      state.baseSceneAlpha = lerp(S0.alpha, S1.alpha, f);

      // ---- Hero anchor ----
      // While the hero stage dominates, pull the artifact toward the projected
      // #core host box so it lives in its reserved column. The weight fades to 0
      // by the ABOUT stage, handing control back to the scroll choreography.
      if (host) {
        const heroW = clamp(1 - p / STAGES[1].t, 0, 1);
        if (heroW > 0.001) {
          const tgt = projectHostTarget(state.baseCamFov, state.baseCamZ, state.baseCoreZ);
          if (tgt) {
            state.baseCoreX = lerp(state.baseCoreX, tgt.x, heroW);
            state.baseCoreY = lerp(state.baseCoreY, tgt.y, heroW);
            state.baseCoreS = lerp(state.baseCoreS, tgt.s, heroW);
          }
        }
      }

      // ---- Blob morph base values ----
      const bB = {
        deform:    lerp(S0.blob.deform,    S1.blob.deform,    f),
        morphFreq: lerp(S0.blob.morphFreq,  S1.blob.morphFreq,  f),
        morphSpeed:lerp(S0.blob.morphSpeed, S1.blob.morphSpeed, f),
        colorTone: lerp(S0.blob.colorTone,  S1.blob.colorTone,  f),
        wireOp:    lerp(S0.blob.wireOp,     S1.blob.wireOp,     f),
        glowInt:   lerp(S0.blob.glowInt,   S1.blob.glowInt,   f),
        rimPow:    lerp(S0.blob.rimPow,    S1.blob.rimPow,    f),
        wireColor: lerp(S0.blob.wireColor, S1.blob.wireColor, f),
      };

      // ==================================================================
      // B. Dampened spring convergence — transforms
      // ==================================================================
      if (!reducedMotion) {
        state.rootX  += (state.baseRootX  - state.rootX)  * SPRING_POS;
        state.rootY  += (state.baseRootY  - state.rootY)  * SPRING_POS;
        state.rootZ  += (state.baseRootZ  - state.rootZ)  * SPRING_POS;
        state.rootS  += (state.baseRootS  - state.rootS)  * SPRING_SCALE;
        state.cCoreX += (state.baseCoreX  - state.cCoreX) * SPRING_POS;
        state.cCoreY += (state.baseCoreY  - state.cCoreY) * SPRING_POS;
        state.cCoreZ += (state.baseCoreZ  - state.cCoreZ) * SPRING_POS;
        state.cCoreS += (state.baseCoreS  - state.cCoreS) * SPRING_SCALE;
        state.camZ   += (state.baseCamZ   - state.camZ)   * SPRING_POS;
        state.sceneAlpha += (state.baseSceneAlpha - state.sceneAlpha) * SPRING_ALPHA;

        // Blob morph: slower convergence for smooth morphing
        state.bDeform    += (bB.deform    - state.bDeform)    * SPRING_BLOB;
        state.bMorphFreq += (bB.morphFreq - state.bMorphFreq) * SPRING_BLOB;
        state.bMorphSpeed+= (bB.morphSpeed- state.bMorphSpeed)* SPRING_BLOB;
        state.bColorTone += (bB.colorTone - state.bColorTone) * SPRING_BLOB;
        state.bWireOp    += (bB.wireOp    - state.bWireOp)    * SPRING_BLOB;
        state.bGlowInt   += (bB.glowInt   - state.bGlowInt)   * SPRING_BLOB;
        state.bRimPow    += (bB.rimPow    - state.bRimPow)    * SPRING_BLOB;
        state.bWireColor += (bB.wireColor - state.bWireColor) * SPRING_BLOB;
      } else {
        // Reduced motion: write directly, no spring
        state.rootX=state.baseRootX; state.rootY=state.baseRootY;
        state.rootZ=state.baseRootZ; state.rootS=state.baseRootS;
        state.cCoreX=state.baseCoreX; state.cCoreY=state.baseCoreY;
        state.cCoreZ=state.baseCoreZ; state.cCoreS=state.baseCoreS;
        state.camZ=state.baseCamZ; state.sceneAlpha=state.baseSceneAlpha;
        state.cRotX=state.coreBaseRotX; state.cRotY=state.coreBaseRotY; state.cRotZ=state.coreBaseRotZ;
        state.bDeform=bB.deform; state.bMorphFreq=bB.morphFreq;
        state.bMorphSpeed=bB.morphSpeed; state.bColorTone=bB.colorTone;
        state.bWireOp=bB.wireOp; state.bGlowInt=bB.glowInt;
        state.bRimPow=bB.rimPow; state.bWireColor=bB.wireColor;
      }

      // ==================================================================
      // C. MOUSE additive transforms
      // ==================================================================
      if (!reducedMotion) {
        // World-level parallax
        state.rootX += state.smoothed.x * 0.10;
        state.rootY += state.smoothed.y * 0.08;

        // Blob rotation: mouse tilts the blob
        const idleX = Math.sin(state.t * 0.3) * 0.012;
        const idleY = Math.cos(state.t * 0.2) * 0.009;
        const targetRX = state.coreBaseRotX - state.smoothed.y * 0.22 + idleX;
        const targetRY = state.coreBaseRotY + state.smoothed.x * 0.22 + idleY;
        state.cRotX += (targetRX - state.cRotX) * SPRING_ROT;
        state.cRotY += (targetRY - state.cRotY) * SPRING_ROT;
        state.cRotZ  = state.coreBaseRotZ;
      }

      // ==================================================================
      // D. Assign to Three.js objects
      // ==================================================================
      root.position.set(state.rootX, state.rootY, state.rootZ);
      root.scale.setScalar(state.rootS);
      coreGroup.position.set(state.cCoreX, state.cCoreY, state.cCoreZ);
      coreGroup.scale.setScalar(state.cCoreS * responsive.coreScale);
      coreGroup.rotation.set(state.cRotX, state.cRotY, state.cRotZ);

      camera.position.set(0, 0, state.camZ);
      if (Math.abs(camera.fov - state.baseCamFov) > 0.01) {
        camera.fov = state.baseCamFov;
        camera.updateProjectionMatrix();
      }

      // ==================================================================
      // E. BLOB shader uniforms — time + scroll morph + mouse bias + hover
      // ==================================================================
      const u = blobUniforms;
      u.uTime.value       = state.t;
      u.uDeform.value     = state.bDeform;
      u.uMorphFreq.value  = state.bMorphFreq;
      u.uMorphSpeed.value = state.bMorphSpeed;
      u.uColorTone.value = state.bColorTone;
      u.uGlowInt.value    = state.bGlowInt * (1 + state.hoverSmoothed * 0.35);
      u.uRimPow.value     = state.bRimPow;
      u.uWireColor.value  = state.bWireColor;
      u.uPulse.value      = state.bWireOp * state.sceneAlpha * (1 + state.hoverSmoothed * 0.2);
      u.uMouse.value.x    = state.smoothed.x;
      u.uMouse.value.y    = state.smoothed.y;

      // Color tone: blend between deep violet and magenta based on stage.
      // colorTone=0 → violet, 1 → magenta.
      const tone = state.bColorTone; // 0..1
      // Surface tint (multiplies the gradient texture)
      _color.setRGB(
        0.85 + tone * 0.15,   // R: 0.85 → 1.00
        0.80 + tone * 0.10,   // G: 0.80 → 0.90
        1.05 - tone * 0.15    // B: 1.05 → 0.90
      );
      blobMat.color.copy(_color);
      blobFrontMat.color.copy(_color);
      // Wireframe color: violet → magenta
      _color.setRGB(
        0.78 + state.bWireColor * 0.18,
        0.40 + state.bWireColor * 0.10,
        1.00 - state.bWireColor * 0.30
      );
      wireMat.color.copy(_color);
      // Glow color: matches surface but brighter
      _color.setRGB(
        0.50 + tone * 0.50,
        0.20 + tone * 0.10,
        0.85 - tone * 0.30
      );
      glowMat.color.copy(_color);

      // Blob material opacity
      const blobAlpha = blobMat.userData.baseOpacity * state.sceneAlpha;
      blobMat.opacity = blobAlpha * (1 + state.hoverSmoothed * 0.08);

      // Wireframe opacity (driven by wireOp × sceneAlpha × hover)
      const wireAlpha = wireMat.userData.baseOpacity * state.bWireOp * state.sceneAlpha
                        * (1 + state.hoverSmoothed * 0.2);
      wireMat.opacity = wireAlpha;

      // Glow shell opacity
      const glowAlpha = glowMat.userData.baseOpacity * state.bGlowInt * state.sceneAlpha
                        * (1 + state.hoverSmoothed * 0.25);
      glowMat.opacity = glowAlpha;

      // Inner core
      const innerAlpha = innerMat.userData.baseOpacity * state.sceneAlpha;
      innerMat.opacity = innerAlpha * (1 + state.hoverSmoothed * 0.15);

      // Orbital rings (none in this revision; the wireframe is the visual ring)
      // Autonomous animation
      if (!reducedMotion) {
        // Blob spin (slow continuous rotation)
        blob.rotation.y      += dt * 0.025;
        blobFront.rotation.y  = blob.rotation.y;
        wireframe.rotation.y  = blob.rotation.y;
        glowShell.rotation.y  = blob.rotation.y * 0.7;
        innerCore.rotation.y += dt * 0.018;
        innerCore.rotation.x += dt * 0.010;

        // Per-frame CPU displacement (the "lobed" organic surface)
        blobDisplace.time = state.t;
        blobDisplace.deform = state.bDeform;
        blobDisplace.morphFreq = state.bMorphFreq;
        blobDisplace.morphSpeed = state.bMorphSpeed;
        blobDisplace.mouse[0] = state.smoothed.x;
        blobDisplace.mouse[1] = state.smoothed.y;
        applyBlobDeform();
        maybeRebuildWire();
      }

      // ==================================================================
      // F. Halo sprite
      // ==================================================================
      const haloPulse = 1 + Math.sin(state.t * 0.5) * 0.06;
      halo.material.opacity = haloMat.userData.baseOpacity * state.sceneAlpha
                              * (1 + state.hoverSmoothed * 0.4) * haloPulse;
      halo.scale.setScalar((4.0 + state.hoverSmoothed * 0.8) * haloPulse);
      halo.position.x = state.smoothed.x * 0.06;
      halo.position.y = state.smoothed.y * 0.06;

      // ==================================================================
      // G. Hover detection (NDC-projected blob center + visual radius)
      // ==================================================================
      _v3.copy(coreGroup.position).project(camera);
      const camDist = camera.position.z - coreGroup.position.z;
      const fovRad  = camera.fov * Math.PI / 180;
      const worldR   = 0.85 * state.cCoreS * responsive.coreScale;
      const ndcR     = (worldR / camDist) / Math.tan(fovRad / 2);
      const dx = state.pointer.x - _v3.x;
      const dy = -state.pointer.y - _v3.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      state.hover = clamp(1 - dist / Math.max(0.01, ndcR), 0, 1);

      if (state.hoverSmoothed > 0.45 && state.cursor !== 'core') {
        state.cursor = 'core';
        if (window.__setHeroCursor) window.__setHeroCursor('core');
        if (host) host.classList.add('is-hovering');
      } else if (state.hoverSmoothed < 0.2 && state.cursor !== 'default') {
        state.cursor = 'default';
        if (window.__setHeroCursor) window.__setHeroCursor('default');
        if (host) host.classList.remove('is-hovering');
      }

      // ==================================================================
      // H. Lights
      // ==================================================================
      if (!reducedMotion) {
        rimViolet.intensity   = 12 + state.hoverSmoothed * 7 + Math.sin(state.t * 0.8) * 0.8;
        rimMagenta.intensity  =  8 + state.hoverSmoothed * 5;
      }
      rimViolet.position.x = -2.4 + state.smoothed.x * 0.5;
      rimViolet.position.y = -0.6 + state.smoothed.y * 0.4;
      rimMagenta.position.x = state.smoothed.x * 0.4;
      rimMagenta.position.y = -2.0 + state.smoothed.y * 0.3;

      // ==================================================================
      // I. Particles
      // ==================================================================
      const particleMul = responsive.particleMul;
      function stepLayer(layer, pts, parallaxMul) {
        const pos = layer.g.attributes.position;
        for (let i = 0; i < layer.count; i++) {
          const ix = i * 3, ph = layer.phases[i], d = layer.depth[i];
          if (!reducedMotion) {
            pos.array[ix]   += Math.sin(state.t * 0.3 + ph) * 0.0008;
            pos.array[ix+1] += Math.cos(state.t * 0.25 + ph) * 0.0008;
            pos.array[ix+2] += Math.sin(state.t * 0.2 + ph) * 0.0006;
            pos.array[ix]   += state.smoothed.x * 0.0008 * d * parallaxMul;
            pos.array[ix+1] += state.smoothed.y * 0.0008 * d * parallaxMul;
          }
        }
        pos.needsUpdate = true;
        pts.rotation.y += reducedMotion ? 0 : 0.0005;
      }
      if (responsive.particleScale > 0) {
        stepLayer(farLayer,  farParticles,  0.3 * particleMul.far);
        stepLayer(midLayer,  midParticles,  1.0 * particleMul.mid);
        stepLayer(nearLayer, nearParticles, 2.0 * particleMul.near);

        const farOp  = farParticles.material.userData.baseOpacity  * state.sceneAlpha * (1 + state.hoverSmoothed * 0.10);
        const midOp  = midParticles.material.userData.baseOpacity  * state.sceneAlpha * (1 + state.hoverSmoothed * 0.15);
        const nearOp = nearParticles.material.userData.baseOpacity * state.sceneAlpha * (1 + state.hoverSmoothed * 0.15);
        farParticles.material.opacity  = farOp;
        midParticles.material.opacity  = midOp;
        nearParticles.material.opacity = nearOp;
      }

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    // ------------------------------------------------------------------
    // 13. Teardown
    // ------------------------------------------------------------------
    window.__teardownHeroScene = function () {
      cancelAnimationFrame(rafId);
      clearTimeout(_resizeTimer);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', onResizeCoalesced);
      if (bodyRO) bodyRO.disconnect();
      document.body.classList.remove('stage-hero');
      if (window.__setHeroCursor) window.__setHeroCursor('default');
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material.dispose();
        }
      });
      envMap.dispose();
      renderer.dispose();
      window.__sceneInit = false;
    };
  }
})();
