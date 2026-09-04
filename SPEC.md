# SPEC — Dharmender · Futuristic Developer Portfolio

## 1. Concept

**One-liner:** A cinematic, scroll-driven developer portfolio that reads like an editorial science journal, anchored by a single living artifact — a "computational core" — that reappears, mutates, and reacts through every section.

**Personality:** Quiet, technical, premium. Not "AI startup" neon, not "agency" glossy. More "research lab meets product studio." Restrained neon, lots of breathing room, deep navy black.

**Reference lineage (inspiration only, not copying):**
- Motionsites / Layers — confidence of composition, restraint of motion.
- 21st.dev — experimental UI vocabulary, component-as-art.
- A printed editorial magazine — for type, hierarchy, section numbers.

**What this is NOT:**
- Not a SaaS landing page.
- Not a card grid portfolio.
- Not a Tailwind template.
- Not a "glow border on everything" site.

---

## 2. Scene Design (Visual Language)

### 2.1 Atmosphere
- Background: layered radial gradients on a near-black base. Two distant light sources — a cold cyan/indigo from upper-left, a deep magenta from lower-right. They never hard-blend; they bleed.
- A barely-visible 1px structural grid (60×60px) sits at 4–6% opacity — present but never demanding attention.
- A noise/grain layer at 3% opacity breaks gradient banding.
- Fine floating particles (~40–60, deterministic seeded) drift slowly upward in the background. They are larger and brighter near the core, almost invisible at the edges.

### 2.2 The Core (the artifact)
The hero's central object is an **abstract computational core**:
- A central faceted "engine" — not a sphere, not a torus. An icosahedral silhouette with cut planes, like a machined crystal.
- An inner volumetric light: a small radial gradient that pulses at ~0.08Hz, simulating a "running" state.
- A single horizontal halo ring (thin, with a small gap, rotated 18° off the camera) — like a planetary ring.
- 3–4 small orbital shards at varying radii, each on its own slow axis, with subtle trailing motion.
- A diffuse outer glow (purple→indigo) and a sharper inner rim light (cyan-white).
- The core sits inside a soft "viewport window" — a faint corner-bracketed frame in the page, suggesting "live preview / instrumented view."

For the prototype the core is an SVG composition layered with CSS filters and absolutely positioned DOM shards — not real WebGL. It is composed so that, in a future phase, the entire DOM tree is replaced by a Three.js group without changing the visual language.

### 2.3 Color tokens
| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#07080C` | Page base |
| `--bg-1` | `#0B0E16` | Surface 1 |
| `--bg-2` | `#11151F` | Surface 2 (panels) |
| `--ink-100` | `#F4F5FA` | Primary text |
| `--ink-70` | `rgba(244,245,250,.72)` | Body text |
| `--ink-50` | `rgba(244,245,250,.52)` | Secondary text |
| `--ink-30` | `rgba(244,245,250,.30)` | Tertiary / labels |
| `--line-15` | `rgba(255,255,255,.08)` | Hairline borders |
| `--line-25` | `rgba(255,255,255,.12)` | Stronger borders |
| `--accent-violet` | `#7C5CFF` | Primary accent |
| `--accent-blue` | `#5CC8FF` | Cool accent / data |
| `--accent-magenta` | `#FF5CC8` | Hot accent (sparing) |
| `--accent-amber` | `#FFC15C` | Highlight (sparing) |
| `--glow-violet` | `rgba(124,92,255,.45)` | Glow stop |
| `--glow-blue` | `rgba(92,200,255,.35)` | Glow stop |

No pure white text. No pure black background. All text and surfaces sit in calibrated steps.

### 2.4 Typography
- **Display:** `Instrument Serif` (italic for accent words) + `Inter Tight` (sans).
- **Body:** `Inter Tight` 400/500.
- **Mono / technical:** `JetBrains Mono` 400/500, used for coordinates, timestamps, tech labels, section IDs.

Scale (fluid, clamp):
- H1 (hero): clamp(3.5rem, 9vw, 8.5rem), line-height 0.92, tracking -0.04em.
- H2 (section): clamp(2.5rem, 6vw, 5rem), line-height 0.95, tracking -0.035em.
- H3: clamp(1.5rem, 2.5vw, 2.25rem), tracking -0.02em.
- Body: 1.0625rem, line-height 1.6.
- Caption / technical: 0.75rem, tracking 0.18em, uppercase, mono.

### 2.5 Spacing / grid
- Max content width: 1440px, with a 12-col grid inside.
- Section vertical rhythm: 18vh top, 22vh bottom on desktop. Compressed to 12vh / 14vh on mobile.
- 8px base spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192.

### 2.6 Motion language
- **Default easing:** `cubic-bezier(0.2, 0.7, 0.2, 1)` ("soft out") for entrance; `cubic-bezier(0.65, 0, 0.35, 1)` for state changes.
- **Durations:** 220ms micro, 420ms small, 700ms medium, 1100ms hero/editorial.
- **Stagger:** 40ms steps, capped at 8.
- **Reduced motion:** all transforms collapse to opacity-only fades under `prefers-reduced-motion`.

---

## 3. Features & Interactions (per section)

### 3.1 Navigation (sticky top)
- Left: small monogram `DH/°` + tiny coordinates readout (lat/lng-style) that updates to the user's local time, formatted as `37.7749° N · 122.4194° W · 14:23:07`.
- Center: section index `01 HOME` … `08 CONTACT` — compact, mono caption style, no boxes.
- Right: `GET IN TOUCH` pill, with magnetic hover (4px max pull).
- A 1px hairline appears below the nav when scrolled past 24px.
- Mobile: nav collapses to a `MENU` button; opens a full-screen overlay with the same items, large-numbered, the core rendered dimly behind.

### 3.2 01 · Hero
Layout: 12-col grid.
- **Left (cols 1–7):**
  - Eyebrow: `01 — FULL STACK DEVELOPER · ANGULAR / NODE / AI`.
  - Headline: `I build digital experiences that feel alive.` (serif italic on "alive").
  - 1-line supporting copy.
  - Two CTAs: `VIEW MY WORK` (filled, violet→blue gradient border) + `DOWNLOAD CV` (ghost, with arrow).
  - Live status block: blinking dot + "System online · Building something new".
- **Right (cols 8–12):**
  - The Core, in a corner-bracketed "viewport frame" labeled `CORE.001 · LIVE`.
  - Three readout lines (telemetry feel): `Φ 0.214`, `τ 18.4s`, `∇ 41%`. Numbers subtly tick.
- **Bottom strip:** a horizontal scrolling marquee of 12 technologies, set in mono, 10% opacity, moving at 0.3 viewport widths/sec.

**Mouse interaction (prototype):**
- Cursor over hero: a CSS variable `--mx, --my` is set to the mouse position normalized to the hero.
- The core group reads this and applies:
  - Tilt: `rotateY(calc(var(--mx) * 18deg)) rotateX(calc(var(--my) * -10deg))`.
  - Inner light follows cursor via a radial gradient inside the core.
  - Outer shards translate a fraction (parallax: shards near 1.0×, halo near 0.4×).
  - Background light sources shift by 8% in the opposite direction.
- Hover directly on core: stronger tilt (+50%), a subtle scale to 1.03, halo brightens, cursor swaps to "depth" state.

### 3.3 02 · About
Editorial spread, two-column.
- Left: massive section number `02` in outline (1px stroke, transparent fill). Below it a serif headline: `Turning complex problems into simple digital experiences.`
- Right: 2 short paragraphs. No photo — instead an abstract "fingerprint" SVG (concentric arcs, like an oscilloscope capture) that rotates very slowly.
- Below: a single quiet stats row — `2+ years`, `15+ projects`, `10+ technologies`, each with a thin underline and a 1-line descriptor. Numbers animate from 0 to value on enter.

### 3.4 03 · Skills / Technology Ecosystem
A central node labeled `STACK` with 5 grouped clusters orbiting:
- `FRONTEND` (Angular, TypeScript, Tailwind, React)
- `BACKEND` (Node.js, REST, GraphQL)
- `DATABASE` (MongoDB, PostgreSQL)
- `AI` (LLM APIs, embeddings, prompt systems)
- `TOOLS` (Docker, AWS, Git)

Each cluster is a small group of nodes connected by thin lines, all connected back to the center. On hover, the cluster's connecting line brightens to violet; the other clusters dim slightly. Click a node → it shows a 1-line description and the connection to the center pulses.

For the prototype, this is SVG with hover state in CSS.

### 3.5 04 · Featured Projects
Three projects, each in a different editorial composition (no repeat layouts):

1. **RadarDraft** — full-bleed, two-column asymmetric. Left: large project index, name in serif, problem statement. Right: a "browser window" mockup with layered panels showing the UI. Below: tech tags + View / GitHub links.
2. **Storage Manager** — single column, image-led. A large "data table" mockup on the right (60% width), with project info on the left. Includes a small inline metric block (e.g., "handles 1k+ records locally").
3. **Third project placeholder** — horizontal split: a quote-style headline left, a stylized "stack diagram" right (3 layered cards offset 12px each).

Each project has a different hover treatment (the "browser" tilts, the "data table" scans a highlight across a row, the stack diagram lifts and casts a longer shadow).

### 3.6 05 · Project Case Study (RadarDraft deep-dive)
Vertical editorial:
- Header: `CASE 001 / RADARDRAFT` in mono, large.
- Section: `Problem / Approach / Architecture / Interface / Technology / Key Features`, each with a heading + 2–3 short paragraphs and an accompanying visual (a wireframe-style SVG of the UI flow, an architecture diagram with labeled nodes, a screenshot-style mock).
- Closing line: `Shipped. In production.` with a status dot.

### 3.7 06 · Experience
A horizontal curved path (SVG) with 4 nodes:
- `2023 — Present · Full Stack Developer` (multiple projects, freelance + product)
- `2022 — 2023 · Frontend-heavy role`
- `2021 — 2022 · CS student, early shipped work`
- `2020 — 2021 · Self-taught foundations`

On desktop, the path spans the viewport; on mobile it collapses to a vertical timeline with the same nodes. Each node expands to a card with role, scope, tech.

### 3.8 07 · Experiments / Lab
A 2×3 grid of "experiment tiles." Each tile is a small live-ish visual mock:
- Shader (animated noise via SVG turbulence)
- Cursor (a small interactive dot)
- Typography (a single word that scrubs through a slider)
- Particles (CSS-animated dots)
- UI micro (a fake button with the magnetic hover behavior)
- WebGL placeholder (a frame labeled `THREE.JS · PLANNED`)

Hovering a tile dims siblings to 35% opacity and reveals its title + "View experiment" link in the bottom-left.

### 3.9 08 · Blog / Insights
- One large featured article: oversized serif headline, 1-paragraph dek, byline, reading time.
- Three smaller articles below in a horizontal row, with category tag, title, reading time.
- Hover: title underline extends, category chip brightens.

### 3.10 09 · Contact
- Headline (serif italic): `Let's build something worth remembering.`
- Subline: `Open to product work, AI integrations, and ambitious frontend builds.`
- Three rows: `EMAIL`, `GITHUB`, `LINKEDIN`, each with the value and an arrow.
- One CTA: `START A CONVERSATION` (large, magnetic).
- A small inline form (visual only) — Name, Email, Message, and a `SEND` button.

### 3.11 10 · Footer
Three columns:
- Left: monogram + © 2026 Dharmender.
- Middle: a small live "system clock" in mono, updating every second.
- Right: social links + a "back to top" arrow that animates the page back to 0.

A 1px hairline above the footer. A final small line: `Designed and built by Dharmender · Hand-coded in a quiet room.`

### 3.12 Custom cursor (desktop only)
- Default: 6px white dot, no border, mix-blend `difference`.
- Interactive: expands to 28px ring on hover over `[data-cursor="link"]`.
- Over the core: expands to 44px ring with a tiny crosshair.
- Disabled on touch devices and under `prefers-reduced-motion`.

### 3.13 Background system (global)
Implemented as a fixed, pointer-events-none `<div class="bg-stage">` containing:
- `.bg-grid` (1px lines, 60×60)
- `.bg-glow-a`, `.bg-glow-b` (two large radial gradients)
- `.bg-noise` (SVG turbulence filter, 3% opacity)
- `.bg-particles` (60 absolutely-positioned divs, randomized transforms)
- `.bg-orbital` (one slow-rotating faint ellipse)

The mouse position feeds a CSS var so the two glows shift by ±6% from the center.

### 3.14 Scroll-driven continuity
- The core starts large in the hero, then scales to 0.5 and translates to the upper-right as the user scrolls into About.
- A persistent "viewport frame" carries the core through the next two sections.
- By the Skills section, the core becomes the center of the orbital network, then dissolves out as Projects come into focus.
- Implemented for the prototype with `position: sticky` + `IntersectionObserver` toggling data-attributes that drive CSS variables.

---

## 4. Motion & Timing Inventory

| # | Element | Trigger | Effect | Duration | Easing |
|---|---|---|---|---|---|
| 1 | Page load | DOMContentLoaded | Sections fade + lift | 700ms staggered 40ms | soft-out |
| 2 | Hero core | mousemove (hero) | Tilt + light follow | continuous | linear (CSS var) |
| 3 | Hero core | direct hover | Scale to 1.03, halo +30% | 220ms | soft-out |
| 4 | Nav links | hover | Magnetic pull up to 4px | 220ms | soft-out |
| 5 | Buttons | hover | Border color shift + 1px lift | 220ms | soft-out |
| 6 | Project tiles | scroll into view | Rise 16px, fade | 700ms | soft-out |
| 7 | Project 1 "browser" | hover | Tilt 3D | 420ms | soft-out |
| 8 | Project 2 row | hover | Scan highlight LTR | 1100ms | linear |
| 9 | Project 3 stack | hover | Lift + shadow grow | 420ms | soft-out |
| 10 | Skills network | cluster hover | Connection brightens | 220ms | soft-out |
| 11 | Lab tiles | hover | Siblings dim, title reveal | 300ms | soft-out |
| 12 | Custom cursor | element hover | Size + state swap | 180ms | linear |
| 13 | Background glows | mousemove (global) | Shift ±6% | continuous | linear |
| 14 | Stats counter | scroll into view | Number 0 → value | 900ms | ease-out |
| 15 | Footer clock | tick | Update text | 1000ms | — |

---

## 5. Technical Choices

- **Stack for this prototype phase:** plain HTML + a single CSS file + a small JS file. No framework. Reason: the brief is explicit — design prototype, not Angular production.
- **Structure that maps to the future Angular app:**
  - Each section is a `<section data-section="...">` in `index.html` — corresponds 1:1 to future Angular components.
  - CSS uses CSS custom properties for all design tokens (`--bg-0`, `--ink-100`, etc.) — these become the Angular theme.
  - JS exposes a tiny `state` object and a `mouse` object on `window` — these map to future Angular signals/services.
- **Assets:** all SVG is inline. The "screenshots" are stylized SVG mockups, not real screenshots. This keeps the prototype fully self-contained and avoids inventing fake product imagery.
- **Performance:** grain via SVG filter (cached), particles are transform-only animations, scroll handler is throttled with `requestAnimationFrame`.
- **Accessibility:** semantic landmarks, focus styles, `prefers-reduced-motion` respected, alt text on all decorative SVGs marked `aria-hidden`.
- **Responsive breakpoints:** 1280+ (desktop), 768–1279 (tablet), <768 (mobile).

---

## 6. Deliverable file map

```
Portfolio/
├── SPEC.md                  ← this file
├── index.html               ← full page
├── styles/
│   ├── tokens.css           ← design tokens (colors, type, spacing, motion)
│   ├── base.css             ← reset, typography, utilities
│   ├── components.css       ← buttons, tags, cards, nav, cursor, bg system
│   └── sections.css         ← per-section layout & visuals
├── scripts/
│   ├── mouse.js             ← mouse position → CSS vars
│   ├── core.js              ← hero core interaction
│   ├── scroll.js            ← IO-based reveal + scroll-driven continuity
│   ├── nav.js               ← nav state, magnetic hover
│   ├── skills.js            ← skills network hover
│   ├── projects.js          ← per-project hover behaviors
│   ├── lab.js               ← lab tile hover
│   ├── counter.js           ← stats counter
│   └── clock.js             ← footer clock + nav coords
└── assets/
    └── (no external assets — all inline SVG)
```
