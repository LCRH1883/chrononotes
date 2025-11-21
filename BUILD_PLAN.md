# Chrononotes Incremental Build Plan

This roadmap keeps development shippable after every step. Complete phases in order, verifying in the running Vite dev server after each milestone.

## Phase 1 – Basic layout with fake data
- Introduce `AppLayout` that renders a Sidebar (left), TimelineList-driven MainView (center), and NoteDetailsPanel (right) using simple flexbox CSS.
- Hardcode `mockNotes` in `App.tsx` (ids, title, preview) and pass them to TimelineList.
- Display notes as clickable cards. Track `selectedNoteId` in component state and show matching note details (or “Select a note”) on the right.

## Phase 2 – Real note model + simple editing
- Define `DateType` and `Note` interfaces with fields for title, body, dates, tags.
- Store editable notes via `useState<Note[]>(initialMockNotes)` and maintain `selectedNoteId`.
- In NoteDetailsPanel, render `<input>` and `<textarea>` fields bound to the selected note, calling `updateNote(noteId, patch)` on change.
- Add a “New note” button in the sidebar or header that seeds a blank note (`dateType: 'exact'`, `dateStart = new Date().toISOString()`) and selects it.

## Phase 3 – Basic date UI
- Allow selecting `dateType` (`exact`, `approx_range`, `broad_period`) via `<select>`.
- Render date inputs: single date for exact, base date + ± margin (number input) for approx_range, start + end dates for broad_period.
- Display a concise summary beneath each TimelineList item (“Exact: 2024-03-10”, “Around: 2024-03-10 (±3 days)”, “Period: 2021-01-01 – 2021-12-31”).
- Sort TimelineList output by `dateStart`, falling back to insertion order if absent.

## Phase 4 – Tags (simple first)
- Add a comma-separated text input in NoteDetailsPanel that reads/writes `string[]` tags.
- Show tags under each note card as small labels.
- Introduce a sidebar “Filter by tag” text input; when populated, filter notes where `tags` contains the typed value (case-insensitive).

## Phase 5 – Minimal timeline behavior
- Group notes by year (and later month) derived from `dateStart`; render group headings (“2024”, “2023”).
- Add a sidebar “Zoom” `<select>` that toggles grouping between yearly and monthly buckets.
- Highlight the active note card to emphasize the current selection.

## Phase 6 – Local persistence
- Persist `notes` (and optionally `selectedNoteId`, zoom) to `localStorage` inside a `useEffect`.
- Hydrate initial state from `localStorage` on app mount, falling back to the initial mocks.

## Phase 7 – Desktop shell via Tauri
- Integrate Tauri so the same React app can run in a desktop window (`npm run tauri dev`).
- Keep data in `localStorage`; no Rust commands yet—the goal is feature parity between web and desktop shells.

## Phase 8 – Attachments
- Extend `Note` with `attachments: Attachment[]` where each entry contains `id`, `fileName`, `filePath`.
- In NoteDetailsPanel, show an attachment list/news button that currently calls a stubbed `pickAttachment()` (later wired with `dialog.open`) and an “Open” button per attachment.
- For the first pass, store the returned path verbatim without copying files.

## Phase 9 – Export
- Add an “Export” button (sidebar or toolbar) that opens a lightweight modal with scope options (“all notes” vs. “filtered”) and a fixed “Markdown” format.
- Compose Markdown in React (`# Title`, date summary, tags, body separated by `---`) and use Tauri APIs to select a destination file and write it.

## Phase 10 – Polish & enhancements
- After all core functionality works, iterate on richer editors (Tiptap/Lexical), improved tag UI, precise month/year date controls, and eventually migrate persistence from `localStorage` to a Rust + SQLite backend for stronger guarantees.
