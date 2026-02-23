import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "09 — Lighting",
  short: "09 Light",
  tutorial: `
<h1>Lighting</h1>
<p class="subtitle">Phong shading, soft shadows, and ambient occlusion</p>

<h2>🎯 Phong Lighting Model</h2>
<p>Three components that create convincing 3D lighting:</p>
<ul>
  <li><strong>Ambient</strong> — constant base light, prevents pure black</li>
  <li><strong>Diffuse</strong> — <code>max(dot(normal, lightDir), 0.0)</code> — how much surface faces the light</li>
  <li><strong>Specular</strong> — <code>pow(dot(half, normal), shininess)</code> — shiny highlight</li>
</ul>
<pre>col = baseColor * (ambient + diffuse * shadow)
    + specularColor * specular * shadow;</pre>

<h2>🌘 Soft Shadows</h2>
<p>March a ray from surface toward the light. Track the closest pass:</p>
<pre>result = min(result, k * d / t); // k = softness</pre>
<p>Lower <code>k</code> = softer shadows. This is one of raymarching's superpowers!</p>

<h2>🕳️ Ambient Occlusion (AO)</h2>
<p>Step along the surface normal. If the SDF is less than expected, something is nearby → darken.</p>
<pre>float dist = 0.05 * float(i);
float d = scene(p + normal * dist);
ao += weight * (dist - d);</pre>
<p>AO adds subtle darkening in crevices and corners — huge visual impact for cheap!</p>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Shadow Softness</div>
<p>Change the shadow <code>k</code> from <code>16.0</code> to <code>4.0</code> for much softer shadows. Try <code>64.0</code> for hard shadows.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Specular Power</div>
<p>Change <code>32.0</code> to <code>128.0</code> for tighter, shinier highlights. Or <code>4.0</code> for a matte, spread-out highlight.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Remove AO</div>
<p>Set <code>ao = 1.0;</code> right after it's computed (no occlusion) to see what AO contributes. Then re-enable it.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Colored Lights</div>
<p>Tint the diffuse light! Instead of white light, multiply by a color:</p>
<pre>col = baseCol * (0.08 + diff * shadow * 0.9 * vec3(1.0, 0.9, 0.7)) * ao;</pre>
<p>Try warm <code>vec3(1.0, 0.85, 0.6)</code> or cool <code>vec3(0.7, 0.85, 1.0)</code>.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Move the Light</div>
<p>Change the light position <code>vec3(3, 5, -2)</code> to other values. Try placing it directly above at <code>vec3(0, 10, 0)</code> or behind the camera.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Rim Lighting</div>
<p>Add a rim/fresnel effect — highlights edges facing away from camera:</p>
<pre>float rim = pow(1.0 - max(dot(n, normalize(ro - p)), 0.0), 3.0);
col += vec3(0.3, 0.5, 1.0) * rim * 0.4;</pre>
<p>This gives objects a backlit glow effect.</p>
</div>
  `,
  code: `// LESSON 09 — Lighting: Phong, Shadows, AO

#define MAX_STEPS 100
#define MAX_DIST  50.0
#define EPSILON   0.001

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
}

float scene(vec3 p) {
    float ground = p.y + 1.0;
    float s1 = sdSphere(p - vec3(0, 0.5+0.2*sin(iTime*1.5), 0), 0.6);
    float s2 = sdSphere(p - vec3(0.8*sin(iTime), 0.3, 0.8*cos(iTime)), 0.35);
    float s3 = sdSphere(p - vec3(-0.7*cos(iTime*0.7), 0.4, 0.5*sin(iTime*0.9)), 0.3);
    float blob = smin(smin(s1, s2, 0.5), s3, 0.5);
    return min(ground, blob);
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0.0);
    return normalize(vec3(
        scene(p+e.xyy)-scene(p-e.xyy),
        scene(p+e.yxy)-scene(p-e.yxy),
        scene(p+e.yyx)-scene(p-e.yyx)
    ));
}

float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        float d = scene(ro + rd * t);
        if (d < EPSILON) return t;
        t += d;
        if (t > MAX_DIST) break;
    }
    return -1.0;
}

// Soft shadows — k controls softness
float softShadow(vec3 ro, vec3 rd, float mint, float maxt, float k) {
    float res = 1.0;
    float t = mint;
    for (int i = 0; i < 64; i++) {
        float d = scene(ro + rd * t);
        if (d < EPSILON) return 0.0;
        res = min(res, k * d / t);
        t += clamp(d, 0.02, 0.2);
        if (t > maxt) break;
    }
    return clamp(res, 0.0, 1.0);
}

// Ambient Occlusion
float calcAO(vec3 p, vec3 n) {
    float ao = 0.0, w = 1.0;
    for (int i = 1; i <= 5; i++) {
        float d = 0.05 * float(i);
        ao += w * (d - scene(p + n * d));
        w *= 0.5;
    }
    return clamp(1.0 - 3.0 * ao, 0.0, 1.0);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    vec3 ro = vec3(0, 2, -4);
    vec3 rd = normalize(vec3(uv, 1.2));
    float a = iTime * 0.25;
    ro.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * ro.xz;
    rd.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * rd.xz;

    vec3 col = mix(vec3(0.1,0.1,0.2), vec3(0.4,0.5,0.8), uv.y+0.5);
    float dist = raymarch(ro, rd);

    if (dist > 0.0) {
        vec3 p = ro + rd * dist;
        vec3 n = getNormal(p);

        // Material
        vec3 baseCol = (p.y < -0.99)
            ? mix(vec3(0.15), vec3(0.4), mod(floor(p.x)+floor(p.z), 2.0))
            : 0.5 + 0.5 * n;

        // Phong lighting
        vec3 lightDir = normalize(vec3(3, 5, -2) - p);
        vec3 halfDir  = normalize(lightDir + normalize(ro - p));
        float diff    = max(dot(n, lightDir), 0.0);
        float spec    = pow(max(dot(n, halfDir), 0.0), 32.0);
        float shadow  = softShadow(p + n*0.01, lightDir, 0.02, 10.0, 16.0);
        float ao      = calcAO(p, n);

        col = baseCol * (0.08 + diff * shadow * 0.9) * ao;
        col += vec3(1, 0.95, 0.9) * spec * shadow * 0.5;
        col = mix(col, vec3(0.1,0.1,0.2), 1.0-exp(-0.04*dist*dist));
    }

    col = pow(col, vec3(0.4545));
    col *= 1.0 - 0.3 * length(uv);
    fragColor = vec4(col, 1.0);
}`
});

