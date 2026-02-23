// ═══════════════════════════════════════════════════════════════
//  WebGL Engine — Shadertoy-compatible renderer
// ═══════════════════════════════════════════════════════════════



/**
 * ShaderEngineClass
 * WebGL engine for Shadertoy-compatible fragment shader rendering.
 * Handles context setup, shader compilation, uniform management, render loop, and input.
 * Exported as singleton 'ShaderEngine'.
 */
class ShaderEngineClass {
  /**
   * Initialize engine state.
   */
  constructor() {
    this.canvas = null;
    this.gl = null;
    this.isWebGL2 = false;
    this.prog = null;
    this.unis = {};
    this.startT = 0;
    this.lastT = 0;
    this.frame = 0;
    this.paused = false;
    this.pauseT = 0;
    this.mouse = { x: 0, y: 0, cx: 0, cy: 0, down: false };
    this.fpsSamples = [];
    this.VERT_SRC = '';
    this.onFrame = null;
  }

  /**
   * Initialize WebGL context and event listeners.
   * @param {HTMLCanvasElement} canvasEl - The canvas element to use for rendering.
   */
  init(canvasEl) {
    this.canvas = canvasEl;
    this.gl = canvasEl.getContext('webgl2') || canvasEl.getContext('webgl');
    if (!this.gl) { alert('WebGL not supported in this browser!'); return; }
    this.isWebGL2 = this.gl instanceof WebGL2RenderingContext;
    this.VERT_SRC = this.isWebGL2
      ? '#version 300 es\nprecision highp float;\nin vec2 a_pos;\nvoid main(){gl_Position=vec4(a_pos,0,1);}'
      : 'attribute vec2 a_pos;\nvoid main(){gl_Position=vec4(a_pos,0,1);}';
    // Fullscreen quad
    const qb = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, qb);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), this.gl.STATIC_DRAW);
    this.startT = performance.now() / 1e3;
    this.lastT = this.startT;
    // Mouse events
    this.canvas.addEventListener('mousemove', (e) => {
      const r = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left;
      this.mouse.y = r.height - (e.clientY - r.top);
    });
    this.canvas.addEventListener('mousedown', (e) => {
      this.mouse.down = true;
      const r = this.canvas.getBoundingClientRect();
      this.mouse.cx = e.clientX - r.left;
      this.mouse.cy = r.height - (e.clientY - r.top);
    });
    this.canvas.addEventListener('mouseup', () => { this.mouse.down = false; });
    requestAnimationFrame(() => this.render());
  }

  /**
   * Wrap user fragment shader code with Shadertoy-compatible uniforms and main().
   * @param {string} code - User GLSL code.
   * @returns {string} Wrapped GLSL code.
   */
  wrapFrag(code) {
    if (this.isWebGL2) return '#version 300 es\nprecision highp float;\n'
      + 'uniform vec3 iResolution;uniform float iTime;uniform float iTimeDelta;uniform int iFrame;uniform vec4 iMouse;\n'
      + 'out vec4 _fc;\n'
      + code + '\n'
      + 'void main(){vec4 c=vec4(0);mainImage(c,gl_FragCoord.xy);_fc=c;}';
    return 'precision highp float;\n'
      + 'uniform vec3 iResolution;uniform float iTime;uniform float iTimeDelta;uniform int iFrame;uniform vec4 iMouse;\n'
      + code + '\n'
      + 'void main(){vec4 c=vec4(0);mainImage(c,gl_FragCoord.xy);gl_FragColor=c;}';
  }

  /**
   * Compile a GLSL shader.
   * @param {number} type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER
   * @param {string} src - GLSL source code
   * @returns {WebGLShader} Compiled shader
   * @throws Compilation error string
   */
  compileShader(type, src) {
    const s = this.gl.createShader(type);
    this.gl.shaderSource(s, src);
    this.gl.compileShader(s);
    if (!this.gl.getShaderParameter(s, this.gl.COMPILE_STATUS)) {
      const l = this.gl.getShaderInfoLog(s);
      this.gl.deleteShader(s);
      throw l;
    }
    return s;
  }

  /**
   * Link vertex and fragment shaders into a program.
   * @param {WebGLShader} v - Vertex shader
   * @param {WebGLShader} f - Fragment shader
   * @returns {WebGLProgram} Linked program
   * @throws Linking error string
   */
  link(v, f) {
    const p = this.gl.createProgram();
    this.gl.attachShader(p, v);
    this.gl.attachShader(p, f);
    this.gl.linkProgram(p);
    if (!this.gl.getProgramParameter(p, this.gl.LINK_STATUS)) {
      const l = this.gl.getProgramInfoLog(p);
      this.gl.deleteProgram(p);
      throw l;
    }
    return p;
  }

  /**
   * Build and use a shader program from user code.
   * @param {string} code - User GLSL code
   * @returns {{success: boolean, error?: string}}
   */
  buildShader(code) {
    try {
      const vs = this.compileShader(this.gl.VERTEX_SHADER, this.VERT_SRC);
      const fs = this.compileShader(this.gl.FRAGMENT_SHADER, this.wrapFrag(code));
      const p = this.link(vs, fs);
      if (this.prog) this.gl.deleteProgram(this.prog);
      this.prog = p;
      this.gl.useProgram(this.prog);
      this.unis = {
        iResolution: this.gl.getUniformLocation(p, 'iResolution'),
        iTime:       this.gl.getUniformLocation(p, 'iTime'),
        iTimeDelta:  this.gl.getUniformLocation(p, 'iTimeDelta'),
        iFrame:      this.gl.getUniformLocation(p, 'iFrame'),
        iMouse:      this.gl.getUniformLocation(p, 'iMouse'),
      };
      const a = this.gl.getAttribLocation(p, 'a_pos');
      this.gl.enableVertexAttribArray(a);
      this.gl.vertexAttribPointer(a, 2, this.gl.FLOAT, false, 0, 0);
      this.startT = performance.now() / 1e3;
      this.frame = 0;
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  /**
   * Main render loop. Updates uniforms, draws, and calls onFrame callback.
   * Called automatically via requestAnimationFrame.
   */
  render() {
    requestAnimationFrame(() => this.render());
    if (!this.prog || !this.canvas) return;
    // Auto-resize canvas to fill its CSS dimensions
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w > 0 && h > 0 && (this.canvas.width !== w || this.canvas.height !== h)) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.gl.viewport(0, 0, w, h);
    }
    const now = performance.now() / 1e3;
    if (this.paused) { this.startT += (now - this.pauseT); this.pauseT = now; }
    const time = this.paused ? 0 : now - this.startT;
    const dt = now - this.lastT;
    this.lastT = now;
    this.fpsSamples.push(dt);
    if (this.fpsSamples.length > 30) this.fpsSamples.shift();
    const avg = this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length;
    this.gl.useProgram(this.prog);
    if (this.unis.iResolution) this.gl.uniform3f(this.unis.iResolution, this.canvas.width, this.canvas.height, 1);
    if (this.unis.iTime) this.gl.uniform1f(this.unis.iTime, time);
    if (this.unis.iTimeDelta) this.gl.uniform1f(this.unis.iTimeDelta, dt);
    if (this.unis.iFrame) this.gl.uniform1i(this.unis.iFrame, this.frame);
    if (this.unis.iMouse) this.gl.uniform4f(this.unis.iMouse,
      this.mouse.down ? this.mouse.x : this.mouse.cx,
      this.mouse.down ? this.mouse.y : this.mouse.cy,
      this.mouse.down ? this.mouse.cx : -this.mouse.cx,
      this.mouse.down ? this.mouse.cy : -this.mouse.cy
    );
    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.frame++;
    // Report frame data to UI
    if (this.onFrame) {
      this.onFrame({
        time: time,
        fps: (1 / avg).toFixed(0),
        resW: this.canvas.width,
        resH: this.canvas.height,
        mouse: this.mouse
      });
    }
  }

  /**
   * Toggle pause/resume for animation time.
   * @returns {boolean} New paused state
   */
  togglePause() {
    this.paused = !this.paused;
    if (this.paused) this.pauseT = performance.now() / 1e3;
    return this.paused;
  }

  /**
   * Reset animation time and frame count.
   */
  reset() {
    this.startT = performance.now() / 1e3;
    this.frame = 0;
  }

  /**
   * Check if animation is paused.
   * @returns {boolean}
   */
  isPaused() {
    return this.paused;
  }

  /**
   * Get current mouse state.
   * @returns {{x:number, y:number, cx:number, cy:number, down:boolean}}
   */
  getMouse() {
    return this.mouse;
  }
}

export const ShaderEngine = new ShaderEngineClass();
export const ShaderEngine = engine;

