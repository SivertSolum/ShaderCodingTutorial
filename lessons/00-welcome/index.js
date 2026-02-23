import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "Welcome",
  short: "Intro",
  tutorial: `
<h1>Welcome to Shader Art Coding</h1>
<p class="subtitle">A hands-on journey into the language of Shadertoy</p>

<h2>🎯 What is this?</h2>
<p>This is an interactive tutorial that teaches you <strong>GLSL shader programming</strong> — the same language used on <a href="https://shadertoy.com" target="_blank" style="color:var(--accent)">Shadertoy.com</a>, the world's most popular platform for shader art.</p>
<p>You'll go from zero to creating animated 3D scenes, all with pure math — no 3D models, no textures, just code.</p>

<h2>🖥️ How to use this</h2>
<p>This tutorial has <strong>two modes</strong>, toggled by the tabs above:</p>
<ul>
  <li><strong>📖 Learn</strong> — Read lessons, theory, and exercises (you're here now!)</li>
  <li><strong>💻 Code</strong> — Edit shader code and see the live result side-by-side</li>
</ul>
<p>Each lesson has exercises. Read the explanation in <strong>Learn</strong> mode, then switch to <strong>Code</strong> mode to try things out.</p>

<div class="tip">Press <code>Ctrl+Enter</code> in Code mode to compile your shader. Or click the green <strong>▶ Run</strong> button.</div>

<h2>📐 What is a shader?</h2>
<p>A shader is a tiny program that runs <strong>once for every pixel on the screen</strong>, every frame. You write a single function:</p>
<pre>void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Your code here — decide what color this pixel should be!
    fragColor = vec4(1.0, 0.0, 0.0, 1.0); // red
}</pre>
<p>That's it. The GPU runs this function millions of times in parallel — one per pixel — giving you real-time graphics at 60fps.</p>

<h2>🗂️ Lesson Roadmap</h2>
<table>
<tr><th>#</th><th>Topic</th><th>You'll Learn</th></tr>
<tr><td>01</td><td>Hello Color</td><td>UV coordinates, colors, gradients</td></tr>
<tr><td>02</td><td>Shapes</td><td>Signed Distance Functions (SDFs)</td></tr>
<tr><td>03</td><td>Transforms</td><td>Translate, rotate, scale</td></tr>
<tr><td>04</td><td>Animation</td><td>Using time, easing, motion</td></tr>
<tr><td>05</td><td>Patterns</td><td>Tiling, grids, repetition</td></tr>
<tr><td>06</td><td>Color</td><td>Palettes, HSV, gradients</td></tr>
<tr><td>07</td><td>Noise</td><td>Organic textures, FBM</td></tr>
<tr><td>08</td><td>Raymarching</td><td>3D scenes from math</td></tr>
<tr><td>09</td><td>Lighting</td><td>Shadows, reflections, AO</td></tr>
<tr><td>10</td><td>Advanced SDF</td><td>Booleans, fractals, polish</td></tr>
</table>

<h2>🔑 GLSL Quick Reference</h2>
<table>
<tr><th>Type</th><th>Example</th><th>Notes</th></tr>
<tr><td><code>float</code></td><td><code>0.5</code></td><td>Always use decimal point!</td></tr>
<tr><td><code>vec2</code></td><td><code>vec2(1.0, 2.0)</code></td><td>2D vector (positions, UVs)</td></tr>
<tr><td><code>vec3</code></td><td><code>vec3(r, g, b)</code></td><td>3D vector / RGB color</td></tr>
<tr><td><code>vec4</code></td><td><code>vec4(col, 1.0)</code></td><td>RGBA output color</td></tr>
<tr><td><code>mat2</code></td><td><code>mat2(c,-s,s,c)</code></td><td>2×2 rotation matrix</td></tr>
</table>

<h2>🌐 Shadertoy Uniforms</h2>
<p>These are provided automatically — use them in your code:</p>
<table>
<tr><th>Uniform</th><th>Type</th><th>What it is</th></tr>
<tr><td><code>iResolution</code></td><td>vec3</td><td>Canvas width, height, 1.0</td></tr>
<tr><td><code>iTime</code></td><td>float</td><td>Seconds since start</td></tr>
<tr><td><code>iTimeDelta</code></td><td>float</td><td>Time since last frame</td></tr>
<tr><td><code>iFrame</code></td><td>int</td><td>Frame counter</td></tr>
<tr><td><code>iMouse</code></td><td>vec4</td><td>Mouse position & click</td></tr>
</table>

<div class="tip">Click <strong>"01 Hello"</strong> above or select Lesson 01 from the dropdown to start coding!</div>
  `,
  code: `// Welcome! Click "01 Hello" in the lesson pills to start.
// Or switch to Code mode and play with this shader:

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    // Normalize pixel coordinates to 0..1
    vec2 uv = fragCoord / iResolution.xy;

    // Create a colorful gradient
    vec3 col = 0.5 + 0.5 * cos(iTime + uv.xyx + vec3(0, 2, 4));

    // Output
    fragColor = vec4(col, 1.0);
}`
});
