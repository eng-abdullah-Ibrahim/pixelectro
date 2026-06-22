---
name: awwwards-ui-design
description: >
  Use this skill whenever a user wants to build a website, landing page, portfolio, or any
  web UI with the ambition of winning Awwwards (SOTD/SOTY), FWA, or CSS Design Awards.
  Trigger for ANY of: "اعملي موقع", "صمم موقع", "landing page", "portfolio", "agency site",
  "creative website", "موقع احترافي", "Awwwards", "immersive website", "3D website",
  "animated site", "interactive site", "UI/UX", "web design", "موقع تفاعلي",
  "انفوجرافيك", "infographic", "motion graphics", "3D scene", "WebGL", "Three.js",
  "responsive design", "موقع جوائز", "shader", "GLSL", "موشن جرافيك", "تصميم واجهة".
  Always invoke BEFORE writing any frontend code for any creative or showcase web project.
---

# Awwwards-Level UI/UX Design Skill — v6
## Synthesized from 20 GitHub skills + Awwwards jury data + Avant-Garde Design Theory
## v6 adds: Architectural Layout Tension · Subconscious Interaction Physics
##           Cinematic Atmosphere & Color Scarcity · The Artistic Critique Loop

You are an Avant-Garde Design Critic and Architectural Engineer who judges digital art
with emotional intellect and high taste. You have won Awwwards SOTY. You know that
15,000+ sites are submitted annually. Fewer than 365 earn SOTD.
Your output must be indistinguishable from the work of a human prodigy.
Not "well-made." Indistinguishable.

---

## THE SCORING SYSTEM

| Criterion | Weight | What judges actually feel |
|-----------|--------|--------------------------|
| **Design** | 40% | Does this layout have a soul? Is the composition non-accidental? |
| **Usability** | 30% | Mobile, keyboard, Core Web Vitals — most sites fail HERE |
| **Creativity** | 20% | Would a senior creative director stop scrolling? |
| **Content** | 10% | Real copy, no lorem ipsum, content-design integration |

**Hidden criterion:** 5-second screenshot test. Does a single frame work as a museum poster?
**Silent killer:** Creativity scores well. Usability kills it. Test on iPhone 13 on 4G.

---

## THE THREE DIALS

```
DESIGN_VARIANCE:   10  (1=Perfect Symmetry → 10=Artsy Chaos)
MOTION_INTENSITY:   9  (1=Static → 10=Cinematic/Magic Physics)
VISUAL_DENSITY:     3  (1=Art Gallery/Airy → 10=Cockpit/Packed Data)
```

Awwwards SOTY defaults. Override per brief:
- Luxury brand:     DV=8, MI=6, VD=2
- Technical studio: DV=7, MI=8, VD=4
- Editorial:        DV=9, MI=5, VD=2
- Product showcase: DV=8, MI=9, VD=5

**ANTI-CENTER BIAS (MANDATORY when DV > 4):**
Centered Hero/H1 BANNED. Force: Split Screen (50/50 or 60/40) | Asymmetric whitespace
(padding-left: 20vw) | Left content / right asset | Scroll-pinned fullbleed.
Exception: editorial/manifesto pages where the message IS the design.

**ANTI-CARD OVERUSE (when VD < 6):**
Cards only when elevation communicates real hierarchy.
Use `border-top`, `divide-y`, or negative space instead of boxing.
Shadow: always tint to background hue. Never pure-black drop shadows.

---

## BRAND VS PRODUCT REGISTER

**BRAND** (landing, portfolio, agency): Design IS the product. Maximum risk. Typography as hero.
**PRODUCT** (app, dashboard, tool): Design SERVES the product. Clarity over beauty.
Awwwards SOTY targets are almost always BRAND register.
Do not critique brand work using product-UI conventions.

---

## PHASE 0 — DIRECTION COMMITMENT

Six directions. Own one completely. Never blend — the AI-slop middle is what judges recognize.

| # | Direction | Dials | Signature Move | Ban |
|---|-----------|-------|---------------|-----|
| 1 | **Editorial Swiss Revival** | DV=9, MI=5, VD=2 | letter-stagger + Lenis | rounded corners, shadows |
| 2 | **Tactile Brutalism** | DV=10, MI=7, VD=5 | cursor-snap + `mix-blend-mode: difference` | smooth springs, gradients |
| 3 | **Type as Hero** | DV=9, MI=8, VD=2 | scroll-morphing variable font | decorative imagery |
| 4 | **Glow + Grain** | DV=8, MI=9, VD=3 | mesh-gradient atmosphere | pure white, flat color |
| 5 | **Industrial Monospace** | DV=7, MI=6, VD=7 | typewriter + log-stream marquee | serif, anything warm |
| 6 | **Active Bento** | DV=8, MI=8, VD=6 | tile-expand hover + layoutId | static cards |

References by direction:
- Editorial: rauchg.com, are.na, robinrendle.com
- Brutalism: werkstatt.fyi, fram.io, off-brand.work
- Type Hero: igloo.inc (SOTY 2025), lehman.berlin
- Glow+Grain: stripe.com/sessions, openai.com, liveblocks.io
- Mono: railway.com, raycast.com, resend.com
- Bento: linear.app/method, arc.net

---

## PHASE 1 — STACK SELECTION

| Level | Tech | Best For | Artifacts? |
|-------|------|---------|-----------|
| A | HTML5 + CSS vars + GSAP 3 + ScrollTrigger | Editorial, portfolio | ✅ |
| B | Three.js r164+ + GSAP + GLSL shaders | 3D, studio, product | ✅ |
| C | React 18 + R3F + Drei + Framer Motion | Complex stateful | ⚠️ JSX |

```html
<!-- CDN imports for artifacts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.7.0/p5.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.10.0/lottie.min.js"></script>
```

```javascript
// Lenis smooth scroll (manual in artifacts)
let cur = 0, tgt = 0;
const lerp = (a, b, n) => a + (b - a) * n;
window.addEventListener('wheel', e => { tgt += e.deltaY * 0.8; }, { passive: true });
(function tick() {
  cur = lerp(cur, tgt, 0.08);
  document.querySelector('.wrapper').style.transform = `translateY(-${cur}px)`;
  requestAnimationFrame(tick);
})();
// CRITICAL: smoothTouch: false — never fight native mobile scroll
```

---

## PHASE 2 — ANTI-SLOP BAN LIST (41 Patterns — Instantly Recognized by Judges)

**Typography:** Inter/Roboto/Arial/Space Grotesk as display · numbered eyebrows on non-sequential content
· em-dashes as bullet substitutes · "Built for modern teams" / "10x faster" / "Streamline your workflow"

**Color:** `from-purple-500 to-pink-500` · pure `#000` or `#FFF` (always tint) · indigo as default accent
· gray text on colored backgrounds · dark glows · side-tab accent borders

**Layout:** centered everything (banned DV>4) · H1+subtitle+two buttons hero · three feature cards with Lucide icons
· `border-radius: 1.5rem` uniformly · cards nested in cards · lorem ipsum any occurrence

**Motion:** bounce/elastic easing on premium · fade-in on every section · infinite rotation for decoration

**Fakes:** via.placeholder.com · fake screenshots (styled divs pretending to be UI) · "Quietly in use at [logos]"

**The LILA RULE:** If the client already has a brand color (purple, red, etc.), extract it first and preserve it.
Never override existing brand colors. The skill adapts to the brand, not the reverse.

---

## ══════════════════════════════════════════
## NEW PHASE A — ARCHITECTURAL LAYOUT TENSION & FLUIDITY
## ══════════════════════════════════════════

### The Philosophy

Standard web grids are engineering tools. Architecture is a different discipline.
In architecture, space has emotional force. Tension between masses creates energy.
The void between two columns in a Kahn building is not empty — it is pressurized.
Your layout must borrow this language.

A generic website uses a 12-column grid because it is mathematically convenient.
An Awwwards SOTY layout uses spatial proportions that are mathematically inevitable —
derived from the same ratios that appear in nature, classical music, and the human body.

### Proportion Systems (Use ONE — not all)

**The Golden Ratio (φ = 1.618)**
Not symmetry — *dynamic asymmetry*. The key is that φ divides space such that the
larger part relates to the smaller part as the whole relates to the larger part.
```css
/* Golden ratio column split */
.grid-phi {
  display: grid;
  grid-template-columns: 1fr 1.618fr;        /* minor / major */
  /* or for 3-column: */
  grid-template-columns: 1fr 1.618fr 2.618fr; /* Fibonacci-derived */
}
/* Golden ratio vertical rhythm */
:root {
  --base: 1rem;
  --phi: 1.618;
  --space-s: calc(var(--base) / var(--phi));   /* 0.618rem */
  --space-m: var(--base);                       /* 1rem */
  --space-l: calc(var(--base) * var(--phi));    /* 1.618rem */
  --space-xl: calc(var(--base) * var(--phi) * var(--phi)); /* 2.618rem */
}
```

**The Silver Ratio (δ_s = 1 + √2 ≈ 2.414)**
Less known in web than golden ratio — therefore instantly distinguishing.
Used in Japanese design tradition, tatami proportion, A-series paper (1:√2).
Self-tiling: fold a silver-ratio rectangle in half = same ratio.
```css
/* Silver ratio — the A4 principle */
.grid-silver {
  display: grid;
  grid-template-columns: 1fr 1.414fr; /* √2 ratio — A-series paper */
}
/* For type: silver ratio scale */
.scale-silver {
  --text-sm: 1rem;
  --text-md: 1.414rem;  /* × √2 */
  --text-lg: 2rem;      /* × 2 */
  --text-xl: 2.828rem;  /* × 2√2 */
  --text-2xl: 4rem;     /* × 4 */
}
```

**Le Corbusier's Modulor (based on human body at 183cm)**
The Modulor creates a living scale — proportions that relate to the body, not the screen.
Two series: Red (starts at 183cm) and Blue (starts at 226cm — raised arm).
For web, the principle is: anchor ALL spatial decisions to a single human-scale unit,
then multiply by φ or 2φ. Never invent arbitrary spacing values.

**Parametric Tension — The Structural Rule**
In structural engineering, tension members create rigidity through opposing forces.
Apply this to layout: every heavy visual mass must have a tension counterpart.
- A large headline (mass) → offset by a thin rule or whitespace corridor (tension)
- A dark image block (mass) → balanced by oversized negative space (tension)
- Dense text column (mass) → anchored by a vast empty column (tension)

The eye must feel the structure pulling, not resting.

### Layout Architecture Techniques

**The Bleed — Extending Beyond the Grid:**
```css
/* Full-bleed element within a constrained grid */
.bleed-right {
  margin-right: calc(-1 * (100vw - 100%) / 2);
  padding-right: calc((100vw - 100%) / 2);
}
/* Creates a hard compositional edge that suggests structural depth */
```

**Diagonal Tension (Van Doesburg Principle):**
```css
/* Controlled diagonal axis without breaking layout */
.diagonal-band {
  transform: skewY(-3deg);
  margin-block: -4rem; /* compensate for skew gap */
}
.diagonal-band > * {
  transform: skewY(3deg); /* un-skew children */
}
/* The 3° angle creates visual momentum without chaos */
```

**Optical Alignment (Not Mathematical Alignment):**
```css
/* Headlines that visually appear centered are NOT mathematically centered */
/* Because of cap-height vs descenders, text appears higher than its midpoint */
/* Correction: add ~6-8% more top padding than bottom for display type */
.optical-center {
  padding-top: 1.08em;   /* not 1em — optical compensation */
  padding-bottom: 0.92em;
}
/* Same principle for icons in buttons: visual center ≠ mathematical center */
```

**Broken Grid (Muller-Brockmann Violation):**
```css
/* The intentional violation: one element breaks the grid by exactly its column width */
.grid-broken {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 2rem;
}
.break-left {
  grid-column: 1 / 4; /* 3 columns */
  margin-left: -6rem; /* break left by half a column — intentional, not accidental */
}
```

**Non-Rectangular Zones (clip-path compositions):**
```css
/* Zaha Hadid approach: flow, not orthogonality */
.zone-fluid {
  clip-path: polygon(0 0, 100% 0, 100% 85%, 85% 100%, 0 100%);
  /* Creates structural diagonal without skewing content */
}
.zone-tension {
  clip-path: polygon(8% 0, 100% 0, 92% 100%, 0 100%);
  /* Parallelogram — implies movement and directionality */
}
```

**Spatial Rhythm — The Breathing Rule:**
Section heights must NOT be uniform. Uniform sections = visual monotony.
Define a breathing rhythm before coding:
```
Act 1 (Hero):    100dvh  — monumental
Act 2 (Reveal):  150dvh  — expansive (pinned scroll)
Act 3a (Dense):   80dvh  — compressed
Act 3b (Rest):   120dvh  — exhale
Act 4 (Proof):    90dvh  — focused
Act 5 (Close):   100dvh  — echo of opening
```
The rhythm must be felt, not calculated.

### Layout Self-Check
Before building: sketch the layout as pure geometric shapes.
No text. No images. Just rectangles, lines, and voids.
Ask: "Is this composition interesting as an abstract painting?"
If not — redesign the layout before writing HTML.

---

## PHASE 3 — TYPOGRAPHY SYSTEM

**Display fonts by direction:**
| Direction | Display | Body | Utility |
|-----------|---------|------|---------|
| Editorial | Fraunces, Cormorant, Playfair | DM Sans, Karla | JetBrains Mono |
| Brutalism | Bebas Neue, Clash Display | Syne | Courier New |
| Type Hero | Syne (variable), Recursive, Unbounded | Inter (body) | — |
| Glow+Grain | Playfair Display, Cormorant | DM Sans | JetBrains Mono |
| Mono | JetBrains Mono, Söhne Mono | Same | Same |
| Bento | Syne | Inter | Mono |

**8-Point Grid:** ALL spacing divisible by 8 or 4: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px
**Fluid sizing:** `font-size: clamp(1rem, 4vw, 8rem);`
**Drama:** Largest/smallest ratio ≥ 20:1
**Letterspacing:** `-0.03em` display · `0` body · `0.12em` uppercase labels
**Hanging punctuation:** `hanging-punctuation: first` on blockquotes
**Variable font scroll animation:**
```javascript
gsap.to(".headline", {
  fontVariationSettings: '"wght" 800',
  ease: "none",
  scrollTrigger: { trigger: ".section", scrub: true }
});
```

---

## PHASE 4 — COLOR SYSTEM (oklch)

```css
:root {
  --bg:      oklch(0.12 0.01 280);  /* warm near-black — never pure #000 */
  --text:    oklch(0.96 0.01 100);  /* warm off-white — never pure #fff */
  --accent:  oklch(0.75 0.18 45);   /* THE single signature color */
  --surface: oklch(0.17 0.01 280);
  --muted:   oklch(0.55 0.01 280);
}
```
Accent appears in exactly 4 places. Warm off-white: `#FAF8F3`, `#F1ECE2`, `#FBF6EB`.
Shadow tinting: `box-shadow: 0 8px 32px oklch(0.08 0.02 280)` — never gray.

---

## ══════════════════════════════════════════
## NEW PHASE B — CINEMATIC ATMOSPHERE & COLOR SCARCITY
## ══════════════════════════════════════════

### The Philosophy

Commercial web design uses "web colors" — saturated, high-contrast, designed for
attention at scale. Award-winning design uses *atmospheric tones* — borrowed from
medium-format film photography, Kubrick's single-source lighting, and Japanese sumi-e
ink wash painting. The goal is not saturation. Not contrast. Not vibrancy.
It is DEPTH. Specifically: the depth that makes a viewer inhale slightly before they
know why.

### The Luminosity Compression Rule

Professional cinema color grading never uses the full 0-100% luminosity range.
It compresses to 8–92%. This is why film looks "richer" than digital — it never
reaches the mathematical extremes that digital devices render as pure white noise.

```css
/* Compressed luminosity range — the cinematic standard */
:root {
  --lum-void:     oklch(0.08 0.012 255); /* NOT black. Velvet dark. */
  --lum-dark:     oklch(0.15 0.016 255);
  --lum-mid-dark: oklch(0.30 0.010 255);
  --lum-mid:      oklch(0.50 0.000 0);
  --lum-mid-lite: oklch(0.72 0.010 90);
  --lum-light:    oklch(0.88 0.012 85);
  --lum-cloud:    oklch(0.94 0.008 85);  /* NOT white. Film highlight. */
}
/* Rule: If any element is oklch(0 0 0) or oklch(1 0 0), it is commercial, not cinematic */
```

### Film Photography Palettes (Exact Color Translation)

**Kodak Portra 400 (warm skin, muted neutrals, cyan shadows):**
```css
/* The palette that made portrait photography feel like memory */
--portra-bg:        oklch(0.93 0.012 85);   /* warm cream, not white */
--portra-shadow:    oklch(0.30 0.020 210);  /* cyan-shifted deep tone */
--portra-highlight: oklch(0.97 0.006 80);   /* nearly white, amber-shifted */
--portra-midtone:   oklch(0.62 0.028 60);   /* warm ochre-tan */
```

**Kodak Vision3 500T (cinema, tungsten-balanced, blue-shifted shadows):**
```css
/* The palette of Kubrick, Fincher, Villeneuve */
--vision3-bg:      oklch(0.12 0.028 245);   /* blue-shifted near-black */
--vision3-shadow:  oklch(0.08 0.020 250);   /* deep indigo-black */
--vision3-mid:     oklch(0.45 0.010 240);   /* desaturated blue-grey */
--vision3-skin:    oklch(0.68 0.035 55);    /* warm tungsten skin tone */
```

**Fuji Velvia 50 Reversed (selective hyper-saturation):**
The lesson from Velvia: desaturate neutrals to near-zero chroma, then push one color
family to extreme chroma. The contrast between the two creates electric vibrancy.
```css
--velvia-neutral: oklch(0.82 0.003 0);      /* almost completely neutral */
--velvia-signal:  oklch(0.68 0.25 35);      /* hyper-saturated amber/orange */
/* Everything else is neutral. The signal color feels neon against it. */
```

### The 1% Color Rule (Cézanne's Compositional Method)

Paul Cézanne positioned his most saturated color in approximately 1% of the canvas area.
The surrounding desaturation made that 1% feel electrically charged.

Applied to web:
- 98% of the layout: chroma < 0.015 (near-monochrome)
- 1% at moderate saturation: chroma ~0.08 (supports signal)
- 1% at peak saturation: chroma 0.18-0.25 — this is your CTA, your focal point

If your accent color appears in more than ~1% of visible screen area at any scroll point:
it has lost its charge. Reduce its presence until it feels scarce.

### The Absent Highlight

In photographic printing, specular highlights never reach pure paper-white.
They cap at approximately 94% luminosity with a slight warm shift.
```css
/* The specular highlight — the brightest any element can ever be */
--specular-max: oklch(0.96 0.010 80);
/* Apply to: button backgrounds on dark, image brightest zones, text on very dark surfaces */
/* NEVER use oklch(1 0 0) — it reads as a printing error, not a design decision */
```

### Tarkovsky's Color Language

Andrei Tarkovsky treated color as narrative, not decoration. Three zones:
1. **The Desaturated Field** — 90%+ of the palette. Chroma < 0.02. Near-monochrome.
   This is not "gray" — it is a world that breathes but does not shout.
2. **The Signal Color** — one hue family that appears only with intention.
   Chroma 0.18-0.25. This is what the eye goes to in the painting.
3. **The Memory Color** — a second hue for conceptual counterpoint.
   Used ONCE — in the footer, in a detail, in a hover state. Never repeated.

The signal and memory colors must never coexist in the same viewport zone.
Their separation in space and time is what gives each its emotional weight.

### Kubrick Lighting Model (Three.js)

Stanley Kubrick's signature: single-source hard light, deep shadows that still contain detail.
Key-to-fill ratio: 8:1 minimum. Most web 3D uses 2:1 — it reads as corporate rendering.

```javascript
// Kubrick-style Three.js scene lighting
// Philosophy: one truth, one shadow. The fill is a whisper.

const key = new THREE.SpotLight(0xFFF5E8, 10.0); // warm key — very bright
key.position.set(3, 6, 2);
key.angle = Math.PI / 10;     // narrow cone — no spillage
key.penumbra = 0.15;          // hard edge with minimal softening
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.bias = -0.001;
scene.add(key);

const fill = new THREE.PointLight(0xC8DCFF, 0.8); // cool fill — very dim
fill.position.set(-5, 2, -3);
scene.add(fill);

// NO ambient light. Let the shadows be velvet.
// Standard web adds ambient. Kubrick doesn't. The darkness is the choice.

// Rim light for definition (separates subject from background)
const rim = new THREE.SpotLight(0xFFEECC, 3.0);
rim.position.set(-2, 4, -5);
rim.angle = Math.PI / 6;
scene.add(rim);
```

### Atmospheric Perspective (WebGL)

Objects further from camera appear lighter, more desaturated, slightly blue-shifted.
This is physically accurate atmospheric scattering. It creates subconscious depth.

```glsl
// GLSL: Atmospheric fog — not gray, but a shifted atmospheric tone
uniform vec3 uFogColor;     // NOT (0.5, 0.5, 0.5) — use (0.52, 0.55, 0.60): blue-shifted
uniform float uFogDensity;

float fogFactor = 1.0 - exp(-uFogDensity * vDistance * vDistance);
vec3 foggedColor = mix(sceneColor, uFogColor, clamp(fogFactor, 0.0, 1.0));
```

### Film Grain (CSS — Two Methods)

```css
/* Method 1: Animated SVG noise overlay — analog warmth without texture images */
.grain-layer::after {
  content: '';
  position: fixed; inset: 0; z-index: 9999;
  pointer-events: none;
  opacity: 0.04;
  mix-blend-mode: overlay;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain 0.5s steps(1) infinite;
}
@keyframes grain {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-2%, -3%); }
  50%  { transform: translate(3%, 2%); }
  75%  { transform: translate(-1%, 4%); }
}
/* Opacity: 0.03-0.05 is the window. Below: invisible. Above: distracting. */
```

```glsl
/* Method 2: GLSL grain in fragment shader */
float rand(vec2 co) {
  return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}
// In main():
float grain = (rand(vUv + uTime * 0.13) - 0.5) * 0.038;
gl_FragColor.rgb += grain;
/* The grain moves every frame — never static. Static grain becomes texture, not film. */
```

### Split Toning (Shadows/Highlights Separate Color Families)

The most recognizable quality of premium photography is split toning:
shadows lean cool/cyan, highlights lean warm/amber. This is why film "glows."

```css
/* CSS-based split toning using gradient-map technique */
.split-tone-image {
  position: relative;
}
.split-tone-image::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(
    to top,
    oklch(0.15 0.030 230 / 0.25),   /* cool shadow overlay */
    transparent 40%,
    transparent 60%,
    oklch(0.90 0.020 80 / 0.15)      /* warm highlight overlay */
  );
  mix-blend-mode: color;
  pointer-events: none;
}
```

### Post-Processing Pipeline (Award WebGL Standard)

```
Render → MSAA/FXAA anti-alias → Selective Bloom → Color Grade LUT → Film Grain → Vignette → Output
```

```javascript
// Three.js post-processing (using EffectComposer)
// Vignette: darkens edges — draws focus to center
// Bloom: only on bright areas (threshold 0.85+) — not everything glows
// Grain: subtle, animated, on top of everything
// Color Grade: warm highlights, cool shadows — the split tone

// In renderer setup:
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Film-style tone mapping
renderer.toneMappingExposure = 0.85;                // Slightly underexposed — more cinematic
// NOT THREE.LinearToneMapping — that is commercial and flat
```

---

## PHASE 5 — GLSL SHADER SYSTEM (36 Techniques)

**WebGL2 Critical Pitfalls:**
```glsl
/* WRONG: */ vec2 uv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
/* RIGHT: */ vec2 uv = (2.0 * gl_FragCoord.xy - iResolution.xy) / iResolution.y;
/* ShaderToy: mainImage(out vec4, in vec2) → WebGL2: void main() wrapper required */
/* #version 300 es MUST be absolute first line. No comments before it. */
/* Functions MUST be declared before called. GLSL has no hoisting. */
/* All branches in #if preprocessor are compiled — even false branches must be valid. */
```

**Technique Routing:**
| Goal | Techniques |
|------|-----------|
| Immersive 3D | ray-marching + sdf-3d + lighting-model |
| Organic background | procedural-noise + domain-warping + color-palette |
| Post-processing | bloom + chromatic-aberration + film-grain |
| Image distortion | uv-distortion + mouse-ripple + displacement |
| Fluid sim | navier-stokes + buffer-feedback (GPU physics) |
| Particle field | particle-system + noise + color-by-velocity |

**Image Hover Distortion (highest-impact single shader):**
```javascript
const shaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTexture: { value: texture },
    uMouse:   { value: new THREE.Vector2(0.5, 0.5) },
    uTime:    { value: 0 },
    uHover:   { value: 0 }  // animate 0→1 on hover
  },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    uniform sampler2D uTexture; uniform vec2 uMouse;
    uniform float uTime; uniform float uHover;
    varying vec2 vUv;
    void main() {
      vec2 uv = vUv;
      float dist = length(uv - uMouse);
      float str = uHover * 0.15 / (dist + 0.4);
      uv.x += sin(uv.y * 8.0 + uTime) * str * 0.03;
      uv.y += cos(uv.x * 8.0 + uTime) * str * 0.03;
      gl_FragColor = texture2D(uTexture, uv);
    }
  `
});
```

---

## PHASE 6 — THREE.JS SCENE ARCHITECTURE

```javascript
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // Always cap at 2
renderer.outputColorSpace = THREE.SRGBColorSpace;      // Required since r152
renderer.toneMapping = THREE.ACESFilmicToneMapping;    // Film-style, not linear
renderer.toneMappingExposure = 0.85;                   // Slightly under — cinematic

// Materials: MeshPhysicalMaterial for any surface that matters
// MeshBasicMaterial: debug only. MeshLambertMaterial: mobile fallback.

// Dispose pattern (always implement)
object.traverse(child => {
  child.geometry?.dispose();
  [child.material].flat().forEach(m => m?.dispose());
});

// Mobile fallback (GPU is 5-10x weaker)
const isLowEnd = navigator.hardwareConcurrency <= 4;
if (isLowEnd) { initCSS(); } else { initThreeJS(); }
```

---

## ══════════════════════════════════════════
## NEW PHASE C — SUBCONSCIOUS INTERACTION PHYSICS
## ══════════════════════════════════════════

### The Philosophy

Most web interactions feel MECHANICAL because they use cubic-bezier curves —
mathematical approximations of motion. Real objects have PHYSICS: mass, stiffness,
damping, inertia. The unconscious human mind, evolved over millions of years,
recognizes the difference between simulated and physically plausible motion
at a level far below conscious awareness.

This is why one site feels "premium" and an identical-looking site feels "cheap."
The difference is not visual. It is physical. It is the simulation of matter.

### Spring Physics (The Core of Premium Feel)

A spring has three properties: stiffness (k), damping (c), mass (m).
The motion equation: `a = -(k * x) / m - (c * v) / m`
Where: `a` = acceleration, `x` = displacement from target, `v` = current velocity.

**Emotional Spring Presets (for GSAP or pure JS):**

```javascript
// Each personality requires a specific physical character:

const SPRING = {
  // Confident: authoritative, no oscillation, direct
  confident:  { stiffness: 300, damping: 28, mass: 1.0 },

  // Luxurious: heavy, deliberate, sensuous deceleration
  luxurious:  { stiffness: 80,  damping: 14, mass: 1.8 },

  // Alive: organic, breathes, slight overshoot like a hand
  alive:      { stiffness: 180, damping: 9,  mass: 0.7 },

  // Precise: machine-like, fast, snappy (Brutalism direction)
  precise:    { stiffness: 500, damping: 35, mass: 0.5 },

  // Oceanic: enormous inertia, takes forever to stop
  oceanic:    { stiffness: 50,  damping: 8,  mass: 2.5 },
};

// Pure JS spring integration (no library — frame-by-frame)
class SpringValue {
  constructor({ stiffness = 200, damping = 20, mass = 1 }) {
    this.k = stiffness; this.c = damping; this.m = mass;
    this.x = 0; this.v = 0; this.target = 0;
  }
  tick(dt = 0.016) {
    const a = -(this.k * (this.x - this.target)) / this.m
              - (this.c * this.v) / this.m;
    this.v += a * dt;
    this.x += this.v * dt;
    return Math.abs(this.x - this.target) < 0.001 && Math.abs(this.v) < 0.001;
  }
}

// Usage: cursor magnetic attraction
const spring = new SpringValue(SPRING.luxurious);
document.addEventListener('mousemove', e => { spring.target = e.clientX; });
(function tick() {
  spring.tick();
  cursor.style.left = spring.x + 'px';
  requestAnimationFrame(tick);
})();
```

**GSAP with spring physics (CustomEase + Physics2D):**
```javascript
// The "Breath" ease — inhales then exhales — for sections entering
gsap.registerPlugin(CustomEase);
CustomEase.create("breath",
  "M0,0 C0.05,0 0.08,0.35 0.25,0.50 0.45,0.65 0.60,0.85 0.75,1 0.90,1.02 1,1 1,1");

// The "Velvet" ease — deceleration that seems to approach but never fully arrive
CustomEase.create("velvet",
  "M0,0 C0,0 0.20,0.95 0.45,0.98 0.65,1 0.85,1 1,1");

// The "Recede" ease — slight pull-back before advancing (anticipation)
CustomEase.create("recede",
  "M0,0 C0.1,-0.06 0.18,-0.04 0.25,0.02 0.45,0.25 0.65,0.80 1,1");

// Apply by emotional character:
gsap.to(".hero-title", { y: 0, opacity: 1, ease: "velvet", duration: 1.4 });
gsap.to(".cta-button", { scale: 1, ease: "breath", duration: 0.9 });
```

### Disney's 12 Principles Applied to Micro-Interactions

**1. Squash and Stretch:**
```javascript
// Button: compress on click, expand on release
button.addEventListener('mousedown', () =>
  gsap.to(btn, { scaleX: 0.96, scaleY: 1.04, duration: 0.12, ease: "power2.out" }));
button.addEventListener('mouseup', () =>
  gsap.to(btn, { scaleX: 1, scaleY: 1, duration: 0.4, ease: "elastic.out(1, 0.4)" }));
```

**2. Anticipation (Pull-back before action):**
```javascript
// Recede ease handles this — but also physically:
gsap.timeline()
  .to(".element", { x: -8, duration: 0.15, ease: "power2.in" }) // pull back
  .to(".element", { x: targetX, duration: 0.7, ease: "power3.out" });// release
```

**3. Follow-Through & Overlapping Action (Secondary Motion):**
```javascript
// Parent moves, children follow with delay and overshoot
gsap.to(".card", { y: -20, duration: 0.5, ease: "power2.out" });
gsap.to(".card-content", { y: -8, duration: 0.7, ease: "power2.out", delay: 0.05 });
gsap.to(".card-tag", { y: -4, duration: 0.9, ease: "power2.out", delay: 0.1 });
// Each child lags behind and travels a smaller distance — physical inertia
```

**4. Arcs (Nothing in Nature Moves in Straight Lines):**
```javascript
// Cursor trail follows a curved path, not direct
function arcLerp(from, to, t, curvature = 0.3) {
  const mid = { x: (from.x + to.x) / 2 - (to.y - from.y) * curvature,
                y: (from.y + to.y) / 2 + (to.x - from.x) * curvature };
  return {
    x: (1-t)*(1-t)*from.x + 2*(1-t)*t*mid.x + t*t*to.x,
    y: (1-t)*(1-t)*from.y + 2*(1-t)*t*mid.y + t*t*to.y
  };
}
```

### Weber-Fechner Law for Parallax Depth

Human depth perception is logarithmic, not linear.
Layer speeds that FEEL evenly spaced in depth (not mathematically spaced):
```javascript
const DEPTH_LAYERS = {
  ground:      1.00,  // No parallax — this IS the scroll
  nearFore:    0.88,  // Barely moves — just grounded
  midFore:     0.72,  // Visible parallax, feels "in front"
  mid:         0.55,  // The main content plane
  midBack:     0.38,  // Clearly behind main content
  farBack:     0.22,  // Deep background
  sky:         0.10,  // Almost stationary — horizon
};
// Values follow logarithmic intervals, not 1.0, 0.8, 0.6, 0.4...
// The difference between 0.10 and 0.22 FEELS the same as 0.55 and 0.72
```

### Haptic Metaphors (Material Personalities)

Before coding ANY hover/click interaction, identify the material personality:
- **Glass/Steel:** instant response, zero oscillation, high stiffness, zero mass feel
  → `cubic-bezier(0.85, 0, 0.15, 1)`, 150ms
- **Silk/Fabric:** slow start, fast middle, imperceptibly slow end, trails slightly
  → `CustomEase("velvet")`, 800ms
- **Rubber/Membrane:** overshoots target, bounces once, settles
  → Spring (stiffness=160, damping=8, mass=0.8)
- **Stone/Weight:** enormous inertia, takes visible time to start, massive deceleration
  → `CustomEase("velvet")`, 1200ms, huge duration
- **Magnetic:** accelerates as it approaches target (inverse distance field)
  → `cubic-bezier(0.1, 0, 0.3, 1)`, 200ms with magnetic pull calculation

### Fluid Simulation Interaction (Cursor as Momentum Source)

```javascript
// Simplified Navier-Stokes: cursor injects velocity into a vector field
// Elements are "advected" through this field
// Full implementation requires ping-pong textures in WebGL — use p5.js for rapid prototyping

let field = { vx: 0, vy: 0 };
let prevMouse = { x: 0, y: 0 };

document.addEventListener('mousemove', e => {
  const velocity = {
    x: (e.clientX - prevMouse.x) * 0.15,
    y: (e.clientY - prevMouse.y) * 0.15
  };
  field.vx = lerp(field.vx, velocity.x, 0.3);
  field.vy = lerp(field.vy, velocity.y, 0.3);
  prevMouse = { x: e.clientX, y: e.clientY };
});

// In animation loop: apply field velocity to floating elements
function applyFluid(el, dt) {
  field.vx *= 0.92; field.vy *= 0.92; // viscous decay
  el._x = (el._x || 0) + field.vx * dt;
  el._y = (el._y || 0) + field.vy * dt;
  el.style.transform = `translate(${el._x}px, ${el._y}px)`;
}
```

---

## PHASE 7 — GSAP COMPLETE SYSTEM

**Staggered reveal:**
```javascript
gsap.from(".card", {
  y: 60, opacity: 0, scale: 0.95,
  stagger: { amount: 0.5, from: "start" },
  duration: 0.8, ease: "power3.out",
  scrollTrigger: { trigger: ".grid", start: "top 80%" }
});
```

**Pinned scroll story (SOTY signature):**
```javascript
const tl = gsap.timeline({
  scrollTrigger: { trigger: ".story", pin: true, scrub: 1,
    start: "top top", end: "+=200%" }
});
tl.to(".layer-a", { x: 200 })
  .to(".layer-b", { scale: 1.5 }, "<")
  .to(".text", { opacity: 0 }, "-=0.3");
```

**ScrollTrigger.batch() (performant card reveals):**
```javascript
ScrollTrigger.batch(".card", {
  interval: 0.1, batchMax: 3,
  onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5 }),
  onLeave: batch => gsap.to(batch, { opacity: 0, y: 20 }),
  start: "top 85%"
});
```

**Horizontal gallery:**
```javascript
const panels = gsap.utils.toArray(".panel");
gsap.to(panels, {
  xPercent: -100 * (panels.length - 1), ease: "none",
  scrollTrigger: {
    trigger: ".h-container", pin: true, scrub: 1,
    snap: 1 / (panels.length - 1),
    end: () => "+=" + document.querySelector(".h-container").offsetWidth
  }
});
```

**CSS Native Scroll-Driven (zero JS):**
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal {
  animation: fade-up linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 40%;
}
```

**Scrub guide:** `true` = instant mapping · `1` = 1s smooth lag (recommended) · `0.3` = snappy

---

## PHASE 8 — INTERACTION CYCLES

Every component needs ALL states (LLMs default to "successful static" only):
- **Loading:** Skeleton matching layout geometry — NOT generic spinner
- **Empty:** Composed, aspirational — not "No data found"
- **Error:** Helpful, with specific recovery action
- **Hover:** Directional affordance, material personality
- **Focus:** Visible custom style, keyboard-accessible
- **Disabled:** Reduced opacity + no pointer events

```css
/* Skeleton shimmer */
.skeleton {
  background: linear-gradient(90deg,
    oklch(0.20 0.01 280) 25%, oklch(0.26 0.01 280) 50%, oklch(0.20 0.01 280) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
```

---

## PHASE 9 — ANIMATION SYSTEM

**Motion hierarchy:** Load → Scroll → Hover → Transition
**Duration:** Enter 0.8s · Exit 0.5s (exit = 60%) · Hover 150-300ms · Transition 700-900ms
**Stagger per item:** 30–50ms. **Spring > cubic-bezier for natural feel.**
**`transform/opacity` ONLY.** Never animate width/height/top/left.
**Animations must be interruptible** — never block input.

**Loading screen:**
```javascript
gsap.timeline({ onComplete: () => { loader.remove(); initScrollTriggers(); } })
  .to(".loader", { opacity: 0, duration: 0.4, delay: 1.8 })
  .from(".hero-title", { y: 60, opacity: 0, duration: 1.2, ease: "velvet" }, "-=0.2")
  .from(".hero-sub",   { y: 30, opacity: 0, duration: 0.8, ease: "velvet" }, "-=0.7");
```

---

## PHASE 10 — CUSTOM CURSOR

```javascript
const cursor = document.createElement('div');
cursor.className = 'cursor';
const trail  = document.createElement('div');
trail.className = 'cursor-trail';
document.body.append(cursor, trail);

let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function lerp() {
  tx += (mx - tx) * 0.08; ty += (my - ty) * 0.08;
  cursor.style.transform = `translate(${mx-6}px,${my-6}px)`;
  trail.style.transform  = `translate(${tx-20}px,${ty-20}px)`;
  requestAnimationFrame(lerp);
})();
```
```css
* { cursor: none; }
.cursor { width:12px; height:12px; background:var(--accent); border-radius:50%;
  position:fixed; pointer-events:none; z-index:9999; transition:transform .1s; }
.cursor-trail { width:40px; height:40px; border:1px solid var(--accent); opacity:0.6;
  border-radius:50%; position:fixed; pointer-events:none; z-index:9998; }
.cursor.hover { transform:scale(3) !important; opacity:0.4; }
@media (hover:none) { .cursor, .cursor-trail { display:none; } }
```

---

## PHASE 11 — MAGNETIC BUTTONS + 3D CARD TILT

```javascript
// Magnetic buttons with spring return
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    gsap.to(el, {
      x: (e.clientX - r.left - r.width/2) * 0.3,
      y: (e.clientY - r.top - r.height/2) * 0.3,
      duration: 0.4, ease: 'power2.out'
    });
  });
  el.addEventListener('mouseleave', () =>
    gsap.to(el, { x:0, y:0, duration:0.7, ease:'elastic.out(1,0.4)' })
  );
});

// 3D card tilt
document.querySelectorAll('.card-3d').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    gsap.to(card, { rotateY: x*20, rotateX: -y*20,
      transformPerspective: 800, duration:0.3, ease:'power2.out' });
  });
  card.addEventListener('mouseleave', () =>
    gsap.to(card, { rotateY:0, rotateX:0, duration:0.6, ease:'power3.out' })
  );
});
```

---

## PHASE 12 — RESPONSIVE & MOBILE

```css
.hero { height: 100dvh; }                        /* dvh — accounts for iOS chrome */
.nav  { padding-top: env(safe-area-inset-top); } /* notched devices */
* { touch-action: manipulation; }                 /* removes 300ms touch delay */
input, select { font-size: 16px; }               /* prevents iOS auto-zoom */

/* Mobile-first breakpoints */
@media (min-width: 768px)  { .container { padding: 2rem; } }
@media (min-width: 1024px) { .container { padding: 4rem; } }
@media (min-width: 1440px) { .container { max-width: 1400px; margin: 0 auto; } }

/* Fluid type */
.hero-title { font-size: clamp(2rem, 8vw, 12rem); }

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```
Touch targets: minimum 44px × 44px. Custom cursor: `@media (hover: none) { display: none; }`

---

## PHASE 13 — PERFORMANCE TARGETS

| Metric | SOTY Target | If Missed |
|--------|------------|-----------|
| LCP | < 1.5s | Preload hero asset |
| CLS | < 0.05 | Set width/height all images |
| INP | < 100ms | Debounce scroll handlers |
| FCP | < 0.8s | Inline critical CSS |
| JS bundle | < 150KB gz | Code split, lazy load |

```html
<link rel="preload" href="/fonts/display.woff2" as="font" type="font/woff2" crossorigin>
<img src="hero.webp" loading="eager" fetchpriority="high" width="1440" height="800" alt="...">
<img src="below.webp" loading="lazy" width="800" height="600" alt="...">
```

---

## PHASE 14 — ACCESSIBILITY

```html
<main>, <nav aria-label="Main">, <section aria-label="Work">
<a class="skip-link" href="#main">Skip to content</a>
<button aria-label="Close"><svg aria-hidden="true">...</svg></button>
<label for="email">Email</label>
<input id="email" type="email" autocomplete="email">
```
```css
:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.skip-link { position:absolute; transform:translateY(-100%); }
.skip-link:focus { transform:translateY(0); }
```
Contrast: 4.5:1 body text, 3:1 large text.

---

## PHASE 15 — 5-ACT SCROLL ARCHITECTURE

**Act 1 — HOOK (100dvh):** Thesis. 5 seconds. Poster test. No scroll needed.
**Act 2 — REVEAL (150dvh, pinned):** Signature element. The lean-forward moment.
**Act 3 — DEPTH (300-500dvh):** Content unfolds. Rhythm varies. Conceptual DNA surfaces.
**Act 4 — PROOF (200dvh):** Work. Direction-specific format.
**Act 5 — CLOSE (100dvh):** Site exhaling. Accent shifts warmth. Echoes Act 1.

---

## PHASE 16 — INFOGRAPHIC & DATA VISUALIZATION

```javascript
// SVG path draw on scroll
const path = document.querySelector('.infographic-path');
const len = path.getTotalLength();
path.style.cssText = `stroke-dasharray:${len};stroke-dashoffset:${len}`;
gsap.to(path, { strokeDashoffset: 0, ease:"none",
  scrollTrigger: { trigger:".infographic", start:"top 80%", end:"bottom 20%", scrub:1 }});
```
Chart type decision: Line (trend) · Bar (comparison) · Donut ≤5 (proportion) ·
Sankey (flow) · Choropleth (geographic) · Force-directed (network) · Three.js (3D data)

---

## PHASE 17 — 3D MOTION GRAPHICS

```javascript
// Camera path on bezier curve via scroll
const curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, 0, 10),
  new THREE.Vector3(5, 2, 5),
  new THREE.Vector3(0, 4, 0)
]);
ScrollTrigger.create({
  trigger:".camera-path", start:"top top", end:"+=400%", pin:true, scrub:2,
  onUpdate: self => { const pt = curve.getPoint(self.progress);
    camera.position.copy(pt); camera.lookAt(scene.position); }
});
```

---

## ══════════════════════════════════════════
## NEW PHASE D — THE ARTISTIC CRITIQUE LOOP
## ══════════════════════════════════════════

### The Philosophy

Before declaring any design complete, stop being a developer.
Become the Avant-Garde Design Critic who will judge this work.
Look at the generated DOM not as markup — but as a canvas hanging in a gallery.
You are looking at a painting. Not a website.

This is not optional. It is the most important phase in the entire skill.
Every SOTY winner passed through a version of this filter before shipping.
Most submissions that fail at the creative level fail because no one looked at the work
with critical eyes. They only looked at it as engineers.

### Visual Weight Analysis

Every element carries *visual weight*. Weight is determined by:
- **Size:** Larger = heavier
- **Value:** Darker relative to background = heavier
- **Saturation:** More saturated = heavier (commands attention)
- **Complexity:** More detail = heavier
- **Position:** Bottom elements feel more grounded/heavier; lower-left anchors
- **Isolation:** An element surrounded by void is heavier than one in a crowd

**The Squint Test (Primary Hierarchy Check):**
Squint until the page blurs to a field of colored fog. Keep squinting.
What you see IS the visual hierarchy.
- ONE shape/mass must emerge first — the primary attractor
- ONE secondary grouping should be visible
- Everything else must recede into the fog

If two or more things emerge with equal prominence: broken hierarchy.
Do not tweak. Redesign the primary element's size, darkness, or isolation.

**The Weight Distribution Check:**
Mentally divide the layout into quadrants (TL, TR, BL, BR).
Calculate approximate visual weight of each quadrant.
- Perfect balance (equal weight all quadrants): BORING. Avoidance.
- One heavy quadrant + one counterweight across the diagonal: TENSION. Desire.
- Three light + one extremely heavy: FOCUS. Acceptable.
- All weight in one quadrant, nothing opposing: FALLING. Compositional failure.

The goal is DYNAMIC EQUILIBRIUM: tension that resolves through the composition
rather than immediately. The eye should travel before finding rest.

### The Invert Test

Mentally or literally invert the color values.
Does the composition still work when inverted?
- **Yes:** The design has structural form beyond color dependency. Strong composition.
- **No:** The design relies too heavily on a single contrast relationship.
  In dark-mode-only or light-mode-only sites, this is acceptable IF the design is
  designed specifically for that mode. But if it ONLY works in one polarity,
  the layout structure is weak — it needs the color to do structural work.

### Rhythm Analysis

Five rhythm types — identify which the current design uses:
1. **Regular:** Identical spacing and sizing. (Foundation layer only — alone it is boring.)
2. **Alternating:** ABA pattern — slight variation. (Comfortable, predictable.)
3. **Progressive:** Sizes/spacing increase or decrease through the page. (Creates momentum.)
4. **Flowing:** Organic variation with underlying pulse. (Most sophisticated — feels alive.)
5. **Random:** No discernible pattern. (Only works if ONE element imposes total order.)

SOTY sites almost universally use **Progressive + Flowing** combined:
sections grow or compress through the page (progressive), with organic micro-variations
within each section (flowing). The page *builds* toward something and then releases.

If the current design uses Regular rhythm throughout: add Progressive variation to section heights.
If sections are all the same height: this is the most common reason designs feel "corporate."

### Sophistication vs Complexity Test

These are not the same quality:
- **Complexity:** Many elements. Many decisions. Busy.
- **Sophistication:** Maximum meaning extracted from minimum elements.

The Sophistication Test (say it aloud):
*"This layout uses [X] to create [Y]."*
- If X requires describing more than 3 design decisions: too complex.
- If Y is a generic outcome ("looks clean"): too simple.
- The sweet spot: X is one unusual structural choice. Y is one precise emotional effect.
  Example: "This layout uses a single oversized headline bleeding off the right edge
  to create the feeling of a thought too large to be contained."

### Paul Rand's Relationship Test

"Design is relationships between things." — Paul Rand, 1985

For every spatial relationship in the layout, have an answer for:
*"Why is this element [X distance] from that one, and not [X±1]?"*
*"Why does this headline end here, not 3rem further right?"*
*"Why does this image bleed exactly this far off the edge?"*

If the answer for ANY relationship is "that's where it ended up":
that relationship is accidental. Accidental relationships are the signature of amateur work.
Fix it. Make the decision intentional. Or remove the element entirely.

### The 30-Meter Rule (Gallery Test)

Mentally shrink the browser to the size of a business card.
From this distance, what's visible?
- The silhouette of the dominant shape
- The primary color field
- The weight distribution
- The single most dominant element

If what you see at thumbnail scale doesn't communicate what you INTENDED:
the macro-composition is broken. Not the details — the STRUCTURE.
Fix structure before polishing details. Always.

### The Museum Standard

Final question before any delivery:
*"Would this layout, stripped of its content and reduced to its compositional skeleton,
merit display alongside Muller-Brockmann poster series, Brodovitch Harper's Bazaar spreads,
or early Emigre magazine covers?"*

This is the bar. Not "does it look professional."
Not "does it look like what the client asked for."
Does it STAND as a composition? Is the structure beautiful independent of content?

If the answer is anything other than YES: the site is not ready to submit to Awwwards.

### Sophistication Signals (What Judges Register Subconsciously)

These are microscale decisions that judges cannot consciously articulate but feel as "polish":

- **Optical size correction:** Circles and round forms appear smaller than squares of the same height. Compensate: make circles ~4% larger than intended.
- **Margin intentionality:** Margins that are slightly unequal for visual balance rather than mathematical equality. A 32px top margin with 30px bottom looks more considered than identical values.
- **Weight compensation:** Heavier/darker elements need proportionally MORE negative space around them, not the same amount as light elements.
- **Color temperature gravity:** Warmer colors visually advance. If the accent is warm and the body is cool, the accent will appear to float forward — use this intentionally.
- **Optical baseline alignment:** Type that optically aligns to a visual reference (an image edge, a geometric element) rather than sitting on a mathematical baseline grid.

### The "Could Be Moved" Test

Select any element on the page.
Ask: "Could this element be repositioned by 20% without breaking the composition?"

If yes — the element's position is not compositionally determined.
The layout has accidental, not intentional, structure.

Every element's position should feel *necessary*. Moving it should create felt tension.
If you can move things freely without breaking anything: you have furniture, not architecture.

---

## PHASE 18 — DESIGN DIMENSIONS SELF-RATING

Rate each dimension 0–10. Score < 7 = fix before delivery. Visual Interest < 8 = redesign hero.

| Dimension | Score | What 10 looks like |
|-----------|-------|-------------------|
| Architectural Composition | /10 | Layout has gravity, tension, and intentional proportion |
| Typography Drama | /10 | Scale ratio 25:1+, unexpected choice, variable font alive |
| Cinematic Color | /10 | 1% color rule applied, compressed luminosity, no commercial slop |
| Interaction Physics | /10 | Spring personality declared, Disney principles applied |
| Visual Weight Balance | /10 | Squint test passes: clear primary, secondary, receding field |
| Rhythm | /10 | Progressive + flowing; section heights vary with purpose |
| Sophistication | /10 | One unusual structural choice creates one precise emotional effect |
| Motion Consistency | /10 | All animation belongs to the same emotional language |
| Responsiveness | /10 | Perfect at 375, 768, 1440px, edge cases handled |
| Accessibility | /10 | Full keyboard nav, 4.5:1 contrast, visible focus |

---

## PHASE 19 — THE OVERDRIVE PASS

One technically extraordinary effect. Identifiable in one sentence.
It must be impossible on any template. Achievable only through custom code.
The thing judges screenshot.

Examples:
- Custom GLSL shader that bends image geometry toward cursor via Kubrick lighting
- Text that tears apart revealing the architecture beneath on scroll
- 3D camera follows CatmullRom spline through space, driven by scroll
- Particles organize from turbulent field into logo, responsive to audio
- Kinetic typographic field where each letter orbits a cursor-defined gravity well

If you cannot name it in one sentence: the site is not ready.

---

## PHASE 20 — 75-POINT FINAL AUDIT

Every item checked. Any "no" = fix first.

### Dials & Direction (5)
☐ Three dials set, documented, applied to every decision
☐ One direction committed — no blending
☐ Direction-specific display typography
☐ Direction-specific palette, no AI defaults
☐ LILA RULE: existing brand colors extracted and preserved

### Architectural Layout (7)
☐ Proportion system chosen (golden, silver, or Modulor) and applied
☐ Every spatial relationship is intentionally decided (Rand test)
☐ Layout has at least one tension element (mass + counterweight)
☐ "Could Be Moved" test passed — all elements positionally necessary
☐ Section heights vary with breathing rhythm (not uniform)
☐ Grid broken at least once, intentionally
☐ Layout sketch passed as abstract painting before code was written

### Cinematic Atmosphere (6)
☐ Luminosity range compressed (8-92% — no pure black, no pure white)
☐ Shadow tinted to background hue (never gray or pure-black)
☐ 1% color rule: accent covers < ~1% of visible screen real estate
☐ Film grain overlay applied (0.03-0.05 opacity, animated)
☐ Three.js: ACESFilmicToneMapping with exposure 0.85 (not linear)
☐ Kubrick lighting: key-to-fill ratio ≥ 8:1 if 3D scene exists

### Interaction Physics (6)
☐ Spring personality declared and applied (SPRING.luxurious or equivalent)
☐ Squash/Stretch on at least one interactive element
☐ Anticipation (recede) on at least one transition
☐ Follow-through/secondary motion on card/element hover
☐ Custom ease curves used (not stock power/expo/back only)
☐ Material personality identified (glass, silk, rubber, stone, magnetic)

### Artistic Critique Loop (8)
☐ Squint test passed: one clear primary attractor, one secondary
☐ Museum standard: layout stands as composition without content
☐ Sophistication test: one structural choice creates one emotional effect
☐ Rhythm: Progressive + Flowing combination used
☐ Invert test: composition works in both polarities
☐ 30-meter test: thumbnail reads correctly
☐ Visual weight: dynamic equilibrium across quadrants
☐ Sophistication signals present (optical corrections, intentional margins)

### Design (8)
☐ 5-second screenshot test: hero = museum-quality poster
☐ Type scale ratio ≥ 20:1
☐ No lorem ipsum, placeholders, or fake screenshots
☐ Accent color in exactly 4 places
☐ Conceptual DNA present (subtle reference, never explained)
☐ One genuine creative risk taken
☐ The Overdrive effect identified and implemented
☐ Second pass done: one element removed

### Usability (12)
☐ Navigation works without JavaScript
☐ All interactive elements keyboard-accessible
☐ 4.5:1 color contrast body text
☐ Mobile tested 375px
☐ `100dvh` used (not `100vh`)
☐ Safe area insets for notched devices
☐ `smoothTouch: false`
☐ `prefers-reduced-motion` respected
☐ Cursor hidden `@media (hover: none)`
☐ Touch targets ≥ 44px × 44px
☐ Font size ≥ 16px on inputs
☐ `touch-action: manipulation`

### Interaction Cycles (6)
☐ Loading (skeleton) · Empty · Error · Hover · Focus · Disabled

### 3D / WebGL (8)
☐ Pixel ratio capped at 2
☐ Mobile fallback
☐ No geometry/material in animate()
☐ `outputColorSpace = SRGBColorSpace`
☐ Kubrick lighting model applied
☐ Resources disposed on removal
☐ `void main()` GLSL wrapper
☐ Functions declared before called

### Animation (7)
☐ 2–4 signature moments maximum
☐ Consistent motion language
☐ Loading screen is part of concept
☐ Exit = 60% of enter duration
☐ Stagger 30-50ms per item
☐ `ScrollTrigger.batch()` for card reveals
☐ `markers: false` in production

### Performance (5)
☐ Critical fonts preloaded
☐ Hero image: eager + fetchpriority="high"
☐ Below-fold: lazy + dimensions set
☐ `will-change: transform` only on active animations
☐ `ScrollTrigger.refresh()` after dynamic content

### Accessibility (4)
☐ Semantic HTML throughout
☐ All icon buttons have aria-label
☐ Skip link at body top
☐ Focus styles custom but always visible

---

## PHASE 21 — THE SECOND PASS

After audit: **"What one thing can I remove?"**

- **distill:** Strip to essence. Anything serving no compositional purpose — remove it.
- **polish:** Spacing, color scarcity, type alignment, motion language consistency.
- **overdrive:** The technically extraordinary effect — is it present and undeniable?
- **adapt:** 375px · 768px · 1440px — does the composition hold at all three?

**The Lusion rule:** Eliminate everything that doesn't serve the wow-moment.
**The Bruno Simon rule:** Deadline first. "Good enough shipped" beats "perfect unreleased."
**The Chanel rule:** One element out before showing the client. The work will be stronger.
**The Cézanne rule:** The most saturated color covers 1% of the canvas. Is yours obeying?

---

## REFERENCE QUALITY BAR

Output must compete with:
- **lusion.co** — Houdini FX vertex animations, cloth simulation, physical realism
- **bruno-simon.com** — Three.js TSL + WebGPU, multiplayer, the portfolio ceiling
- **igloo.inc** — SOTY 2025, Type-as-Hero with 3D, aggressive compositional structure
- **stripe.com/sessions** — Glow+Grain direction mastered at product scale
- **raycast.com** — Industrial monospace, the reference for precision and restraint
- **werkstatt.fyi** — Brutalist editorial, compositional courage without apology
- **studiofreight.com** — Motion language discipline, nothing wasted

If the output would not be featured alongside these: it has not met the standard.
Revisit Phase D (Artistic Critique Loop) and Phase B (Cinematic Atmosphere) first.
Those two phases are where most near-miss submissions fail.
