# Repository Guidelines

## Project Structure & Module Organization
Chrononotes is a Vite + React + TypeScript single-page app. Source code lives in `src/`, with `main.tsx` bootstrapping `App.tsx`, shared visuals in `src/assets/`, and global styles split between `App.css` and `index.css`. Static files and the HTML shell live in `public/` and `index.html`. Tooling is configured via `vite.config.ts`, `tsconfig*.json`, and `eslint.config.js`. Keep new feature folders self-contained under `src/` (components, hooks, and styles together) to preserve the lean structure. Target features are sequenced in [`docs/BUILD_PLAN.md`](docs/BUILD_PLAN.md); align new work with the next open phase whenever possible.

## Build, Test, and Development Commands
- `npm run dev`: launches the Vite dev server with React Fast Refresh at `http://localhost:5173`.
- `npm run build`: type-checks with `tsc -b` and emits a production build in `dist/`.
- `npm run preview`: serves the contents of `dist/` to verify production bundles.
- `npm run lint`: runs ESLint across the repo; ensure a clean run before opening a PR.

## Coding Style & Naming Conventions
Use modern functional React with TypeScript. Components, hooks, and contexts use PascalCase filenames (`TimelinePanel.tsx`), utility modules use camelCase (`timeMath.ts`). Follow the existing two-space indentation, single quotes, and trailing commas enforced by the template. Keep state local via hooks where possible, avoid default exports except for top-level pages, and colocate CSS modules or files next to the component they style. ESLint (configured for React 19 hooks) is the source of truth—do not merge code that requires `// eslint-disable` comments without reviewer approval.

## Testing Guidelines
Automated testing is not yet wired into this template; rely on targeted manual verification through `npm run dev` until a Vitest + React Testing Library stack is added. When introducing tests, colocate `*.test.tsx` files with the component under test, cover stateful hooks and time calculations, and prefer descriptive `describe/it` names (`ChronoPanel` should list scenarios such as “restores draft from cache”). Document any new test commands in `package.json`.

## Commit & Pull Request Guidelines
This workspace was provided without Git history, so start fresh with concise, imperative commit messages (e.g., `feat: add timeline editor shell`). Group related changes into a single commit when feasible. Pull requests should include: a summary of changes, linked issues or task IDs, before/after screenshots for UI-facing work, confirmation that `npm run build` and `npm run lint` pass, and notes about any new configuration or environment steps. Flag any follow-up TODOs so reviewers can track deferred work.
