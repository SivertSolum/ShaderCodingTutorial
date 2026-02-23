# Remaining Tasks for ShaderCodingTutorial

This document tracks the remaining modernization and improvement tasks for the project as of February 23, 2026.

## In Progress

- [ ] **Restructure lessons into subfolders**
  - Move each lesson JS file into its own dedicated subfolder (e.g., `lessons/04-animation/index.js`).
  - Update all dynamic import logic in `js/app.js` and any other relevant files to reference the new lesson file locations.
  - Ensure all lesson imports, navigation, and hot-reloading features work seamlessly after restructuring.
  - (Optional) Add a README.md or metadata file in each lesson folder for future extensibility.

## To Do

- [ ] **Split CSS into multiple files**
  - Refactor the main stylesheet (`css/styles.css`) into logical modules: layout, theme, components, and lesson-specific styles.
  - Use CSS imports or multiple `<link>` tags in HTML for modularity.
  - Make it easier to maintain and extend styles, and support theming or per-lesson overrides in the future.

- [ ] **Add ESLint and Prettier config**
  - Set up ESLint for JavaScript linting with a modern, recommended config (e.g., Airbnb or Standard).
  - Add Prettier for automatic code formatting.
  - Integrate both tools with VS Code and npm scripts for one-click linting and formatting.
  - Ensure all code (including lessons) adheres to consistent style and best practices.

- [ ] **Add .gitignore**
  - Create a `.gitignore` file to exclude `node_modules`, build outputs, OS/editor files, and other non-source artifacts from version control.
  - Prevent accidental commits of dependencies or local configuration.

- [ ] **Introduce Jest and add tests**
  - Set up Jest for unit testing JavaScript modules (engine, app, and lessons logic).
  - Write initial tests for core functionality (e.g., shader compilation, lesson loading, navigation).
  - Add coverage reporting and integrate with CI if applicable.

- [ ] **Add package.json and npm scripts**
  - Initialize a `package.json` for dependency management and project metadata.
  - Add scripts for linting, formatting, testing, and building the project.
  - Document all scripts in the README for easy onboarding.

- [ ] **Implement dynamic lesson loading**
  - Refactor lesson loading to use dynamic imports or code-splitting, so only the current lesson is loaded into memory.
  - Improve scalability and performance, especially as the number of lessons grows.
  - Ensure navigation and hot-reloading still work smoothly.

- [ ] **Review and improve accessibility**
  - Audit the UI for accessibility (a11y) issues: keyboard navigation, ARIA roles, color contrast, focus management, and screen reader support.
  - Add or improve semantic HTML and ARIA attributes as needed.
  - Test with keyboard and screen reader tools.

- [ ] **Add responsive CSS improvements**
  - Refactor layout and styles to ensure the app works well on all screen sizes, including mobile and tablets.
  - Use CSS media queries, flexible grids, and scalable UI components.
  - Test on multiple devices and browsers for consistent experience.

---

**Completed tasks are tracked in the main README.**

For further details on each task, see the project README or request a breakdown of any item.