# AGENT INSTRUCTIONS

You are helping build a simple desktop timeline/notes app using Vite + React + TypeScript (web frontend), with Tauri added later for desktop packaging and basic filesystem access. Follow these rules:

## Workflow Rules
- Follow tasks in order. Use the “TASK LIST” below as the single source of truth.
- Do not skip tasks. Only move to the next task when the current one is fully implemented and working.
- Update this file as you work. Each task is marked with [ ] initially. When a task is complete, change [ ] to [x]. Do not delete tasks; always keep the history.
- Keep the app runnable after every task. After code changes for a task, run the dev server (`npm run dev` before Tauri, `npm run tauri dev` after Tauri is integrated). Fix compile/runtime errors before marking the task complete.
- Keep changes minimal and focused. Only implement what the current task describes. Avoid adding extra abstractions, libraries, or features unless required.
- Use TypeScript strictly (no `any` unless absolutely necessary). Prefer simple functional React components. Keep state at the highest necessary level (usually `App.tsx`) and pass props down. Place new components under `src/components/`.
- Do not introduce a database or backend server. Persist data with `localStorage` first. Use Tauri only for desktop shell, dialogs, and file IO when instructed.
- If something already exists, adapt instead of rewriting.

## Context Summary
Goal: Desktop timeline notes app where each note has:
- Title and formatted body (later with bullet/numbered lists).
- A time context: exact date/time, approximate date ± range, or broad period.
- Tags with simple tag-based filtering.
- Attachments that open via the OS.
- Ability to export a filtered set of notes as Markdown.

We start as a pure Vite + React + TypeScript SPA, then wrap it with Tauri.

## TASK LIST

### Phase 1 – Basic layout and mock data
- [x] **Task 1: Verify base Vite + React + TypeScript setup**  
  Ensure `npm run dev` works and default Vite/React starter screen renders. No other changes.  
  _Status:_ ✅ `npm run dev -- --host 127.0.0.1 --port 5173` started successfully, and hitting `http://127.0.0.1:5173` returned the default Vite HTML shell, so the base setup is confirmed.

- [x] **Task 2: Create basic three-panel layout**  
  Replace starter content with Sidebar, MainView (TimelineList), and NoteDetailsPanel. Use Flexbox, add `src/components/Sidebar.tsx`, `TimelineList.tsx`, `NoteDetailsPanel.tsx`. Hardcode a couple of note titles and placeholder text.  
  _Status:_ ✅ Layout now uses a flex-based shell in `App.tsx` with dedicated Sidebar, TimelineList (hardcoded sample notes), and NoteDetailsPanel components plus updated styles in `App.css`/`index.css`.

- [x] **Task 3: Add mock notes and simple selection**  
  Use `mockNotes`, `useState` for notes and `selectedNoteId`, pass selection handlers, click cards to update NoteDetailsPanel.  
  _Status:_ ✅ `App.tsx` now seeds `mockNotes`, stores them with `useState`, tracks `selectedNoteId`, passes props into `TimelineList`, and shows the selected note (or “Select a note”) in `NoteDetailsPanel`. Cards toggle the selection via clicks/keyboard.

### Phase 2 – Real note model and editing
- [x] **Task 4: Introduce a Note type**  
  Create `src/types/Note.ts` with `DateType` and `Note`; update mock notes to match.  
  _Status:_ ✅ Added `Note`/`DateType` definitions, migrated state + components to consume the shared type, and seeded mock notes with placeholder date metadata + empty tag arrays.

- [x] **Task 5: Make the note details editable (title + body)**  
  Add `updateNote` helper, wire `<input>` and `<textarea>` in NoteDetailsPanel.  
  _Status:_ ✅ `App.tsx` now exposes `updateNote` and passes it to `NoteDetailsPanel`, which renders controlled input/textarea fields so edits instantly adjust the timeline cards.

- [x] **Task 6: Add “New note” button**  
  Button creates a new blank note, appends to state, selects it.  
  _Status:_ ✅ Sidebar now shows a “+ New Note” button that calls `createNewNote` in `App.tsx`, seeding a blank note (exact date default) and selecting it immediately so the details panel is ready for input.

### Phase 3 – Date handling (simple UI)
- [x] **Task 7: Add basic date fields to details panel**  
  Dropdown for `dateType`, show appropriate date inputs, update note on change.  
  _Status:_ ✅ `NoteDetailsPanel` now renders a `dateType` select plus the relevant date inputs for exact, approx range (with ± days), and broad period, all wired to `updateNote`.

- [x] **Task 8: Display a date summary in the note list and sort by date**  
  Show summary per note, sort by `dateStart`, fallback to insertion order.  
  _Status:_ ✅ Timeline cards now include a concise date summary string (exact/around/period) derived from each note and we sort the list by `dateStart`, falling back to original order when missing.

### Phase 4 – Tags and basic filtering
- [x] **Task 9: Add tag editing in the details panel**  
  Text input for comma-separated tags, update `note.tags`.  
  _Status:_ ✅ Details panel now includes a comma-separated tags input that keeps `note.tags` in sync (trimming whitespace and dropping empties) via `updateNote`.

- [x] **Task 10: Display tags in the note list and add a simple tag filter**  
  Show tags per note, add sidebar filter that narrows list case-insensitively.  
  _Status:_ ✅ Timeline cards render tags as pill chips, and the sidebar’s “Filter by tag” input filters notes via case-insensitive tag matches before rendering the list.

### Phase 5 – Simple timeline grouping
- [x] **Task 11: Group notes by year and add a simple “zoom” selector**  
  Zoom select (Years/Months), group notes accordingly with headings, highlight selected note.  
  _Status:_ ✅ Sidebar exposes a zoom selector tied to App state, and TimelineList groups the sorted notes by year or year-month with headings while retaining the selected-note highlight.

### Phase 6 – Local persistence without backend
- [x] **Task 12: Persist notes to localStorage**  
  Read/write state via `localStorage`, optionally persist selection/filter/zoom.  
  _Status:_ ✅ Notes, selected note ID, tag filter, and zoom level hydrate from `localStorage` on load and write back via `useEffect`, so edits survive refreshes.

### Phase 7 – Add Tauri desktop shell
- [x] **Task 13: Integrate Tauri and run the app as a desktop window**  
  Add Tauri; ensure both `npm run dev` and `npm run tauri dev` work.  
  _Status:_ ✅ Installed required GTK/WebKit build deps (`libwebkit2gtk-4.1-dev`, `libgtk-3-dev`, etc.), and `npm run tauri dev` now builds and launches the desktop shell while `npm run dev` continues to serve the SPA.

### Phase 8 – Attachments (minimal filesystem integration)
- [x] **Task 14: Extend the Note model with attachments and build basic UI**  
  Add `Attachment` type, note `attachments: Attachment[]`, placeholder add button.
  _Status:_ ✅ Added shared `Attachment` type, appended `attachments` to notes with hydration defaults, and exposed an attachments section in the note details panel.

- [x] **Task 15: Wire up Tauri file dialogs and open attachments**  
  Use Tauri dialogs to add attachments and open them via OS.
  _Status:_ ✅ Installed Tauri dialog/shell plugins and wired the details panel “Add” button to the native file picker (desktop only); attachments are stored on the note and “Open” uses Tauri shell to launch the file path.

### Phase 9 – Export notes (Markdown, simple)
- [x] **Task 16: Add a basic export dialog and Markdown export**  
  Export selected notes to Markdown via Tauri save dialog.
  _Status:_ ✅ Added an Export modal with scope selection (all vs filtered), Markdown composition, and Tauri save dialog + filesystem writes for desktop builds.

### Phase 10 – Upgrade note body to support lists (optional but recommended)
- [x] **Task 17: Replace `<textarea>` with a simple rich-text editor**  
  Integrate Tiptap/Lexical (or similar) to support lists; persist editor content.
  _Status:_ ✅ Swapped the textarea for a Lexical-powered rich-text editor with basic formatting controls and list support, storing body content as HTML and updating previews/export handling.
