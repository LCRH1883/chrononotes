# Chrononotes – Timeline Notes Playground

Chrononotes is a React + TypeScript + Vite sandbox for prototyping a flexible timeline-based note-taking experience. The project currently ships with a minimal UI shell and grows through incremental phases documented in this repository.

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to explore the app while iterating on features.

## Key Scripts

- `npm run dev` – Vite dev server with React Fast Refresh.
- `npm run build` – Type-check (TS project refs) and output production assets to `dist/`.
- `npm run preview` – Serve the built assets for acceptance testing.
- `npm run lint` – ESLint (flat config) over the entire repo; must pass before landing changes.

## Incremental Build Plan

Follow the phased roadmap in [`BUILD_PLAN.md`](BUILD_PLAN.md) to keep the app shippable after each milestone. Each phase layers one capability (layout, editing, dates, tags, grouping, persistence, desktop shell, attachments, export, polish) so you can visually verify progress in the browser or desktop shell before moving on.

## Contributor Guidelines

The contributor workflow, coding conventions, and pull request expectations are described in [`AGENTS.md`](AGENTS.md). Consult it alongside the build plan to understand both *what* to build and *how* to contribute changes.

## Packaging & Updates (Tauri)

Installer builds:

1. Ensure dependencies are installed (`npm ci`) and the app identifier in `src-tauri/tauri.conf.json` is yours.
2. Build a signed release: set `TAURI_PRIVATE_KEY` and `TAURI_KEY_PASSWORD` in your shell, then run `npx tauri build`. The Windows installer lands in `src-tauri/target/release/bundle/msi/`.

Auto-update setup:

1. Generate signing keys once: `npx tauri signer generate --ci`. Save the private key securely and export `TAURI_PRIVATE_KEY`/`TAURI_KEY_PASSWORD` when building.
2. Put the public key in your environment as `TAURI_UPDATER_PUBKEY`. Set your update feed URL in `TAURI_UPDATER_ENDPOINT` (e.g. a `latest.json` on GitHub Releases or S3).
3. Build with `npx tauri build`; publish the installer plus the generated `latest.json` from `src-tauri/target/release/bundle/**/latest.json` to your endpoint.
4. Users install once via MSI. Future builds with higher `version` + updated `latest.json` will auto-update, while local `npm run dev`/`npx tauri dev` keeps your workspace separate from the installed app.
