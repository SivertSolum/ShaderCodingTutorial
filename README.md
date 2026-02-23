# Shader Art Coding -- Interactive Tutorial

An interactive, browser-based tutorial application that teaches GLSL shader programming from the ground up. The project provides a Shadertoy-compatible rendering environment paired with a structured, progressive curriculum spanning 11 lessons. Users write fragment shader code in a built-in editor and see the results rendered in real time on an adjacent WebGL canvas.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
  - [Two Entry Points](#two-entry-points)
  - [WebGL Engine](#webgl-engine)
  - [Application Layer](#application-layer)
  - [Lesson System](#lesson-system)
- [Lesson Curriculum](#lesson-curriculum)
- [Shadertoy Compatibility](#shadertoy-compatibility)
- [User Interface](#user-interface)
  - [Dual-Mode Layout (index.html)](#dual-mode-layout-indexhtml)
  - [Single-Page Layout (viewer.html)](#single-page-layout-viewerhtml)
- [Controls and Keyboard Shortcuts](#controls-and-keyboard-shortcuts)
- [Technical Details](#technical-details)
- [Getting Started](#getting-started)
- [Browser Compatibility](#browser-compatibility)
- [External Resources](#external-resources)
- [Contributing](#contributing)

---

## Overview

This project is a self-contained, zero-dependency web application designed to teach GLSL fragment shader programming. It targets the same shader API conventions used by Shadertoy.com, meaning any shader written in this environment can be directly ported to Shadertoy and vice versa.

The application runs entirely client-side. There is no build step, no bundler, no package manager, and no server-side component. Opening either HTML file in a modern browser is all that is required.

---

## Features

- Real-time WebGL fragment shader compilation and rendering
- Shadertoy-compatible uniform interface (iResolution, iTime, iTimeDelta, iFrame, iMouse)
- Automatic WebGL 2 detection with WebGL 1 fallback
- 11 structured lessons progressing from basic color output to advanced 3D raymarching
- Each lesson includes rich HTML tutorial content, working starter code, and multiple hands-on exercises
- Dual-mode interface: a dedicated Learn mode for reading theory and a Code mode for writing shaders
- Live HUD displaying elapsed time, frames per second, canvas resolution, and mouse position
- Shader error reporting with inline display of GLSL compilation errors
- Resizable editor/canvas split via drag handle
- Pause, resume, and time-reset controls for animation debugging
- Lesson progress tracking with pill-style navigation and completion markers
- Dark theme with a GitHub-inspired color palette
- Fully responsive layout with mobile-friendly breakpoints
- No external dependencies or build tooling

---

## Project Structure

```
shader-coding/
  index.html              Main application (dual-mode: Learn + Code)
  viewer.html             Standalone single-page version (all code inline)
  css/
    styles.css            Stylesheet for index.html
  js/
    engine.js             WebGL rendering engine (Shadertoy-compatible, ES6 class)
    app.js                UI logic, lesson navigation, mode switching (ES6 class)
    lessons.js            Shared LESSONS array (ES6 module)
  lessons/
    00-welcome.js         Lesson 0: Introduction and orientation
    01-hello-color.js     Lesson 1: UV coordinates, colors, gradients
    02-shapes.js          Lesson 2: Signed Distance Functions (SDFs)
    03-transforms.js      Lesson 3: Translation, rotation, scaling
    04-animation.js       Lesson 4: Time-based animation and easing
    05-patterns.js        Lesson 5: Domain repetition, grids, tiling
    06-color.js           Lesson 6: Cosine palettes, HSV, gamma correction
    07-noise.js           Lesson 7: Value noise, FBM, domain warping
    08-raymarching.js     Lesson 8: 3D rendering via sphere tracing
    09-lighting.js        Lesson 9: Phong shading, soft shadows, ambient occlusion
    10-advanced.js        Lesson 10: Advanced SDF operations and post-processing
```

---

## Architecture

### Two Entry Points

The project ships two HTML files that represent different interface philosophies for the same core functionality:

**index.html** -- The primary application. It uses a modular architecture with external CSS and JavaScript files. Lessons are dynamically imported as ES6 modules at startup, populating a shared `LESSONS` array. The interface provides a prominent dual-mode tab bar that switches between a full-screen Learn view and a side-by-side Code view.

**viewer.html** -- A fully self-contained single-file version. All CSS, JavaScript, lesson data, and the WebGL engine are inlined. It uses a traditional sidebar layout where the tutorial panel sits alongside the code editor and canvas simultaneously. This file can be distributed or hosted independently without any other files.

### WebGL Engine

The rendering engine (`js/engine.js`) is implemented as an ES6 class (`ShaderEngineClass`) and exported as a singleton (`ShaderEngine`). It handles:

- **WebGL context initialization**: Attempts WebGL 2 first, falls back to WebGL 1. The vertex shader and fragment shader wrapper code are generated dynamically based on which version is available.
- **Fullscreen quad rendering**: Creates a two-triangle quad covering the entire viewport. All rendering is performed by the fragment shader operating on this quad.
- **Fragment shader wrapping**: User code is expected to define a `mainImage(out vec4 fragColor, in vec2 fragCoord)` function. The engine wraps this in a complete GLSL program that declares all Shadertoy-compatible uniforms and calls `mainImage` from the true `main()` entry point.
- **Shader compilation and linking**: Compiles vertex and fragment shaders, links them into a program, and extracts uniform locations. Returns structured success/error results.
- **Render loop**: Runs via `requestAnimationFrame`. Each frame updates time uniforms, passes mouse state, auto-resizes the canvas to match its CSS container dimensions, and draws the fullscreen quad.
- **Time management**: Tracks elapsed time, delta time between frames, and frame count. Supports pause/resume (time freezes when paused) and reset (time returns to zero).
- **Mouse input**: Tracks current mouse position and click coordinates on the canvas, mapped to the Shadertoy `iMouse` convention where positive values indicate active clicks.
- **FPS calculation**: Maintains a rolling window of 30 frame time samples and computes the average for display.

### Application Layer

The UI logic (`js/app.js`) is implemented as an ES6 class (`ShaderApp`) and instantiated at startup. It manages:

- **Mode switching**: Toggles between Learn and Code views by manipulating CSS classes on the mode content containers, tab buttons, and document body. A CSS class on the body (`learn-active`) controls visibility of code-only header elements.
- **Lesson loading**: Populates the code editor textarea with the selected lesson's GLSL code, compiles it through the engine, renders the tutorial HTML content into the Learn panel, and wires up navigation buttons.
- **Lesson navigation**: Three navigation mechanisms exist in parallel -- a dropdown select element in the header, clickable pill elements in the Learn view, and prev/next buttons appended to the bottom of each tutorial.
- **Progress tracking**: Marks lessons as completed when the user navigates away from them. Completed pills receive a distinct visual style with a checkmark prefix.
- **Shader compilation**: Invoked on Run button click or Ctrl+Enter keyboard shortcut. Passes editor content to the engine's `buildShader` method and displays any compilation errors in a dedicated error bar below the editor.
- **Editor enhancements**: Intercepts Tab key to insert four spaces instead of changing focus. Supports Ctrl+Enter for compilation.
- **Resizable split**: A drag handle between the editor and canvas areas allows horizontal resizing. Mouse events on the resizer calculate the percentage split and apply it via inline styles.
- **HUD updates**: Subscribes to the engine's frame callback to update the time, FPS, resolution, and mouse coordinate displays.

### Lesson System

Each lesson file (`lessons/XX-name.js`) is an ES6 module that imports the shared `LESSONS` array from `js/lessons.js` and pushes its lesson object:

1. Imports `LESSONS` from `../js/lessons.js`
2. Pushes an object with these properties:
   - `title` -- Full display name (e.g., "08 -- Raymarching")
   - `short` -- Abbreviated pill label (e.g., "08 Raymarch")
   - `tutorial` -- A template literal containing rich HTML markup for the tutorial panel
   - `code` -- A template literal containing the default GLSL fragment shader code

Lessons are dynamically imported as ES6 modules in `app.js` at startup, ensuring the `LESSONS` array is populated before the UI loads. The order in the import array determines the lesson sequence.

---

## Lesson Curriculum

The curriculum follows a progressive structure where each lesson builds on concepts from previous ones:

| # | Title | Core Concepts |
|---|-------|---------------|
| 00 | Welcome | Orientation, mainImage function signature, Shadertoy uniforms, GLSL type reference |
| 01 | Hello Color | UV coordinate normalization, vec3 colors, mix() interpolation, centered coordinates, aspect ratio correction |
| 02 | Shapes (SDFs) | Signed Distance Functions for circle, box, ring, and line segment; smoothstep for antialiased rendering; CSG operations (union, intersection, subtraction) |
| 03 | Transformations | Coordinate-space translation, 2D rotation matrices, scaling with distance correction, combined transform order |
| 04 | Animation | iTime usage, sin/fract/abs oscillation patterns, easing functions (ease-in-out, bounce), traveling waves, staggered motion, shape morphing |
| 05 | Patterns | fract() domain repetition, floor() cell indexing, hash functions for per-cell randomness, polar repetition (kaleidoscope), Truchet tiles |
| 06 | Color Palettes | Inigo Quilez cosine palette formula, palette parameter presets, HSV-to-RGB conversion, gamma correction |
| 07 | Noise | Value noise with smooth interpolation, Fractal Brownian Motion (FBM) with octave layering, domain warping, procedural fire and cloud effects |
| 08 | Raymarching | Sphere tracing algorithm, 3D SDF primitives (sphere, box, torus, plane), surface normal estimation via gradient, camera ray setup, orbit camera |
| 09 | Lighting | Phong shading model (ambient, diffuse, specular), soft shadow raymarching, ambient occlusion sampling, distance fog |
| 10 | Advanced SDF | Smooth boolean operators (smin), SDF modifiers (round, onion/hollow, twist), infinite domain repetition, look-at camera, rim lighting, vignette, complete scene composition |

Each lesson includes between 3 and 7 hands-on exercises with specific instructions. Many lessons provide multiple commented-out code sections that users can toggle to explore different techniques within the same shader.

---

## Shadertoy Compatibility

The engine provides the following uniforms, matching the Shadertoy convention:

| Uniform | Type | Description |
|---------|------|-------------|
| `iResolution` | vec3 | Canvas width and height in pixels, with z always 1.0 |
| `iTime` | float | Elapsed time in seconds since the shader started or was last reset |
| `iTimeDelta` | float | Time in seconds since the previous frame |
| `iFrame` | int | Frame counter, incrementing from 0 |
| `iMouse` | vec4 | Mouse interaction state: xy = current/last-click position, zw = click position with sign encoding for button state |

Shaders must define a `mainImage(out vec4 fragColor, in vec2 fragCoord)` function. The engine wraps this in a complete GLSL program with all uniform declarations and a `main()` function that calls `mainImage`. This means users write only the creative shader logic without boilerplate.

---

## User Interface

### Dual-Mode Layout (index.html)

The primary interface divides the experience into two distinct modes accessed via a prominent tab bar:

**Learn Mode** -- A centered, scrollable reading view (max-width 720px) displaying the current lesson's tutorial content. Navigation pills at the top show all lessons with active/completed states. Each tutorial includes formatted theory text, code examples in styled pre blocks, tip and warning callouts, exercise blocks with "Try in Code Mode" buttons, and prev/next navigation at the bottom.

**Code Mode** -- A side-by-side workspace with the shader code editor on the left and the WebGL canvas on the right, separated by a draggable resize handle. A hint bar at the top shows the current lesson title and provides a link back to Learn mode. The editor area includes a filename tab, the textarea, and a collapsible error bar. The canvas area includes a status bar showing resolution and mouse coordinates.

The header contains the application logo, a lesson dropdown selector, compile/pause/reset buttons (visible only in Code mode), and a HUD displaying time and FPS (also visible only in Code mode).

### Single-Page Layout (viewer.html)

The viewer uses a traditional three-panel layout: a collapsible tutorial sidebar on the left, the code editor in the center, and the WebGL canvas on the right. All panels are visible simultaneously. The tutorial panel can be toggled with a button or the T key.

---

## Controls and Keyboard Shortcuts

| Action | Method |
|--------|--------|
| Compile shader | Click the Run button, or press Ctrl+Enter while in the editor |
| Pause/Resume animation | Click the Pause button |
| Reset time to zero | Click the Reset button |
| Switch to Learn mode | Click the Learn tab, or press L (when editor is not focused) |
| Switch to Code mode | Click the Code tab, or press C (when editor is not focused) |
| Insert spaces (tab) | Press Tab while in the editor (inserts 4 spaces) |
| Toggle tutorial (viewer.html) | Press T, or click the Tutorial button |

---

## Technical Details

- **Rendering approach**: The engine renders a fullscreen quad (two triangles) and runs the user's fragment shader on every pixel. This is the standard technique used by Shadertoy and similar shader playgrounds.
- **WebGL version handling**: On initialization, the engine attempts to acquire a WebGL 2 context. If unavailable, it falls back to WebGL 1. The vertex shader and fragment wrapper are generated at runtime to use the correct GLSL version directives (`#version 300 es` for WebGL 2, no directive for WebGL 1) and syntax (`in`/`out` vs `attribute`/`gl_FragColor`).
- **Canvas auto-sizing**: Each frame, the render loop checks whether the canvas element's CSS dimensions have changed and, if so, updates the canvas resolution and viewport to match. This ensures pixel-perfect rendering after window resizes or split-pane adjustments.
- **Error handling**: When shader compilation fails, the engine catches the GLSL info log and returns it to the application layer, which displays it in the error bar. The previously compiled shader continues to render until a successful compilation replaces it.
- **No external dependencies**: The entire application uses vanilla HTML, CSS, and JavaScript. There are no frameworks, libraries, package managers, or build tools involved.

---

## Getting Started

1. Clone or download the repository.
2. Open `index.html` in a modern web browser. No server is required; the `file://` protocol works.
3. Read through the Welcome lesson in Learn mode.
4. Switch to Code mode and begin editing shaders. Press Ctrl+Enter to compile.
5. Progress through lessons using the pill navigation or the dropdown selector.

Alternatively, open `viewer.html` for the all-in-one single-file experience.

---

## Browser Compatibility

The application requires a browser with WebGL support. WebGL 2 is preferred for full GLSL ES 3.0 features, but the engine falls back to WebGL 1 if necessary. All modern desktop and mobile browsers (Chrome, Firefox, Edge, Safari) support WebGL.

---

## External Resources

The final lesson points users toward further learning materials:

- [Shadertoy.com](https://shadertoy.com) -- Community platform for sharing and exploring shaders
- [iquilezles.org](https://iquilezles.org/articles/) -- Inigo Quilez's comprehensive articles on SDF techniques
- [The Book of Shaders](https://thebookofshaders.com) -- Interactive GLSL textbook
- [The Art of Code](https://youtube.com/@TheArtOfCode) -- YouTube channel with shader programming tutorials
- [Inigo Quilez YouTube](https://youtube.com/@InigoQuilez) -- Video tutorials from the creator of Shadertoy

---

## Contributing

This project now uses modern JavaScript (ES6 modules and classes). To contribute:

- Follow the code style in the main JS files (prefer `const`/`let`, arrow functions, and class-based structure)
- Add new lessons as ES6 modules in the `lessons/` folder, importing and pushing to the shared `LESSONS` array
- Run and test changes by opening `index.html` in a browser
- For major changes, please open an issue or pull request with a description of your proposal

Planned improvements include automated linting, formatting, and testing (see open issues or TODOs in this README).

