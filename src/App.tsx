import { useEffect, useState } from 'react'
import { save as saveDialog } from '@tauri-apps/plugin-dialog'
import { writeTextFile } from '@tauri-apps/plugin-fs'
import './App.css'
import Sidebar from './components/Sidebar'
import TimelineList from './components/TimelineList'
import NoteDetailsPanel from './components/NoteDetailsPanel'
import ExportDialog from './components/ExportDialog'
import type { Note } from './types/Note'
import {
  getDateSummary,
  sortNotesByDate,
  htmlToMarkdown,
} from './utils/noteFormatting'

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'First note',
    body: 'Sketch the early concept for a time-oriented note system.',
    dateType: 'exact',
    dateStart: '2024-02-10',
    tags: [],
    attachments: [],
  },
  {
    id: '2',
    title: 'Trip to X',
    body: 'Outline travel logistics, highlights, and people to meet.',
    dateType: 'approx_range',
    dateStart: '2023-08-15',
    rangeMarginDays: 3,
    tags: [],
    attachments: [],
  },
  {
    id: '3',
    title: 'Workshop recap',
    body: 'Summaries of the design sessions and key follow-ups.',
    dateType: 'broad_period',
    dateStart: '2022-09-01',
    dateEnd: '2022-12-31',
    tags: [],
    attachments: [],
  },
]

const STORAGE_KEYS = {
  notes: 'timeline-notes',
  selected: 'timeline-selected-note',
  tagFilter: 'timeline-tag-filter',
  zoom: 'timeline-zoom-level',
} as const

const loadStoredNotes = (): Note[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.notes)
    if (!raw) return mockNotes
    const parsed = JSON.parse(raw) as Note[]
    if (!Array.isArray(parsed)) return mockNotes
    return parsed.map((note) => ({
      ...note,
      attachments: note.attachments ?? [],
    }))
  } catch {
    return mockNotes
  }
}

const loadStoredString = (
  key: string,
  fallback: string | null = null,
): string | null => {
  try {
    const value = localStorage.getItem(key)
    if (value === null || value === undefined) return fallback
    return value
  } catch {
    return fallback
  }
}

const loadStoredZoom = (): 'years' | 'months' => {
  const value = loadStoredString(STORAGE_KEYS.zoom, 'years')
  return value === 'months' ? 'months' : 'years'
}

function App() {
  const [notes, setNotes] = useState<Note[]>(() => loadStoredNotes())
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() =>
    loadStoredString(STORAGE_KEYS.selected),
  )
  const [tagFilter, setTagFilter] = useState(
    loadStoredString(STORAGE_KEYS.tagFilter, '') ?? '',
  )
  const [zoomLevel, setZoomLevel] = useState<'years' | 'months'>(() =>
    loadStoredZoom(),
  )
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all')
  const isTauri =
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window

  const selectedNote =
    notes.find((note) => note.id === selectedNoteId) ?? null

  const selectNote = (noteId: string) => {
    setSelectedNoteId(noteId)
  }

  const updateNote = (noteId: string, patch: Partial<Note>) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? {
              ...note,
              ...patch,
            }
          : note,
      ),
    )
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(notes))
  }, [notes])

  useEffect(() => {
    if (selectedNoteId) {
      localStorage.setItem(STORAGE_KEYS.selected, selectedNoteId)
    } else {
      localStorage.removeItem(STORAGE_KEYS.selected)
    }
  }, [selectedNoteId])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.tagFilter, tagFilter)
  }, [tagFilter])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.zoom, zoomLevel)
  }, [zoomLevel])

  const createNewNote = () => {
    const now = new Date()
    const newNote: Note = {
      id: `note-${now.getTime()}`,
      title: '',
      body: '',
      dateType: 'exact',
      dateStart: now.toISOString().slice(0, 10),
      tags: [],
      attachments: [],
    }
    setNotes((prev) => [...prev, newNote])
    setSelectedNoteId(newNote.id)
  }

  const normalizedFilter = tagFilter.trim().toLowerCase()
  const filteredNotes =
    normalizedFilter.length === 0
      ? notes
      : notes.filter((note) =>
          note.tags.some((tag) => tag.toLowerCase().includes(normalizedFilter)),
        )
  const notesForScope =
    exportScope === 'filtered' ? filteredNotes : notes
  const hasFilteredSubset = filteredNotes.length !== notes.length

  const openExportDialog = () => {
    setExportScope(hasFilteredSubset ? 'filtered' : 'all')
    setIsExportDialogOpen(true)
  }

  const buildMarkdown = (noteList: Note[]) => {
    const sorted = sortNotesByDate(noteList)
    const formatted = sorted.map((note) => {
      const title = note.title.trim() || 'Untitled note'
      const dateLine = getDateSummary(note)
      const tagsLine =
        note.tags.length > 0 ? note.tags.join(', ') : 'No tags'

      const markdownBody = htmlToMarkdown(note.body)

      return [
        `# ${title}`,
        `Date: ${dateLine}`,
        `Tags: ${tagsLine}`,
        '',
        markdownBody,
      ].join('\n')
    })

    return formatted.join('\n\n---\n\n')
  }

  const handleExport = async () => {
    if (notesForScope.length === 0) {
      window.alert('There are no notes to export.')
      return
    }
    if (!isTauri) {
      window.alert('Export is available in the desktop app.')
      setIsExportDialogOpen(false)
      return
    }
    try {
      const markdown = buildMarkdown(notesForScope)
      const targetPath = await saveDialog({
        title: 'Export notes',
        defaultPath: 'chrononotes-notes.md',
        filters: [
          {
            name: 'Markdown',
            extensions: ['md'],
          },
        ],
      })
      if (!targetPath) return
      await writeTextFile(targetPath, markdown)
      setIsExportDialogOpen(false)
      window.alert('Export complete.')
    } catch (error) {
      console.error('Error exporting notes', error)
      window.alert('Unable to export notes right now.')
    }
  }

  return (
    <div className="app-shell">
      <aside className="panel sidebar-panel">
        <Sidebar
          onNewNote={createNewNote}
          onExport={openExportDialog}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
          zoomLevel={zoomLevel}
          onZoomLevelChange={setZoomLevel}
        />
      </aside>
      <main className="panel main-panel">
        <TimelineList
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          selectNote={selectNote}
          zoomLevel={zoomLevel}
        />
      </main>
      <section className="panel details-panel">
        <NoteDetailsPanel
          selectedNote={selectedNote}
          updateNote={updateNote}
        />
      </section>
      <ExportDialog
        isOpen={isExportDialogOpen}
        scope={exportScope}
        onScopeChange={setExportScope}
        onConfirm={() => void handleExport()}
        onCancel={() => setIsExportDialogOpen(false)}
        totalCount={notes.length}
        filteredCount={filteredNotes.length}
      />
    </div>
  )
}

export default App
