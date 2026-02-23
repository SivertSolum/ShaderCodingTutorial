import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "04 — Animation",
  short: "04 Animate",
  tutorial: `
<h1>Animation</h1>
<p class="subtitle">Bringing shaders to life with time</p>

<h2>🎯 The Secret</h2>
<p>Everything in shader animation comes from <strong>one variable</strong>: <code>iTime</code> — seconds since the shader started.</p>

<h2>⚡ Essential Functions</h2>
<table>
<tr><th>Expression</th><th>Result</th></tr>
<tr><td><code>sin(iTime)</code></td><td>Smooth oscillation -1 → +1</td></tr>
<tr><td><code>sin(iTime)*0.5+0.5</code></td><td>Remap to 0 → 1</td></tr>
<tr><td><code>fract(iTime)</code></td><td>Sawtooth: 0→1, 0→1, ...</td></tr>
<tr><td><code>abs(sin(iTime))</code></td><td>Bounce (always positive)</td></tr>
<tr><td><code>sin(iTime + offset)</code></td><td>Phase offset (stagger)</td></tr>
<tr><td><code>sin(iTime + uv.x * freq)</code></td><td>Traveling wave!</td></tr>
</table>

<h2>🏐 Easing Functions</h2>
<p>Map linear 0→1 to curved 0→1 for natural-feeling motion:</p>
<pre>// Smooth in-out
float easeInOut(float t) {
    return t * t * (3.0 - 2.0 * t);
}

// Bouncy landing
float easeBounce(float t) {
    t = 1.0 - t;
    return 1.0 - abs(sin(t*3.14 * (0.2+2.5*t*t*t)) * pow(1.0-t, 2.2));
}</pre>

<h2>🌊 Traveling Waves</h2>
<p>Offset the phase by position to create waves:</p>
<pre>float wave = sin(uv.x * 15.0 - iTime * 4.0) * 0.05;</pre>
<p>Each column oscillates, but shifted in time → wave motion!</p>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Wave Parameters</div>
<p>Change the wave speed (the <code>4.0</code> multiplier) and frequency (<code>15.0</code>). Higher frequency = tighter waves. Higher speed = faster motion.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Heartbeat Pulse</div>
<p>Try a sharp pulse: <code>float pulse = pow(fract(-iTime), 10.0);</code></p>
<p>Use it to scale a circle: <code>sdCircle(uv, 0.1 + 0.05 * pulse)</code></p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Stagger More</div>
<p>Change the number of circles (from <code>8.0</code> to <code>16.0</code>) and the delay between them (change <code>0.15</code>).</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Ping-Pong Motion</div>
<p>Create smooth back-and-forth motion:</p>
<pre>float t = abs(fract(iTime * 0.5) * 2.0 - 1.0); // 0→1→0→1...
vec2 pos = mix(vec2(-0.3, 0.0), vec2(0.3, 0.0), t);</pre>
<p>Move a shape between two positions with this ping-pong value.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Spiral Motion</div>
<p>Combine radius and angle to create a spiral:</p>
<pre>float angle = iTime * 2.0;
float radius = 0.05 + 0.15 * fract(iTime * 0.3);
vec2 pos = radius * vec2(cos(angle), sin(angle));</pre>
<p>The shape spirals outward and resets.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Mouse Interaction</div>
<p>Use the mouse position to interact! <code>iMouse.xy</code> gives the last click position:</p>
<pre>vec2 mouseUV = (iMouse.xy - 0.5 * iResolution.xy) / iResolution.y;
float d = sdCircle(uv - mouseUV, 0.1);</pre>
<p>Click the canvas and the shape follows your mouse.</p>
</div>
  `,
  code: `// LESSON 04 — Animation

float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}
mat2 rot2D(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

// Easing: smooth in-out
float easeInOut(float t) { return t * t * (3.0 - 2.0 * t); }
// Easing: bouncy
float easeBounce(float t) {
    t = 1.0 - t;
    return 1.0 - abs(sin(t * 3.14159 * (0.2 + 2.5*t*t*t)) * pow(1.0-t, 2.2));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.02, 0.02, 0.05);

    // 1. PULSING GLOW
    {
        float pulse = 0.15 + 0.05 * sin(iTime * 3.0);
        float d = sdCircle(uv - vec2(-0.6, 0.25), pulse);
        float glow = exp(-8.0 * max(d, 0.0));
        col += vec3(0.2, 0.5, 1.0) * glow;
    }

    // 2. TRAVELING WAVE
    {
        float wave = sin(uv.x * 15.0 - iTime * 4.0) * 0.05;
        float d = abs(uv.y - wave) - 0.003;
        col += vec3(0.0, 1.0, 0.6) * (1.0 - smoothstep(0.0, 0.008, d));
    }

    // 3. BOUNCING BALL
    {
        float t = fract(iTime * 0.5);
        float y = easeBounce(t) * 0.4 - 0.2;
        float d = sdCircle(uv - vec2(-0.2, y), 0.04);
        col = mix(col, vec3(1.0, 0.4, 0.2), 1.0 - smoothstep(0.0, 0.008, d));
    }

    // 4. STAGGERED DOTS
    {
        for (float i = 0.0; i < 8.0; i++) {
            float delay = i * 0.15;
            float t = easeInOut(fract(iTime * 0.7 - delay));
            float x = mix(-0.4, 0.4, i / 7.0);
            float y = -0.35 + t * 0.15;
            float d = sdCircle(uv - vec2(x, y), 0.02 + 0.01*sin(iTime*2.0+i));
            vec3 c = 0.5 + 0.5 * cos(vec3(0,2,4) + i*0.5 + iTime);
            col = mix(col, c, 1.0 - smoothstep(0.0, 0.008, d));
        }
    }

    // 5. MORPHING SHAPE (circle ↔ square)
    {
        vec2 p = uv - vec2(0.5, 0.25);
        p = rot2D(iTime * 0.5) * p;
        float t = sin(iTime) * 0.5 + 0.5;
        float d = mix(sdCircle(p, 0.1), sdBox(p, vec2(0.08)), t);
        vec3 c = mix(vec3(1.0,0.2,0.5), vec3(0.5,0.2,1.0), t);
        col = mix(col, c, 1.0 - smoothstep(0.0, 0.008, d));
    }

    fragColor = vec4(col, 1.0);
}`
});

