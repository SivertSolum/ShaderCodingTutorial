import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "06 — Color Palettes",
  short: "06 Color",
  tutorial: `
<h1>Color Palettes</h1>
<p class="subtitle">The art of beautiful color in shaders</p>

<h2>🎯 The Cosine Palette</h2>
<p>Created by <strong>Inigo Quilez</strong> (Shadertoy's creator), this one formula generates infinite palettes:</p>
<pre>vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}</pre>
<p>Just 4 parameters: <strong>a</strong> = brightness, <strong>b</strong> = contrast, <strong>c</strong> = frequency, <strong>d</strong> = phase offset.</p>

<h2>🎨 Palette Presets</h2>
<table>
<tr><th>Name</th><th>d (phase)</th><th>Look</th></tr>
<tr><td>Rainbow</td><td><code>0.00, 0.33, 0.67</code></td><td>Full spectrum</td></tr>
<tr><td>Neon</td><td><code>0.00, 0.10, 0.20</code></td><td>Electric blue-pink</td></tr>
<tr><td>Fire</td><td><code>0.00, 0.15, 0.20</code></td><td>Warm orange-red</td></tr>
<tr><td>Ocean</td><td><code>0.50, 0.20, 0.25</code></td><td>Cool blue-green</td></tr>
</table>
<p>The <strong>d</strong> parameter is the most impactful — it controls the hue shift!</p>

<h2>🌈 HSV Color Space</h2>
<p><strong>Hue</strong> (color wheel) + <strong>Saturation</strong> (vividness) + <strong>Value</strong> (brightness). Great for rainbows and UI.</p>

<h2>☀️ Gamma Correction</h2>
<p>Screens aren't linear — apply this at the end for accurate colors:</p>
<pre>col = pow(col, vec3(0.4545)); // = 1/2.2</pre>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Swap Palettes</div>
<p>Change the <code>d</code> vector in <code>coolPalette()</code> to the presets above. Try <code>vec3(0.0, 0.1, 0.2)</code> for neon.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Palette + Pattern</div>
<p>Uncomment section 5 in the code for a mesmerizing fractal-palette combo.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Design Your Own Palette</div>
<p>Create a completely custom palette. Change ALL four parameters:</p>
<pre>return palette(t,
    vec3(0.8, 0.5, 0.4),   // a — try different base brightness
    vec3(0.2, 0.4, 0.2),   // b — contrast per channel
    vec3(2.0, 1.0, 1.0),   // c — different frequencies!
    vec3(0.0, 0.25, 0.25)  // d — phase offsets
);</pre>
<p>Each channel (RGB) cycles independently. Experiment!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Map Palette to SDF</div>
<p>Use a shape's distance to drive the palette color:</p>
<pre>float d = sdCircle(uv, 0.3);  // add sdCircle function
col = coolPalette(d * 5.0 - iTime * 0.5);</pre>
<p>The colors ripple outward from the shape!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Gradient Mapping</div>
<p>Map a grayscale value (like noise or distance) through the palette:</p>
<pre>float gray = length(uv) + 0.2 * sin(uv.x * 10.0 + iTime);
col = coolPalette(gray);</pre>
<p>This is the basic idea behind "gradient mapping" used in VFX and games.</p>
</div>
  `,
  code: `// LESSON 06 — Color Palettes

// IQ's cosine palette — the most important color function
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c * t + d));
}

// Preset: change the last vec3 to try different palettes!
vec3 coolPalette(float t) {
    return palette(t,
        vec3(0.5, 0.5, 0.5),
        vec3(0.5, 0.5, 0.5),
        vec3(1.0, 1.0, 1.0),
        vec3(0.00, 0.33, 0.67)  // ← try: (0.0,0.1,0.2) for neon
    );
}

// HSV to RGB
vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + vec3(0.0, 2.0/3.0, 1.0/3.0)) * 6.0 - 3.0);
    return c.z * mix(vec3(1.0), clamp(p - 1.0, 0.0, 1.0), c.y);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.0);

    // 1. Map distance through palette
    float dist = length(uv);
    col = coolPalette(dist - iTime * 0.4);

    // 2. Add animated concentric rings
    float rings = sin(dist * 40.0 - iTime * 5.0) * 0.5 + 0.5;
    rings = smoothstep(0.4, 0.6, rings);
    col *= 0.7 + 0.3 * rings;

    // 3. Rainbow wheel (uncomment to try):
    // float angle = atan(uv.y, uv.x) / 6.28318 + 0.5;
    // col = hsv2rgb(vec3(angle + iTime*0.1, 0.8, 0.9));

    // 5. FRACTAL PALETTE COMBO (uncomment to try):
    // vec2 p = uv;
    // float finalDist = 0.0;
    // for (float i = 0.0; i < 4.0; i++) {
    //     p = fract(p * 1.5) - 0.5;
    //     float d = length(p) * exp(-length(uv));
    //     finalDist += sin(d * 8.0 + iTime) / 8.0;
    // }
    // col = coolPalette(length(uv) + finalDist + iTime * 0.3);

    // Gamma correction
    col = pow(col, vec3(0.4545));

    fragColor = vec4(col, 1.0);
}`
});

