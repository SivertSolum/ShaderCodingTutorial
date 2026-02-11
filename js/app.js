// ═══════════════════════════════════════════════════════════════
//  App — UI Logic, Lesson Navigation, Dual-Mode Tab System
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── DOM refs ──
  var editor      = document.getElementById('shader-code');
  var errorBar    = document.getElementById('error-bar');
  var select      = document.getElementById('lesson-select');
  var pillsEl     = document.getElementById('lesson-pills');
  var tutorialEl  = document.getElementById('tutorial-content');
  var learnMode   = document.getElementById('learn-mode');
  var codeMode    = document.getElementById('code-mode');
  var tabLearn    = document.getElementById('tab-learn');
  var tabCode     = document.getElementById('tab-code');
  var hintTitle   = document.getElementById('hint-title');
  var hintBack    = document.getElementById('hint-back');
  var btnCompile  = document.getElementById('btn-compile');
  var btnPause    = document.getElementById('btn-pause');
  var btnReset    = document.getElementById('btn-reset');
  var hudTime     = document.getElementById('hud-time');
  var hudFps      = document.getElementById('hud-fps');
  var hudRes      = document.getElementById('hud-res');
  var hudMouse    = document.getElementById('hud-mouse');
  var tabFilename = document.getElementById('tab-filename');

  // ── State ──
  var currentLesson = 0;
  var completed = {};
  var currentMode = 'learn'; // 'learn' or 'code'

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
    tabCode.classList.toggle('active',  mode === 'code');

    // Toggle body class for header control visibility
    document.body.classList.toggle('learn-active', mode === 'learn');

    // Update hint bar in code mode
    if (mode === 'code' && window.LESSONS && window.LESSONS[currentLesson]) {
      hintTitle.textContent = window.LESSONS[currentLesson].title;
    }
  }

  tabLearn.addEventListener('click', function () { setMode('learn'); });
  tabCode.addEventListener('click',  function () { setMode('code'); });
  hintBack.addEventListener('click', function () { setMode('learn'); });

  // ── Lesson Loading ──

  // Populate dropdown
  window.LESSONS.forEach(function (l, i) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = l.title;
    select.appendChild(opt);
  });

  // Render pills
  function renderPills() {
    pillsEl.innerHTML = '';
    window.LESSONS.forEach(function (l, i) {
      var pill = document.createElement('span');
      pill.className = 'pill';
      if (i === currentLesson) pill.className += ' active';
      else if (completed[i]) pill.className += ' completed';
      pill.textContent = l.short;
      pill.addEventListener('click', function () { loadLesson(i); });
      pillsEl.appendChild(pill);
    });
  }

  function loadLesson(index) {
    if (currentLesson !== index && currentLesson >= 0) {
      completed[currentLesson] = true;
    }
    currentLesson = index;
    var lesson = window.LESSONS[index];

    // Update code editor
    editor.value = lesson.code;
    compileShader(lesson.code);
    tabFilename.textContent = lesson.title.replace(/^\d+\s*—\s*/, '') + '.glsl';

    // Update tutorial content
    tutorialEl.innerHTML = lesson.tutorial;

    // Add "Try in Code Mode" buttons to exercises
    var exercises = tutorialEl.querySelectorAll('.exercise');
    for (var e = 0; e < exercises.length; e++) {
      var btn = document.createElement('button');
      btn.className = 'try-code-btn';
      btn.innerHTML = '💻 Try in Code Mode';
      btn.addEventListener('click', function () { setMode('code'); });
      exercises[e].appendChild(btn);
    }

    // Add prev/next navigation at the bottom
    var navHTML = '<div class="lesson-nav-buttons">';
    if (index > 0) {
      navHTML += '<button class="btn" id="nav-prev">← ' + window.LESSONS[index - 1].short + '</button>';
    }
    navHTML += '<button class="btn primary" id="nav-code">💻 Open Code Mode</button>';
    if (index < window.LESSONS.length - 1) {
      navHTML += '<button class="btn" id="nav-next">' + window.LESSONS[index + 1].short + ' →</button>';
    }
    navHTML += '</div>';
    tutorialEl.insertAdjacentHTML('beforeend', navHTML);

    // Wire up nav buttons
    var prevBtn = document.getElementById('nav-prev');
    var nextBtn = document.getElementById('nav-next');
    var codeBtn = document.getElementById('nav-code');
    if (prevBtn) prevBtn.addEventListener('click', function () { loadLesson(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { loadLesson(index + 1); });
    if (codeBtn) codeBtn.addEventListener('click', function () { setMode('code'); });

    // Update dropdown and pills
    select.value = index;
    renderPills();

    // Update hint bar
    hintTitle.textContent = lesson.title;

    // Scroll learn mode to top
    learnMode.scrollTop = 0;

    // Hide error bar
    errorBar.style.display = 'none';
  }

  select.addEventListener('change', function () {
    loadLesson(parseInt(select.value));
  });

  // ── Shader Compilation ──
  function compileShader(code) {
    errorBar.style.display = 'none';
    var result = ShaderEngine.buildShader(code);
    if (!result.success) {
      errorBar.textContent = '⚠ ' + result.error;
      errorBar.style.display = 'block';
    }
  }

  // ── Controls ──
  btnCompile.addEventListener('click', function () {
    compileShader(editor.value);
  });

  btnPause.addEventListener('click', function () {
    var paused = ShaderEngine.togglePause();
    btnPause.textContent = paused ? '▶ Resume' : '⏸ Pause';
  });

  btnReset.addEventListener('click', function () {
    ShaderEngine.reset();
  });

  // ── Keyboard Shortcuts ──
  editor.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      compileShader(editor.value);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      var s = editor.selectionStart, end = editor.selectionEnd;
      editor.value = editor.value.substring(0, s) + '    ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = s + 4;
    }
  });

  document.addEventListener('keydown', function (e) {
    // 'L' to switch to learn mode (when not in editor)
    if (e.key === 'l' && !e.ctrlKey && document.activeElement !== editor) {
      setMode('learn');
    }
    // 'C' to switch to code mode (when not in editor)
    if (e.key === 'c' && !e.ctrlKey && document.activeElement !== editor) {
      setMode('code');
    }
  });

  // ── Resizer (editor ↔ canvas split) ──
  var resizer     = document.getElementById('resizer');
  var editorArea  = document.getElementById('editor-area');
  var canvasArea  = document.getElementById('canvas-area');
  var isResizing  = false;

  resizer.addEventListener('mousedown', function (e) {
    isResizing = true;
    resizer.classList.add('active');
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isResizing) return;
    var split = document.getElementById('workspace-split');
    var rect = split.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var total = rect.width;
    var pct = Math.max(20, Math.min(80, (x / total) * 100));
    editorArea.style.flex = 'none';
    editorArea.style.width = pct + '%';
    canvasArea.style.flex = '1';
  });

  document.addEventListener('mouseup', function () {
    isResizing = false;
    resizer.classList.remove('active');
  });

  // ── Boot ──
  loadLesson(0);
  setMode('learn');
})();

