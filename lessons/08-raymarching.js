window.LESSONS = window.LESSONS || [];
window.LESSONS.push({
  title: "08 — Raymarching",
  short: "08 Raymarch",
  tutorial: `
<h1>Raymarching</h1>
<p class="subtitle">Entering the third dimension with sphere tracing</p>

<h2>🎯 The Big Idea</h2>
<p>Raymarching lets you render <strong>3D scenes entirely from math</strong>. No geometry, no meshes — just SDFs in 3D.</p>

<h2>📐 The Algorithm</h2>
<ol>
  <li>For each pixel, cast a <strong>ray</strong> from the camera</li>
  <li>March along the ray in steps</li>
  <li>At each step, ask the SDF: "how far am I from any surface?"</li>
  <li>Step forward by that distance (guaranteed safe!)</li>
  <li>If distance &lt; tiny epsilon → <strong>HIT!</strong></li>
  <li>If total distance too far → <strong>MISS</strong></li>
</ol>
<pre>for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dist;
    float d = scene(p);
    if (d < EPSILON) break; // hit!
    dist += d;
    if (dist > MAX_DIST) break; // miss
}</pre>

<h2>🎥 Camera Setup</h2>
<pre>vec3 ro = vec3(0, 2, -5);           // ray origin (camera)
vec3 rd = normalize(vec3(uv, 1.0));  // ray direction</pre>
<p>The <code>1.0</code> in rd controls field of view (smaller = wider FOV).</p>

<h2>📐 3D SDFs</h2>
<p>Same concept as 2D but with <code>vec3</code>:</p>
<pre>float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdPlane(vec3 p)  { return p.y; } // y=0 plane</pre>

<h2>🔍 Computing Normals</h2>
<p>The normal = gradient of the SDF. We estimate it by sampling 6 nearby points:</p>
<pre>vec3 getNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
        scene(p+e.xyy) - scene(p-e.xyy),
        scene(p+e.yxy) - scene(p-e.yxy),
        scene(p+e.yyx) - scene(p-e.yyx)
    ));
}</pre>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Camera Position</div>
<p>Change camera position <code>ro</code> — try <code>vec3(3, 1, -3)</code> or <code>vec3(0, 5, -2)</code> for a top-down view.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Add a Sphere</div>
<p>Add a new sphere to the <code>scene()</code> function:</p>
<pre>float s2 = sdSphere(p - vec3(-2, 0.5, 1), 0.4);
return min(ground, min(sphere, min(box, min(torus, s2))));</pre>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Smooth Union</div>
<p>Replace <code>min(sphere, box)</code> with a smooth version that blends shapes:</p>
<pre>float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k*h*(1.0-h);
}
// Then use: smin(sphere, box, 0.5)</pre>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — Add Another Object</div>
<p>Add a cylinder or second torus at a different position. Combine with <code>min()</code> into the scene.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Change FOV</div>
<p>In the camera setup, change the <code>1.0</code> in <code>vec3(uv, 1.0)</code>:</p>
<ul>
  <li><code>0.5</code> → very wide angle (fisheye feel)</li>
  <li><code>2.0</code> → telephoto (zoomed in)</li>
</ul>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Stop the Orbit</div>
<p>Remove the camera orbit by deleting the two <code>ro.xz</code> and <code>rd.xz</code> rotation lines. Then manually set the camera angle.</p>
</div>
  `,
  code: `// LESSON 08 — Raymarching: 3D from Pure Math

#define MAX_STEPS 100
#define MAX_DIST  100.0
#define EPSILON   0.001

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}
float sdPlane(vec3 p) { return p.y; }
float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

// The scene — combine all objects
float scene(vec3 p) {
    float ground = sdPlane(p + vec3(0, 1, 0));
    float sphere = sdSphere(p - vec3(0, 0.5+0.3*sin(iTime), 0), 0.5);

    vec3 bp = p - vec3(2, 0, 0);
    float a = iTime * 0.7;
    bp.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * bp.xz;
    float box = sdBox(bp, vec3(0.4));

    vec3 tp = p - vec3(-2, 0.3, 0);
    tp.xy = mat2(cos(iTime),-sin(iTime),sin(iTime),cos(iTime)) * tp.xy;
    float torus = sdTorus(tp, vec2(0.5, 0.15));

    return min(ground, min(sphere, min(box, torus)));
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

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5 * iResolution.xy) / iResolution.y;

    // Camera
    vec3 ro = vec3(0, 2, -5);
    vec3 rd = normalize(vec3(uv, 1.0));

    // Orbit camera
    float a = iTime * 0.3;
    ro.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * ro.xz;
    rd.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * rd.xz;

    float dist = raymarch(ro, rd);
    vec3 col = vec3(0.05, 0.05, 0.15);

    if (dist > 0.0) {
        vec3 p = ro + rd * dist;
        vec3 n = getNormal(p);
        vec3 lightDir = normalize(vec3(1, 1, -1));
        float diff = max(dot(n, lightDir), 0.0);
        float amb = 0.15;

        vec3 baseCol = vec3(0.8, 0.7, 0.6);
        if (p.y < -0.99) {
            float check = mod(floor(p.x)+floor(p.z), 2.0);
            baseCol = mix(vec3(0.3), vec3(0.7), check);
        }

        col = baseCol * (amb + diff * 0.85);
        col = mix(col, vec3(0.05,0.05,0.15), 1.0-exp(-0.05*dist*dist));
    }

    col = pow(col, vec3(0.4545));
    fragColor = vec4(col, 1.0);
}`
});

