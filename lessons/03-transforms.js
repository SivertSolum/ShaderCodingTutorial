window.LESSONS = window.LESSONS || [];
window.LESSONS.push({
  title: "03 — Transformations",
  short: "03 Transform",
  tutorial: `
<h1>Transformations</h1>
<p class="subtitle">Translate, rotate, and scale — by moving space, not shapes</p>

<h2>🎯 Key Insight</h2>
<p>In shader land, you don't move shapes — you move the <strong>coordinate system</strong>. And it works in <strong>reverse</strong>:</p>
<ul>
  <li>To move a shape <strong>right</strong> → <strong>subtract</strong> from coordinates</li>
  <li>To make a shape <strong>bigger</strong> → <strong>divide</strong> coordinates</li>
  <li>To rotate a shape <strong>clockwise</strong> → rotate coords <strong>counter-clockwise</strong></li>
</ul>
<p>Why? Because for each pixel we ask: "In the shape's local space, where would this point be?"</p>

<h2>📍 Translation</h2>
<pre>vec2 p = uv - vec2(0.3, 0.2);  // move shape to (0.3, 0.2)
float d = sdCircle(p, 0.1);</pre>

<h2>🔄 Rotation</h2>
<p>The 2D rotation matrix — memorize this, you'll use it constantly:</p>
<pre>mat2 rot2D(float angle) {
    float c = cos(angle), s = sin(angle);
    return mat2(c, -s, s, c);
}

vec2 p = rot2D(iTime) * uv; // spin!</pre>

<h2>📏 Scale</h2>
<pre>float scale = 2.0;
vec2 p = uv / scale;
float d = sdCircle(p, 0.1) * scale; // fix distance!</pre>
<div class="warn">When scaling SDFs, multiply the result by the scale factor to keep distances correct.</div>

<h2>🎪 Combining Transforms</h2>
<p>Order matters! Translate first, then rotate = orbit. Rotate first, then translate = rotate in place then shift.</p>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Rotation Speed</div>
<p>Change the rotation speed: multiply <code>iTime</code> by different values. Try <code>iTime * 3.0</code> or <code>iTime * 0.2</code>.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — More Orbiting Shapes</div>
<p>Add more shapes to the orbit — change <code>6.0</code> to <code>12.0</code> in the loop count.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Pulsing Orbit</div>
<p>Make the orbit radius pulse: replace <code>0.25</code> with <code>0.25 + 0.1 * sin(iTime * 2.0)</code></p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Orbit Path Ring</div>
<p>Visualize the orbit path! Add a ring SDF at the orbit radius:</p>
<pre>float ring = abs(length(uv - vec2(0.0, -0.3)) - 0.25) - 0.002;
col = mix(col, vec3(0.2, 0.2, 0.3), 1.0 - smoothstep(0.0, 0.008, ring));</pre>
<p>Add this before the orbiting squares loop.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Nested Rotations</div>
<p>Make the rotating box spin around TWO axes. Try applying <code>rot2D()</code> twice with different speeds:</p>
<pre>p = rot2D(iTime) * p;
p = rot2D(iTime * 2.5) * p;  // second rotation!</pre>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Scale + Rotate Combo</div>
<p>Add a shape that both scales and rotates. Try:</p>
<pre>vec2 p = uv - vec2(0.5, -0.3);
float sc = 1.0 + 0.3 * sin(iTime);
p = rot2D(iTime * 0.8) * p / sc;
float d = sdBox(p, vec2(0.06)) * sc;</pre>
</div>
  `,
  code: `// LESSON 03 — Transformations

float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

// 2D Rotation matrix — memorize this!
mat2 rot2D(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;
    vec3 col = vec3(0.05);

    // 1. TRANSLATION — shift the coordinate system
    {
        vec2 p = uv - vec2(-0.5, 0.2);
        float d = sdCircle(p, 0.1);
        col = mix(col, vec3(0.2, 0.6, 1.0), 1.0 - smoothstep(0.0, 0.008, d));
    }

    // 2. ROTATION — multiply by rotation matrix
    {
        vec2 p = uv - vec2(0.0, 0.2);
        p = rot2D(iTime) * p;  // animated rotation!
        float d = sdBox(p, vec2(0.08));
        col = mix(col, vec3(1.0, 0.3, 0.5), 1.0 - smoothstep(0.0, 0.008, d));
    }

    // 3. SCALE — divide coords, correct SDF distance
    {
        vec2 p = uv - vec2(0.5, 0.2);
        float scale = 1.5 + 0.5 * sin(iTime);
        p /= scale;
        float d = sdCircle(p, 0.1) * scale;
        col = mix(col, vec3(0.3, 1.0, 0.5), 1.0 - smoothstep(0.0, 0.008, d));
    }

    // 4. COMBINED — Orbiting squares!
    {
        for (float i = 0.0; i < 6.0; i++) {
            float angle = iTime * 0.8 + i * 6.28318 / 6.0;
            float radius = 0.25;
            vec2 p = uv - vec2(0.0, -0.3);
            p -= radius * vec2(cos(angle), sin(angle));
            p = rot2D(angle * 2.0) * p;
            float d = sdBox(p, vec2(0.03));
            vec3 c = 0.5 + 0.5 * cos(vec3(0, 2, 4) + i * 0.8);
            col = mix(col, c, 1.0 - smoothstep(0.0, 0.008, d));
        }
    }

    fragColor = vec4(col, 1.0);
}`
});

