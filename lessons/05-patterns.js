import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "05 — Patterns",
  short: "05 Pattern",
  tutorial: `
<h1>Patterns</h1>
<p class="subtitle">Repetition, grids, and tiling — complexity from simplicity</p>

<h2>🎯 The Secret</h2>
<p>Complex-looking shader art is usually just <strong>one shape repeated</strong>. The key operation is <code>fract()</code>.</p>

<h2>🔁 Domain Repetition</h2>
<pre>float freq = 8.0;
vec2 cell = fract(uv * freq) - 0.5;  // local coords
vec2 id   = floor(uv * freq);        // cell index</pre>
<p><code>cell</code> repeats -0.5→0.5 in every tile. <code>id</code> tells you which tile you're in (integers).</p>

<h2>🎲 Randomness Per Cell</h2>
<p>Use a hash function to give each cell a "random" value:</p>
<pre>float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}
float rnd = hash(id); // unique per cell!</pre>

<h2>🔵 Polar Repetition</h2>
<p>Repeat around a circle (kaleidoscope):</p>
<pre>float angle = atan(uv.y, uv.x);
float segments = 8.0;
angle = mod(angle, 6.28318/segments) - 3.14159/segments;</pre>

<h2>🧩 Truchet Tiles</h2>
<p>Randomly flip tiles to create connected patterns — maze-like art from simple arcs!</p>

<div class="tip">The current code shows a basic grid. Uncomment different sections in the code to explore each pattern type!</div>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Grid Frequency</div>
<p>Change frequency from <code>8.0</code> to other values. See how the grid scales.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Random Grid</div>
<p>Uncomment section 2 (Variation per cell) to see random sizes and colors.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Truchet</div>
<p>Uncomment section 5 (Truchet tiles) for a stunning connected pattern.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Brick Offset</div>
<p>Create a brick-like pattern by offsetting every other row:</p>
<pre>vec2 p = uv * 8.0;
if (mod(floor(p.y), 2.0) == 1.0) p.x += 0.5;
vec2 cell = fract(p) - 0.5;</pre>
<p>This staggers the columns, just like a brick wall!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Hexagonal Grid</div>
<p>Challenge: hexagonal grids use a different math. Try this setup in place of section 1:</p>
<pre>vec2 p = uv * 6.0;
vec2 a = mod(p, 2.0) - 1.0;
vec2 b = mod(p + 1.0, 2.0) - 1.0;
float d = min(dot(a, a), dot(b, b));
col = vec3(smoothstep(0.0, 0.05, sqrt(d) - 0.5));</pre>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Animated Truchet</div>
<p>Make the Truchet tiles animate! In section 5, change the flip threshold to use time:</p>
<pre>if (hash(id) > 0.5 + 0.3 * sin(iTime + id.x * 0.5)) cell.x = -cell.x;</pre>
<p>Watch as the maze pattern shifts and morphs over time.</p>
</div>
  `,
  code: `// LESSON 05 — Patterns

float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
mat2 rot2D(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.0);

    // ═══ Uncomment ONE section at a time ═══

    // — 1. BASIC GRID —
    float freq = 8.0;
    vec2 cell = fract(uv * freq) - 0.5;
    vec2 id   = floor(uv * freq);
    float d = sdCircle(cell, 0.3);
    col = vec3(1.0 - smoothstep(0.0, 0.02, d));

    // — 2. RANDOM VARIATION —
    // float freq = 8.0;
    // vec2 cell = fract(uv * freq) - 0.5;
    // vec2 id   = floor(uv * freq);
    // float rnd = hash(id);
    // float d = sdCircle(cell, 0.1 + 0.2 * rnd);
    // vec3 cellCol = 0.5 + 0.5 * cos(vec3(0,2,4) + rnd * 6.28);
    // col = cellCol * (1.0 - smoothstep(0.0, 0.02, d));

    // — 3. ANIMATED GRID —
    // float freq = 6.0;
    // vec2 cell = fract(uv * freq + iTime * 0.3) - 0.5;
    // vec2 id   = floor(uv * freq + iTime * 0.3);
    // float rnd = hash(id);
    // cell = rot2D(iTime + rnd * 6.28) * cell;
    // float d = sdBox(cell, vec2(0.15 + 0.1*sin(iTime + rnd*6.28)));
    // vec3 cellCol = 0.5 + 0.5*cos(vec3(0,2,4) + rnd*6.28 + iTime);
    // col = cellCol * (1.0 - smoothstep(0.0, 0.02, d));

    // — 4. POLAR REPETITION (kaleidoscope) —
    // float angle = atan(uv.y, uv.x);
    // float radius = length(uv);
    // float segments = 8.0;
    // angle = mod(angle, 6.28318/segments) - 3.14159/segments;
    // vec2 p = vec2(cos(angle), sin(angle)) * radius;
    // float d = sdBox(p - vec2(0.3, 0.0), vec2(0.05, 0.02));
    // col = vec3(1.0, 0.5, 0.2) * (1.0 - smoothstep(0.0, 0.005, d));
    // d = abs(radius - 0.3) - 0.002;
    // col += vec3(0.2, 0.5, 1.0) * (1.0 - smoothstep(0.0, 0.005, d));

    // — 5. TRUCHET TILES —
    // float freq = 8.0;
    // vec2 cell = fract(uv * freq) - 0.5;
    // vec2 id   = floor(uv * freq);
    // if (hash(id) > 0.5) cell.x = -cell.x;
    // float d1 = abs(length(cell - vec2(0.5, 0.5)) - 0.5) - 0.05;
    // float d2 = abs(length(cell - vec2(-0.5,-0.5)) - 0.5) - 0.05;
    // float d = min(d1, d2);
    // col = vec3(0.9) * (1.0 - smoothstep(0.0, 0.01, d));
    // col += vec3(0.0, 0.3, 0.6) * exp(-4.0 * max(d, 0.0));

    fragColor = vec4(col, 1.0);
}`
});

