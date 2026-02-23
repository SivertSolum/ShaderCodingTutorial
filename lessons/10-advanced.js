import { LESSONS } from '../js/lessons.js';
LESSONS.push({
  title: "10 — Advanced SDF",
  short: "10 Advanced",
  tutorial: `
<h1>Advanced SDF Techniques</h1>
<p class="subtitle">Smooth booleans, domain ops, and putting it all together</p>

<h2>🔗 Smooth Boolean Operators</h2>
<pre>// Smooth union — blobs, metaballs, organic
float smin(float a, float b, float k) {
    float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
    return mix(b,a,h) - k*h*(1.0-h);
}
// Smooth subtraction: smax(a, -b, k)
// Smooth intersection: smax(a, b, k)</pre>

<h2>🔧 SDF Modifiers</h2>
<table>
<tr><th>Modifier</th><th>Code</th><th>Effect</th></tr>
<tr><td>Round</td><td><code>sdf - r</code></td><td>Round all edges</td></tr>
<tr><td>Onion</td><td><code>abs(sdf) - t</code></td><td>Hollow shell</td></tr>
<tr><td>Twist</td><td>Rotate xz by y</td><td>Spiral deformation</td></tr>
<tr><td>Repeat</td><td><code>mod(p, period)</code></td><td>Infinite copies</td></tr>
</table>

<h2>♾️ Infinite Repetition</h2>
<pre>vec3 opRep(vec3 p, vec3 period) {
    return mod(p + 0.5*period, period) - 0.5*period;
}</pre>
<p>One SDF becomes an infinite field!</p>

<h2>🌀 Twist Deformation</h2>
<pre>float c = cos(amount * p.y);
float s = sin(amount * p.y);
p.xz = mat2(c,-s,s,c) * p.xz;</pre>

<h2>✨ Post-Processing</h2>
<ul>
  <li><strong>Gamma:</strong> <code>pow(col, vec3(0.4545))</code></li>
  <li><strong>Vignette:</strong> darken edges with <code>col *= 1.0 - 0.4 * dot(uv, uv)</code></li>
  <li><strong>Rim light:</strong> <code>pow(1.0 - dot(n, viewDir), 3.0)</code></li>
</ul>

<h2>🧪 Exercises</h2>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 1 — Infinite Tunnel</div>
<p>Replace the pillars with an infinite tunnel using domain repetition only on the z-axis:</p>
<pre>vec3 rp = p;
rp.z = mod(rp.z + 2.0, 4.0) - 2.0;
float tunnel = -sdBox(rp, vec3(1.5, 1.5, 1.8));</pre>
<p>Negate the SDF to put the camera inside! Move the camera forward with <code>iTime</code>.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 2 — Domain Warp the Box</div>
<p>Before evaluating the twisted box, add noise-like warping:</p>
<pre>p1.x += 0.1 * sin(p1.y * 5.0 + iTime);
p1.z += 0.1 * cos(p1.y * 4.0 + iTime * 0.7);</pre>
<p>The box melts and deforms organically.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 3 — Change Twist Amount</div>
<p>In <code>opTwist</code>, the second parameter controls twist intensity. Try <code>5.0</code> for extreme twist or <code>0.5</code> for subtle.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 4 — More Orbiting Blobs</div>
<p>Change <code>5.0</code> to <code>10.0</code> in the orbiting blobs loop. Then change the orbit radius and blob size.</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 5 — Onion Modifier</div>
<p>The box already uses <code>abs(box) - 0.05</code> for the onion (hollow) effect. Try changing <code>0.05</code> to make it thicker or thinner. Try nesting: <code>abs(abs(box) - 0.08) - 0.02</code> for double shells!</p>
</div>

<div class="exercise">
<div class="exercise-title">🎨 Exercise 6 — Final Art Piece</div>
<p>Combine everything you've learned! Ideas:</p>
<ul>
  <li>Add noise to the octahedron SDF for an organic crystal</li>
  <li>Use palette colors based on position instead of normals</li>
  <li>Add fog color based on <code>uv.y</code> for sunset atmosphere</li>
  <li>Animate the repetition period for growing/shrinking pillars</li>
</ul>
<p>This is your canvas — make something beautiful!</p>
</div>

<h2>🚀 Where to Go Next</h2>
<ul>
  <li><a href="https://shadertoy.com" target="_blank" style="color:var(--accent)">Shadertoy.com</a> — thousands of shaders to study and remix</li>
  <li><a href="https://iquilezles.org/articles/" target="_blank" style="color:var(--accent)">iquilezles.org</a> — Inigo Quilez's SDF bible</li>
  <li><a href="https://thebookofshaders.com" target="_blank" style="color:var(--accent)">The Book of Shaders</a> — beautiful interactive GLSL textbook</li>
  <li><a href="https://youtube.com/@TheArtOfCode" target="_blank" style="color:var(--accent)">The Art of Code</a> (YouTube) — excellent tutorials</li>
  <li><a href="https://youtube.com/@InigoQuilez" target="_blank" style="color:var(--accent)">Inigo Quilez</a> (YouTube) — the master himself</li>
</ul>

<div class="tip">You now have all the building blocks. The rest is practice, experimentation, and studying other people's shaders. Copy shaders from Shadertoy, paste them here, break them apart, and rebuild them. That's how you learn!</div>
  `,
  code: `// LESSON 10 — Advanced SDF: The Full Toolkit

#define MAX_STEPS 150
#define MAX_DIST  80.0
#define EPSILON   0.0005

float sdSphere(vec3 p, float r) { return length(p) - r; }
float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}
float sdTorus(vec3 p, vec2 t) {
    return length(vec2(length(p.xz)-t.x, p.y)) - t.y;
}
float sdCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}
float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    return (p.x+p.y+p.z-s)*0.57735027;
}
float smin(float a, float b, float k) {
    float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
    return mix(b,a,h) - k*h*(1.0-h);
}

vec3 opRep(vec3 p, vec3 c) {
    return mod(p+0.5*c, c) - 0.5*c;
}

vec3 opTwist(vec3 p, float k) {
    float c = cos(k*p.y), s = sin(k*p.y);
    p.xz = mat2(c,-s,s,c) * p.xz;
    return p;
}

float scene(vec3 p) {
    float ground = p.y + 1.0;

    // Twisted hollow box
    vec3 p1 = p - vec3(0, 0.5, 0);
    float a = iTime * 0.4;
    p1.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * p1.xz;
    p1 = opTwist(p1, 2.0 + sin(iTime*0.5));
    float box = sdBox(p1, vec3(0.5, 0.8, 0.5));
    box = abs(box) - 0.05; // onion (hollow)
    box -= 0.01;           // round edges

    // Orbiting blobs
    float spheres = MAX_DIST;
    for (float i = 0.0; i < 5.0; i++) {
        float ang = iTime*0.8 + i*6.28318/5.0;
        vec3 sp = p - vec3(1.2*cos(ang), 0.5+0.3*sin(iTime*2.0+i), 1.2*sin(ang));
        spheres = smin(spheres, sdSphere(sp, 0.2), 0.3);
    }
    float center = smin(box, spheres, 0.2);

    // Pillars
    vec3 rp = opRep(p, vec3(4, 0, 4));
    float pillars = sdCylinder(rp, 2.0, 0.15);
    vec3 cell = floor((p+vec3(2,0,2))/vec3(4,1,4));
    if (abs(cell.x)<0.5 && abs(cell.z)<0.5) pillars = MAX_DIST;

    // Floating octahedron
    vec3 op = p - vec3(0, 3.0+0.5*sin(iTime), 0);
    a = iTime * 0.6;
    op.xz = mat2(cos(a),-sin(a),sin(a),cos(a)) * op.xz;
    op.xy = mat2(cos(a*0.7),-sin(a*0.7),sin(a*0.7),cos(a*0.7)) * op.xy;
    float octa = sdOctahedron(op, 0.4);

    return min(ground, min(center, min(pillars, octa)));
}

vec3 getNormal(vec3 p) {
    vec2 e = vec2(EPSILON, 0);
    return normalize(vec3(scene(p+e.xyy)-scene(p-e.xyy),
                          scene(p+e.yxy)-scene(p-e.yxy),
                          scene(p+e.yyx)-scene(p-e.yyx)));
}
float raymarch(vec3 ro, vec3 rd) {
    float t = 0.0;
    for (int i = 0; i < MAX_STEPS; i++) {
        float d = scene(ro+rd*t);
        if (d < EPSILON) return t;
        t += d;
        if (t > MAX_DIST) break;
    }
    return -1.0;
}
float softShadow(vec3 ro, vec3 rd, float mi, float ma, float k) {
    float res=1.0, t=mi;
    for (int i=0; i<48; i++) {
        float d=scene(ro+rd*t);
        if(d<EPSILON) return 0.0;
        res=min(res,k*d/t);
        t+=clamp(d,0.01,0.2);
        if(t>ma) break;
    }
    return clamp(res,0.0,1.0);
}
float calcAO(vec3 p, vec3 n) {
    float ao=0.0, w=1.0;
    for(int i=1;i<=5;i++){float d=0.04*float(i);ao+=w*(d-scene(p+n*d));w*=0.5;}
    return clamp(1.0-4.0*ao,0.0,1.0);
}
vec3 pal(float t) {
    return 0.5+0.5*cos(6.28*(vec3(1,.7,.4)*t+vec3(0,.15,.2)));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    vec2 uv = (fragCoord - 0.5*iResolution.xy) / iResolution.y;
    float ca = iTime*0.2;
    vec3 ro = vec3(5.0*sin(ca), 2.5+sin(iTime*0.3), 5.0*cos(ca));
    vec3 target = vec3(0, 0.8, 0);
    vec3 fwd = normalize(target-ro);
    vec3 right = normalize(cross(vec3(0,1,0), fwd));
    vec3 up = cross(fwd, right);
    vec3 rd = normalize(fwd + uv.x*right + uv.y*up);

    vec3 col = mix(vec3(0.02,0.02,0.08), vec3(0.15,0.1,0.3), uv.y+0.5);
    float dist = raymarch(ro, rd);

    if (dist > 0.0) {
        vec3 p = ro + rd*dist, n = getNormal(p);
        vec3 baseCol = (p.y<-0.99)
            ? mix(vec3(0.08),vec3(0.2),mod(floor(p.x*0.5)+floor(p.z*0.5),2.0))
            : pal(p.y*0.3 + length(p.xz)*0.1 + iTime*0.1);
        vec3 ld = normalize(vec3(2,4,-1));
        float diff = max(dot(n,ld),0.0);
        float spec = pow(max(dot(reflect(-ld,n),normalize(ro-p)),0.0),64.0);
        float sh = softShadow(p+n*0.02,ld,0.05,15.0,12.0);
        float ao = calcAO(p,n);
        col = baseCol*(0.06+diff*sh*0.85)*ao + vec3(1,.9,.8)*spec*sh*0.6;
        float rim = pow(1.0-max(dot(n,normalize(ro-p)),0.0),3.0);
        col += vec3(0.3,0.1,0.5)*rim*0.5;
        col = mix(col, vec3(0.02,0.02,0.08), 1.0-exp(-0.008*dist*dist));
    }

    col = pow(col, vec3(0.4545));
    col *= 1.0 - 0.4*pow(length(uv),2.0);
    fragColor = vec4(col, 1.0);
}`
});

