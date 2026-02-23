import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "02 — Shapes (SDFs)",
  short: "02 Shapes",
  tutorial: `
<h1>Shapes with SDFs</h1>
<p class="subtitle">Signed Distance Functions — drawing with pure math</p>

<h2>🎯 Goal</h2>
<p>Learn Signed Distance Functions (SDFs), the core technique of shader art.</p>

<h2>📐 What is an SDF?</h2>
<p>An SDF is a function that takes a point and returns the <strong>distance to the nearest surface</strong>:</p>
<ul>
  <li><strong>Positive</strong> → outside the shape</li>
  <li><strong>Zero</strong> → exactly on the boundary</li>
  <li><strong>Negative</strong> → inside the shape</li>
</ul>

<h2>⭕ SDF: Circle</h2>
<p>The simplest SDF — distance from center minus radius:</p>
<pre>float sdCircle(vec2 p, float r) {
    return length(p) - r;
}</pre>
<p>When <code>length(p) &lt; r</code>, we're inside → negative. Beautiful!</p>

<h2>◼ SDF: Box</h2>
<pre>float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0))
         + min(max(d.x, d.y), 0.0);
}</pre>
<p>Uses <code>abs()</code> for symmetry — one formula handles all 4 sides!</p>

<h2>🎨 Drawing SDFs: smoothstep</h2>
<p><code>smoothstep(a, b, x)</code> returns 0 when x&lt;a, 1 when x&gt;b, smooth curve between.</p>
<p>We use it to turn distance into a crisp, antialiased shape:</p>
<pre>float d = sdCircle(uv, 0.25);
float shape = 1.0 - smoothstep(0.0, 0.008, d);
col = mix(background, shapeColor, shape);</pre>

<h2>🔗 CSG: Combining Shapes</h2>
<p>This is where SDFs get POWERFUL:</p>
<pre>min(a, b)      // Union (combine)
max(a, b)      // Intersection (overlap only)
max(a, -b)     // Subtraction (cut b from a)</pre>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Change Sizes</div>
<p>Change the circle radius (<code>0.25</code>) and box size. Observe how the SDF works.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Move Shapes</div>
<p>Move shapes by changing their offset: <code>uv - vec2(0.3, 0.1)</code></p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — CSG Subtraction</div>
<p>Try: <code>float d = max(sdCircle(uv, 0.3), -sdBox(uv, vec2(0.15)));</code></p>
<p>This cuts a square hole in a circle!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Rounded Box</div>
<p>Round any SDF by subtracting a radius: <code>float d = sdBox(uv, vec2(0.2, 0.12)) - 0.05;</code></p>
<p>This turns the sharp corners into smooth, rounded ones. Try different rounding values.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Make a Face</div>
<p>Combine shapes! Use two small circles for eyes and a box or line for a mouth. Hint:</p>
<pre>float eyes = min(
    sdCircle(uv - vec2(-0.1, 0.08), 0.04),
    sdCircle(uv - vec2( 0.1, 0.08), 0.04)
);
float mouth = sdBox(uv - vec2(0, -0.08), vec2(0.12, 0.015));
float face = sdCircle(uv, 0.25);
float d = max(face, -min(eyes, mouth));</pre>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Glow Effect</div>
<p>Instead of a hard shape, create a soft glow:</p>
<pre>float d = sdCircle(uv, 0.1);
col += vec3(0.2, 0.5, 1.0) * (0.02 / max(abs(d), 0.001));</pre>
<p>This creates a neon-like glow around the shape. The closer to the edge, the brighter.</p>
</div>

<div class="tip">SDFs are used for EVERYTHING in shader art — 2D shapes, 3D raymarching, text, terrain. Master them and you can create anything.</div>
  `,
  code: `// LESSON 02 — Shapes with Signed Distance Functions

// SDF: Circle — distance from center minus radius
float sdCircle(vec2 p, float r) {
    return length(p) - r;
}
// ...existing code...
