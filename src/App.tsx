import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import TimelineList from './components/TimelineList'
import NoteDetailsPanel from './components/NoteDetailsPanel'
import type { Note } from './types/Note'

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'First note',
    body: 'Sketch the early concept for a time-oriented note system.',
    dateType: 'exact',
    dateStart: '2024-02-10',
    tags: [],
  },
  {
    id: '2',
    title: 'Trip to X',
    body: 'Outline travel logistics, highlights, and people to meet.',
    dateType: 'approx_range',
    dateStart: '2023-08-15',
    rangeMarginDays: 3,
    tags: [],
  },
  {
    id: '3',
    title: 'Workshop recap',
    body: 'Summaries of the design sessions and key follow-ups.',
    dateType: 'broad_period',
    dateStart: '2022-09-01',
    dateEnd: '2022-12-31',
    tags: [],
  },
]

function App() {
  const [notes, setNotes] = useState<Note[]>(mockNotes)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [tagFilter, setTagFilter] = useState('')

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

  const createNewNote = () => {
    const now = new Date()
    const newNote: Note = {
      id: `note-${now.getTime()}`,
      title: '',
      body: '',
      dateType: 'exact',
      dateStart: now.toISOString().slice(0, 10),
      tags: [],
    }
    setNotes((prev) => [...prev, newNote])
    setSelectedNoteId(newNote.id)
  }

  const filteredNotes =
    tagFilter.trim().length === 0
      ? notes
      : notes.filter((note) =>
          note.tags.some(
            (tag) => tag.toLowerCase() === tagFilter.trim().toLowerCase(),
          ),
        )

  return (
    <div className="app-shell">
      <aside className="panel sidebar-panel">
        <Sidebar
          onNewNote={createNewNote}
          tagFilter={tagFilter}
          onTagFilterChange={setTagFilter}
        />
      </aside>
      <main className="panel main-panel">
        <TimelineList
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          selectNote={selectNote}
        />
      </main>
      <section className="panel details-panel">
        <NoteDetailsPanel
          selectedNote={selectedNote}
          updateNote={updateNote}
        />
      </section>
    </div>
  )
}

export default App
