# Chrononotes

A desktop-first timeline notebook. Create projects, add dated notes with rich text, tags, and attachments, and double-click timeline cards to open a spacious editor with references to other notes. Side panels collapse to keep focus when you need it.

## Install

- Download the latest Windows installer (MSI) from Releases and run it.
- First launch will restore your last project; if none, start with the default project.

## Quickstart

1. Create/open a project (left sidebar).
2. Add notes from the details panel (`+ New Note`).
3. Double-click any timeline card to open the full editor: edit title/body, dates, tags, attachments, and jump to other notes.
4. Collapse side panels with “Hide” to focus on writing.
5. Export (desktop) to Markdown via **Export…** in the sidebar.

## Controls & Notes

- Date modes: Exact, Approximate range (± days), Broad period (start/end).
- Tags: comma-separated in the details panel or modal.
- Attachments: pick/open files in the desktop app (Tauri).
- Timeline: grouped by year/month based on the zoom selector; filter by tag via the sidebar.
- Panels: sidebar and details panels are collapsible; drag the details panel handle to resize.

## Developing / Contributing

See `docs/DEVELOPMENT.md` for dev setup, build/test scripts, and packaging/updater details. The build plan and task history live in `docs/BUILD_PLAN.md` and `docs/TASKS.md`. Internal guidelines remain in `AGENTS.md`.
