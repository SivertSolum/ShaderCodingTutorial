// ═══════════════════════════════════════════════════════════════
//  App — UI Logic, Lesson Navigation, Dual-Mode Tab System
// ═══════════════════════════════════════════════════════════════


import { ShaderEngine } from './engine.js';
import { LESSONS } from './lessons.js';

// Dynamically import all lesson modules
const lessonModules = [
  '../lessons/00-welcome.js',
  '../lessons/01-hello-color.js',
  '../lessons/02-shapes.js',
  '../lessons/03-transforms.js',
  '../lessons/04-animation.js',
  '../lessons/05-patterns.js',
  '../lessons/06-color.js',
  '../lessons/07-noise.js',
  '../lessons/08-raymarching.js',
  '../lessons/09-lighting.js',
  '../lessons/10-advanced.js',
];

await Promise.all(lessonModules.map(src => import(src, { assert: { type: "js" } }).catch(() => import(src.replace('../', './'))));

  // ── DOM refs ──
  const editor      = document.getElementById('shader-code');
  const errorBar    = document.getElementById('error-bar');
  const select      = document.getElementById('lesson-select');
  const pillsEl     = document.getElementById('lesson-pills');
  const tutorialEl  = document.getElementById('tutorial-content');
  const learnMode   = document.getElementById('learn-mode');
  const codeMode    = document.getElementById('code-mode');
  const tabLearn    = document.getElementById('tab-learn');
  const tabCode     = document.getElementById('tab-code');
  const hintTitle   = document.getElementById('hint-title');
  const hintBack    = document.getElementById('hint-back');
  const btnCompile  = document.getElementById('btn-compile');
  const btnPause    = document.getElementById('btn-pause');
  const btnReset    = document.getElementById('btn-reset');
  const hudTime     = document.getElementById('hud-time');
  const hudFps      = document.getElementById('hud-fps');
  const hudRes      = document.getElementById('hud-res');
  const hudMouse    = document.getElementById('hud-mouse');
  const tabFilename = document.getElementById('tab-filename');

  // ── State ──
  let currentLesson = 0;
  const completed = {};
  let currentMode = 'learn'; // 'learn' or 'code'

  // ── Init Engine ──

  ShaderEngine.init(document.getElementById('glcanvas'));

  // Engine frame callback — update HUD
  ShaderEngine.onFrame = function (data) {
    if (hudTime) hudTime.textContent = data.time.toFixed(2);
    if (hudFps)  hudFps.textContent  = data.fps;
    if (hudRes)  hudRes.textContent  = data.resW + '×' + data.resH;
    if (hudMouse) hudMouse.textContent = data.mouse.x.toFixed(0) + ', ' + data.mouse.y.toFixed(0);
  };

  // ── Mode Switching ──
  function setMode(mode) {
    currentMode = mode;

    // Toggle content visibility
    learnMode.classList.toggle('active', mode === 'learn');
    codeMode.classList.toggle('active',  mode === 'code');

    // Toggle tab active states
    tabLearn.classList.toggle('active', mode === 'learn');

    import { ShaderEngine } from './engine.js';
    import { LESSONS } from './lessons.js';

    // Dynamically import all lesson modules
    const lessonModules = [
      '../lessons/00-welcome.js',
      '../lessons/01-hello-color.js',
      '../lessons/02-shapes.js',
      '../lessons/03-transforms.js',
      '../lessons/04-animation.js',
      '../lessons/05-patterns.js',
      '../lessons/06-color.js',
      '../lessons/07-noise.js',
      '../lessons/08-raymarching.js',
      '../lessons/09-lighting.js',
      '../lessons/10-advanced.js',
    ];
    await Promise.all(lessonModules.map(src => import(src, { assert: { type: "js" } }).catch(() => import(src.replace('../', './'))));

    /**
     * ShaderApp
     * Main application class for UI logic, lesson navigation, and mode switching.
     * Instantiated at startup.
     */
    class ShaderApp {
      /**
       * Initialize DOM references, state, and event listeners.
       */
      constructor() {
        // DOM refs
        this.editor      = document.getElementById('shader-code');
        this.errorBar    = document.getElementById('error-bar');
        this.select      = document.getElementById('lesson-select');
        this.pillsEl     = document.getElementById('lesson-pills');
        this.tutorialEl  = document.getElementById('tutorial-content');
        this.learnMode   = document.getElementById('learn-mode');
        this.codeMode    = document.getElementById('code-mode');
        this.tabLearn    = document.getElementById('tab-learn');
        this.tabCode     = document.getElementById('tab-code');
        this.hintTitle   = document.getElementById('hint-title');
        this.hintBack    = document.getElementById('hint-back');
        this.btnCompile  = document.getElementById('btn-compile');
        this.btnPause    = document.getElementById('btn-pause');
        this.btnReset    = document.getElementById('btn-reset');
        this.hudTime     = document.getElementById('hud-time');
        this.hudFps      = document.getElementById('hud-fps');
        this.hudRes      = document.getElementById('hud-res');
        this.hudMouse    = document.getElementById('hud-mouse');
        this.tabFilename = document.getElementById('tab-filename');
        this.resizer     = document.getElementById('resizer');
        this.editorArea  = document.getElementById('editor-area');
        this.canvasArea  = document.getElementById('canvas-area');
        // State
        this.currentLesson = 0;
        this.completed = {};
        this.currentMode = 'learn';
        this.isResizing = false;
        // Init
        this.init();
      }

      /**
       * Initialize engine, event listeners, and UI. Boot app.
       */
      init() {
        ShaderEngine.init(document.getElementById('glcanvas'));
        ShaderEngine.onFrame = (data) => {
          if (this.hudTime) this.hudTime.textContent = data.time.toFixed(2);
          if (this.hudFps)  this.hudFps.textContent  = data.fps;
          if (this.hudRes)  this.hudRes.textContent  = data.resW + '×' + data.resH;
          if (this.hudMouse) this.hudMouse.textContent = data.mouse.x.toFixed(0) + ', ' + data.mouse.y.toFixed(0);
        };
        this.tabLearn.addEventListener('click', () => this.setMode('learn'));
        this.tabCode.addEventListener('click',  () => this.setMode('code'));
        this.hintBack.addEventListener('click', () => this.setMode('learn'));
        LESSONS.forEach((l, i) => {
          const opt = document.createElement('option');
          opt.value = i;
          opt.textContent = l.title;
          this.select.appendChild(opt);
        });
        this.select.addEventListener('change', () => this.loadLesson(parseInt(this.select.value)));
        this.btnCompile.addEventListener('click', () => this.compileShader(this.editor.value));
        this.btnPause.addEventListener('click', () => {
          const paused = ShaderEngine.togglePause();
          this.btnPause.textContent = paused ? '▶ Resume' : '⏸ Pause';
        });
        this.btnReset.addEventListener('click', () => ShaderEngine.reset());
        this.editor.addEventListener('keydown', (e) => {
          if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            this.compileShader(this.editor.value);
          }
          if (e.key === 'Tab') {
            e.preventDefault();
            const s = this.editor.selectionStart, end = this.editor.selectionEnd;
            this.editor.value = this.editor.value.substring(0, s) + '    ' + this.editor.value.substring(end);
            this.editor.selectionStart = this.editor.selectionEnd = s + 4;
          }
        });
        document.addEventListener('keydown', (e) => {
          if (e.key === 'l' && !e.ctrlKey && document.activeElement !== this.editor) {
            this.setMode('learn');
          }
          if (e.key === 'c' && !e.ctrlKey && document.activeElement !== this.editor) {
            this.setMode('code');
          }
        });
        this.resizer.addEventListener('mousedown', (e) => {
          this.isResizing = true;
          this.resizer.classList.add('active');
          e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
          if (!this.isResizing) return;
          const split = document.getElementById('workspace-split');
          const rect = split.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const total = rect.width;
          const pct = Math.max(20, Math.min(80, (x / total) * 100));
          this.editorArea.style.flex = 'none';
          this.editorArea.style.width = pct + '%';
          this.canvasArea.style.flex = '1';
        });
        document.addEventListener('mouseup', () => {
          this.isResizing = false;
          this.resizer.classList.remove('active');
        });
        // Boot
        this.loadLesson(0);
        this.setMode('learn');
      }

      /**
       * Switch between Learn and Code modes.
       * @param {string} mode - 'learn' or 'code'
       */
      setMode(mode) {
        this.currentMode = mode;
        this.learnMode.classList.toggle('active', mode === 'learn');
        this.codeMode.classList.toggle('active',  mode === 'code');
        this.tabLearn.classList.toggle('active', mode === 'learn');
        this.tabCode.classList.toggle('active',  mode === 'code');
        document.body.classList.toggle('learn-active', mode === 'learn');
        if (mode === 'code' && LESSONS && LESSONS[this.currentLesson]) {
          this.hintTitle.textContent = LESSONS[this.currentLesson].title;
        }
      }

      /**
       * Render lesson navigation pills.
       */
      renderPills() {
        this.pillsEl.innerHTML = '';
        LESSONS.forEach((l, i) => {
          const pill = document.createElement('span');
          pill.className = 'pill';
          if (i === this.currentLesson) pill.className += ' active';
          else if (this.completed[i]) pill.className += ' completed';
          pill.textContent = l.short;
          pill.addEventListener('click', () => this.loadLesson(i));
          this.pillsEl.appendChild(pill);
        });
      }

      /**
       * Load a lesson by index, update UI and code editor.
       * @param {number} index - Lesson index
       */
      loadLesson(index) {
        if (this.currentLesson !== index && this.currentLesson >= 0) {
          this.completed[this.currentLesson] = true;
        }
        this.currentLesson = index;
        const lesson = LESSONS[index];
        this.editor.value = lesson.code;
        this.compileShader(lesson.code);
        this.tabFilename.textContent = lesson.title.replace(/^\d+\s*—\s*/, '') + '.glsl';
        this.tutorialEl.innerHTML = lesson.tutorial;
        const exercises = this.tutorialEl.querySelectorAll('.exercise');
        for (let e = 0; e < exercises.length; e++) {
          const btn = document.createElement('button');
          btn.className = 'try-code-btn';
          btn.innerHTML = '💻 Try in Code Mode';
          btn.addEventListener('click', () => this.setMode('code'));
          exercises[e].appendChild(btn);
        }
        let navHTML = '<div class="lesson-nav-buttons">';
        if (index > 0) {
          navHTML += '<button class="btn" id="nav-prev">← ' + LESSONS[index - 1].short + '</button>';
        }
        navHTML += '<button class="btn primary" id="nav-code">💻 Open Code Mode</button>';
        if (index < LESSONS.length - 1) {
          navHTML += '<button class="btn" id="nav-next">' + LESSONS[index + 1].short + ' →</button>';
        }
        navHTML += '</div>';
        this.tutorialEl.insertAdjacentHTML('beforeend', navHTML);
        const prevBtn = document.getElementById('nav-prev');
        const nextBtn = document.getElementById('nav-next');
        const codeBtn = document.getElementById('nav-code');
        if (prevBtn) prevBtn.addEventListener('click', () => this.loadLesson(index - 1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.loadLesson(index + 1));
        if (codeBtn) codeBtn.addEventListener('click', () => this.setMode('code'));
        this.select.value = index;
        this.renderPills();
        this.hintTitle.textContent = lesson.title;
        this.learnMode.scrollTop = 0;
        this.errorBar.style.display = 'none';
      }

      /**
       * Compile shader code and display errors if any.
       * @param {string} code - GLSL code
       */
      compileShader(code) {
        this.errorBar.style.display = 'none';
        const result = ShaderEngine.buildShader(code);
        if (!result.success) {
          this.errorBar.textContent = '⚠ ' + result.error;
          this.errorBar.style.display = 'block';
        }
      }
    }

    new ShaderApp();

