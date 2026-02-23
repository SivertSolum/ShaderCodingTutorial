import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "07 — Noise",
  short: "07 Noise",
  tutorial: `
<h1>Noise</h1>
<p class="subtitle">The texture of nature — clouds, fire, terrain, organic shapes</p>

<h2>🎯 What is Noise?</h2>
<p>A function that returns smooth, random-looking values. Unlike <code>hash()</code> (which is choppy), noise transitions smoothly between values — perfect for natural-looking things.</p>

<h2>🏗️ How Value Noise Works</h2>
<ol>
  <li>Place random values at integer grid points</li>
  <li>For points between grid points, <strong>interpolate smoothly</strong></li>
  <li>Use a smooth curve (cubic hermite) for the interpolation</li>
</ol>
<pre>vec2 u = f * f * (3.0 - 2.0 * f); // smooth curve</pre>

<h2>🌊 FBM — Fractal Brownian Motion</h2>
<p>Layer multiple <strong>octaves</strong> of noise at different scales:</p>
<pre>for (int i = 0; i < 6; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;   // finer detail each octave
    amplitude *= 0.5;   // less influence each octave
}</pre>
<p>Result: rich, detailed, natural patterns. The more octaves, the more detail.</p>

<h2>🌀 Domain Warping</h2>
<p>Use noise to distort the input of MORE noise:</p>
<pre>vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
float result = fbm(p + 4.0 * q);</pre>
<p>This creates amazingly organic, alien-looking patterns.</p>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — FBM Clouds</div>
<p>Uncomment section 2 in the code to see cloud-like noise. Change the <code>3.0</code> multiplier to zoom in/out.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Warped FBM</div>
<p>Uncomment section 3 for alien organic patterns. This is domain warping in action!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Fire</div>
<p>Uncomment section 4 — scrolling FBM + warm colors = fire!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Octave Count</div>
<p>Change the loop count in <code>fbm()</code> from 6 to 2 (smooth) or 10 (detailed). See how more octaves add finer texture.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Terrain Heightmap</div>
<p>Use FBM as a height value and shade by "altitude":</p>
<pre>float h = fbm(uv * 4.0 + iTime * 0.1);
vec3 terrain = mix(vec3(0.0, 0.2, 0.5), vec3(0.0, 0.6, 0.2), smoothstep(0.3, 0.5, h));
terrain = mix(terrain, vec3(0.8, 0.8, 0.9), smoothstep(0.65, 0.75, h));
col = terrain;</pre>
<p>Water → grass → snow based on height!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Noise-Deformed Circle</div>
<p>Uncomment section 5 to see a circle with noise-deformed edges. Change the <code>0.1</code> noise strength to make it more or less blobby.</p>
</div>
  `,
  code: `// LESSON 07 — Noise

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Value Noise — smooth random values on a grid
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f); // smooth interpolation
    float a = hash(i + vec2(0,0));
    float b = hash(i + vec2(1,0));
    float c = hash(i + vec2(0,1));
    float d = hash(i + vec2(1,1));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// FBM — Fractal Brownian Motion (layered noise)
float fbm(vec2 p) {
    float val = 0.0, amp = 0.5, freq = 1.0;
    for (int i = 0; i < 6; i++) {
        val += amp * noise(p * freq);
        freq *= 2.0;
        amp  *= 0.5;
        p += vec2(3.12, 7.53);
    }
    return val;
}

// Domain-warped FBM (organic alien shapes)
float warpedFbm(vec2 p) {
    vec2 q = vec2(fbm(p), fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(
        fbm(p + 4.0*q + vec2(1.7,9.2) + 0.15*iTime),
        fbm(p + 4.0*q + vec2(8.3,2.8) + 0.126*iTime)
    );
    return fbm(p + 4.0 * r);
}

vec3 pal(float t) {
    return 0.5 + 0.5*cos(6.28318*(t + vec3(0.0, 0.33, 0.67)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.0);

    // ═══ Uncomment ONE section ═══

    // — 1. RAW NOISE —
    float n = noise(uv * 8.0 + iTime);
    col = vec3(n);

    // — 2. FBM CLOUDS —
    // float n = fbm(uv * 3.0 + iTime * 0.2);
    // col = mix(vec3(0.1, 0.2, 0.5), vec3(0.9, 0.9, 1.0), n);

    // — 3. WARPED FBM (alien) —
    // float n = warpedFbm(uv * 2.0);
    // col = pal(n + iTime * 0.1);

    // — 4. FIRE —
    // vec2 p = uv * 3.0;
    // p.y -= iTime * 0.5;
    // float n = fbm(p);
    // n = pow(n, 2.0);
    // col = mix(vec3(0.1,0,0), vec3(1.0,0.3,0.0), n);
    // col += vec3(1.0, 0.8, 0.2) * pow(n, 4.0);

    // — 5. NOISY SHAPE —
    // float d = length(uv) - 0.3;
    // float n = fbm(uv * 5.0 + iTime * 0.3);
    // d += n * 0.1;
    // col = mix(vec3(0.8,0.2,0.5), vec3(0.05), smoothstep(0.0, 0.02, d));
    // col += vec3(0.9,0.3,0.6) * exp(-6.0*max(d,0.0));

    fragColor = vec4(col, 1.0);
}`
});

