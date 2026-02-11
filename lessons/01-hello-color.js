window.LESSONS = window.LESSONS || [];
window.LESSONS.push({
  title: "01 — Hello Color",
  short: "01 Hello",
  tutorial: `
<h1>Hello Color</h1>
<p class="subtitle">UV coordinates, vectors, and your first gradient</p>

<h2>🎯 Goal</h2>
<p>Understand how pixels become colors. This is the foundation of everything.</p>

<h2>📐 The Coordinate System</h2>
<p>Every pixel has a position <code>fragCoord</code> in pixels (e.g. 640, 360). But we want resolution-independent code, so we <strong>normalize</strong> to 0→1:</p>
<pre>vec2 uv = fragCoord / iResolution.xy;</pre>
<p>Now <code>uv.x</code> goes 0 (left) → 1 (right), and <code>uv.y</code> goes 0 (bottom) → 1 (top).</p>

<h2>🎨 Colors in GLSL</h2>
<p>Colors are <code>vec3(red, green, blue)</code> with each channel from <strong>0.0</strong> (none) to <strong>1.0</strong> (full):</p>
<pre>vec3(1.0, 0.0, 0.0)  // pure red
vec3(0.0, 1.0, 0.0)  // pure green
vec3(0.0, 0.0, 1.0)  // pure blue
vec3(1.0, 1.0, 1.0)  // white
vec3(0.0)             // black (shorthand)</pre>

<h2>⭐ The Most Important Function: <code>mix()</code></h2>
<p><code>mix(a, b, t)</code> = linear interpolation. When t=0 you get a, when t=1 you get b, t=0.5 is halfway.</p>
<pre>mix(vec3(1,0,0), vec3(0,0,1), uv.x)
// Red on left, blue on right, purple in between!</pre>

<h2>📍 Centered Coordinates</h2>
<p>For most shader art, you want (0,0) at the <strong>center</strong> and correct aspect ratio:</p>
<pre>vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;</pre>
<p>This is the <strong>standard setup</strong> you'll use in almost every shader from here on.</p>

<div class="warn">Note: we divide by <code>iResolution.y</code> (not <code>.xy</code>) — this keeps the aspect ratio square so circles don't stretch.</div>

<h2>🧪 Exercises</h2>
<p>Switch to <strong>Code mode</strong> and try each of these. Press <code>Ctrl+Enter</code> after each change.</p>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Solid Color</div>
<p>Replace the <code>col</code> line with: <code>vec3 col = vec3(1.0, 0.0, 0.0);</code> — pure red!</p>
<p>Then try other colors: <code>vec3(0.0, 1.0, 0.5)</code> for teal, <code>vec3(1.0, 0.8, 0.0)</code> for gold.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Horizontal Gradient</div>
<p>Try: <code>vec3 col = vec3(uv.x);</code> — black on left, white on right.</p>
<p>What happens with <code>vec3(uv.y)</code>? Or <code>vec3(1.0 - uv.x)</code>?</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Two-Color Gradient</div>
<p>Use mix: <code>vec3 col = mix(vec3(1,0,0), vec3(0,0,1), uv.x);</code></p>
<p>Try mixing different color pairs. What about using <code>uv.y</code> instead of <code>uv.x</code>?</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Centered Coordinates</div>
<p>Change the UV line to the centered version and try <code>vec3 col = vec3(length(uv));</code> — you'll see a radial gradient!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Diagonal Gradient</div>
<p>Try: <code>vec3 col = vec3((uv.x + uv.y) * 0.5);</code> — a diagonal from corner to corner.</p>
<p>Experiment: multiply by different values to change the angle feel.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Checkerboard</div>
<p>Create a checkerboard pattern with:</p>
<pre>float check = mod(floor(uv.x * 8.0) + floor(uv.y * 8.0), 2.0);
vec3 col = vec3(check);</pre>
<p>Change <code>8.0</code> to other values to resize the squares.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 7 — Animated Color</div>
<p>Use time to animate! Replace col with:</p>
<pre>vec3 col = 0.5 + 0.5 * sin(iTime + uv.xyx + vec3(0, 2, 4));</pre>
<p>This creates a smoothly shifting rainbow. Try changing the <code>vec3(0, 2, 4)</code> offsets.</p>
</div>

<div class="tip">After each change, press <code>Ctrl+Enter</code> to see the result. Experiment freely — you can always reload the lesson to reset the code!</div>
  `,
  code: `// LESSON 01 — Hello Color
// Your first shader! Change values and press Ctrl+Enter.

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Step 1: Normalize pixel coordinates to 0.0 → 1.0
    vec2 uv = fragCoord / iResolution.xy;

    // Step 2: Create a color using UV coordinates
    // uv.x = 0 on left, 1 on right
    // uv.y = 0 on bottom, 1 on top
    vec3 col = vec3(uv.x, uv.y, 0.5);

    // TRY THESE (replace the line above):
    // vec3 col = vec3(1.0, 0.0, 0.0);             // solid red
    // vec3 col = vec3(uv.x);                       // horizontal gradient
    // vec3 col = mix(vec3(1,0,0), vec3(0,0,1), uv.x); // red→blue
    // vec3 col = vec3((uv.x + uv.y) * 0.5);       // diagonal
    // float check = mod(floor(uv.x*8.0)+floor(uv.y*8.0), 2.0);
    // vec3 col = vec3(check);                       // checkerboard

    // Step 3: Output the color (alpha = 1.0 = fully opaque)
    fragColor = vec4(col, 1.0);
}`
});

