# Chrononotes – Developer Guide

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

Follow the phased roadmap in [`docs/BUILD_PLAN.md`](./BUILD_PLAN.md) to keep the app shippable after each milestone. Each phase layers one capability (layout, editing, dates, tags, grouping, persistence, desktop shell, attachments, export, polish) so you can visually verify progress in the browser or desktop shell before moving on.

## Contributor Guidelines

The contributor workflow, coding conventions, and pull request expectations are described in [`AGENTS.md`](../AGENTS.md). Consult it alongside the build plan to understand both *what* to build and *how* to contribute changes.

## Packaging & Updates (Tauri)

Installer builds:

1. Ensure dependencies are installed (`npm ci`) and the app identifier in `src-tauri/tauri.conf.json` matches your org.
2. Set signing env vars (from `npx tauri signer generate --ci`):
   - `TAURI_SIGNING_PRIVATE_KEY`
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` (empty if none)
   - `TAURI_UPDATER_PUBKEY`
3. Build a signed release: `npx tauri build`. The Windows installer lands in `src-tauri/target/release/bundle/msi/`.

Auto-update setup:

1. Pick an update feed URL and export `TAURI_UPDATER_ENDPOINT` (e.g., a `latest.json` on GitHub Releases or S3).
2. Publish the installer plus the generated `latest.json` from `src-tauri/target/release/bundle/**/latest.json` to that endpoint.
3. Users install once via MSI. Future builds with higher `version` + updated `latest.json` will auto-update, while local `npm run dev`/`npx tauri dev` keeps your workspace separate from the installed app.
