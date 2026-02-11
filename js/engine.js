// ═══════════════════════════════════════════════════════════════
//  WebGL Engine — Shadertoy-compatible renderer
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  let canvas, gl, isWebGL2;
  let prog = null, unis = {};
  let startT, lastT, frame = 0;
  let paused = false, pauseT = 0;
  let mouse = { x: 0, y: 0, cx: 0, cy: 0, down: false };
  let fpsSamples = [];
  let VERT_SRC;

  function init(canvasEl) {
    canvas = canvasEl;
    gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) { alert('WebGL not supported in this browser!'); return; }

    isWebGL2 = gl instanceof WebGL2RenderingContext;

    VERT_SRC = isWebGL2
      ? '#version 300 es\nprecision highp float;\nin vec2 a_pos;\nvoid main(){gl_Position=vec4(a_pos,0,1);}'
      : 'attribute vec2 a_pos;\nvoid main(){gl_Position=vec4(a_pos,0,1);}';

    // Fullscreen quad
    const qb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, qb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

    startT = performance.now() / 1e3;
    lastT = startT;

    // Mouse events
    canvas.addEventListener('mousemove', function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = r.height - (e.clientY - r.top);
    });
    canvas.addEventListener('mousedown', function (e) {
      mouse.down = true;
      var r = canvas.getBoundingClientRect();
      mouse.cx = e.clientX - r.left;
      mouse.cy = r.height - (e.clientY - r.top);
    });
    canvas.addEventListener('mouseup', function () { mouse.down = false; });

    // Start render loop
    requestAnimationFrame(render);
  }

  function wrapFrag(code) {
    if (isWebGL2) return '#version 300 es\nprecision highp float;\n'
      + 'uniform vec3 iResolution;uniform float iTime;uniform float iTimeDelta;uniform int iFrame;uniform vec4 iMouse;\n'
      + 'out vec4 _fc;\n'
      + code + '\n'
      + 'void main(){vec4 c=vec4(0);mainImage(c,gl_FragCoord.xy);_fc=c;}';
    return 'precision highp float;\n'
      + 'uniform vec3 iResolution;uniform float iTime;uniform float iTimeDelta;uniform int iFrame;uniform vec4 iMouse;\n'
      + code + '\n'
      + 'void main(){vec4 c=vec4(0);mainImage(c,gl_FragCoord.xy);gl_FragColor=c;}';
  }

  function compileShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var l = gl.getShaderInfoLog(s);
      gl.deleteShader(s);
      throw l;
    }
    return s;
  }

  function link(v, f) {
    var p = gl.createProgram();
    gl.attachShader(p, v);
    gl.attachShader(p, f);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      var l = gl.getProgramInfoLog(p);
      gl.deleteProgram(p);
      throw l;
    }
    return p;
  }

  function buildShader(code) {
    try {
      var vs = compileShader(gl.VERTEX_SHADER, VERT_SRC);
      var fs = compileShader(gl.FRAGMENT_SHADER, wrapFrag(code));
      var p = link(vs, fs);
      if (prog) gl.deleteProgram(prog);
      prog = p;
      gl.useProgram(prog);
      unis = {
        iResolution: gl.getUniformLocation(p, 'iResolution'),
        iTime:       gl.getUniformLocation(p, 'iTime'),
        iTimeDelta:  gl.getUniformLocation(p, 'iTimeDelta'),
        iFrame:      gl.getUniformLocation(p, 'iFrame'),
        iMouse:      gl.getUniformLocation(p, 'iMouse'),
      };
      var a = gl.getAttribLocation(p, 'a_pos');
      gl.enableVertexAttribArray(a);
      gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
      startT = performance.now() / 1e3;
      frame = 0;
      return { success: true };
    } catch (e) {
      return { success: false, error: e };
    }
  }

  function render() {
    requestAnimationFrame(render);
    if (!prog || !canvas) return;

    // Auto-resize canvas to fill its CSS dimensions
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    if (w > 0 && h > 0 && (canvas.width !== w || canvas.height !== h)) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }

    var now = performance.now() / 1e3;
    if (paused) { startT += (now - pauseT); pauseT = now; }
    var time = paused ? 0 : now - startT;
    var dt = now - lastT;
    lastT = now;
    fpsSamples.push(dt);
    if (fpsSamples.length > 30) fpsSamples.shift();
    var avg = fpsSamples.reduce(function (a, b) { return a + b; }) / fpsSamples.length;

    gl.useProgram(prog);
    if (unis.iResolution) gl.uniform3f(unis.iResolution, canvas.width, canvas.height, 1);
    if (unis.iTime) gl.uniform1f(unis.iTime, time);
    if (unis.iTimeDelta) gl.uniform1f(unis.iTimeDelta, dt);
    if (unis.iFrame) gl.uniform1i(unis.iFrame, frame);
    if (unis.iMouse) gl.uniform4f(unis.iMouse,
      mouse.down ? mouse.x : mouse.cx,
      mouse.down ? mouse.y : mouse.cy,
      mouse.down ? mouse.cx : -mouse.cx,
      mouse.down ? mouse.cy : -mouse.cy
    );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    frame++;

    // Report frame data to UI
    if (engine.onFrame) {
      engine.onFrame({
        time: time,
        fps: (1 / avg).toFixed(0),
        resW: canvas.width,
        resH: canvas.height,
        mouse: mouse
      });
    }
  }

  var engine = {
    init: init,
    buildShader: buildShader,
    onFrame: null,
    togglePause: function () {
      paused = !paused;
      if (paused) pauseT = performance.now() / 1e3;
      return paused;
    },
    reset: function () {
      startT = performance.now() / 1e3;
      frame = 0;
    },
    isPaused: function () { return paused; },
    getMouse: function () { return mouse; }
  };

  window.ShaderEngine = engine;
})();

