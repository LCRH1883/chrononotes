import { useEffect, useRef, useState } from 'react'
import { open as openDialog, save as saveDialog } from '@tauri-apps/plugin-dialog'
import { mkdir, writeTextFile } from '@tauri-apps/plugin-fs'
import { join } from '@tauri-apps/api/path'
import './App.css'
import Sidebar from './components/Sidebar'
import TimelineList from './components/TimelineList'
import NoteDetailsPanel from './components/NoteDetailsPanel'
import ExportDialog from './components/ExportDialog'
import CreateProjectDialog from './components/CreateProjectDialog'
import type { Note } from './types/Note'
import type { Project } from './types/Project'
import {
  getDateSummary,
  sortNotesByDate,
  htmlToMarkdown,
} from './utils/noteFormatting'
import {
  deriveProjectId,
  loadProject,
  loadStateForProject,
  persistStateForProject,
  projectLabelFromPath,
  saveProject,
} from './utils/projectStorage'

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

function App() {
  const [project, setProject] = useState<Project>(() => loadProject())
  const initialState = loadStateForProject(project.id, mockNotes)
  const [notes, setNotes] = useState<Note[]>(() => initialState.notes)
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(
    () => initialState.selected ?? null,
  )
  const [tagFilter, setTagFilter] = useState(initialState.tagFilter)
  const [zoomLevel, setZoomLevel] = useState<'years' | 'months'>(
    initialState.zoom,
  )
  const [detailsWidth, setDetailsWidth] = useState(380)
  const [isResizing, setIsResizing] = useState(false)
  const resizeStartX = useRef(0)
  const resizeStartWidth = useRef(380)
  const shellRef = useRef<HTMLDivElement | null>(null)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [exportScope, setExportScope] = useState<'all' | 'filtered'>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newProjectName, setNewProjectName] = useState('chrononotes-project')
  const [newProjectParent, setNewProjectParent] = useState<string | null>(null)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false)
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
    persistStateForProject(project.id, {
      notes,
      selectedNoteId,
      tagFilter,
      zoomLevel,
    })
  }, [notes, selectedNoteId, tagFilter, zoomLevel, project.id])

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

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return
      const delta = event.clientX - resizeStartX.current
      const rawWidth = resizeStartWidth.current - delta
      const clamped = Math.min(Math.max(rawWidth, 320), 620)
      setDetailsWidth(clamped)
    }

    const stopResize = () => {
      setIsResizing(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizing) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', stopResize)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', stopResize)
    }
  }, [isResizing])

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

  const switchProject = async () => {
    if (!isTauri) {
      window.alert('Project folders can be picked in the desktop app.')
      return
    }
    try {
      const folder = await openDialog({
        directory: true,
        multiple: false,
      })
      if (!folder || Array.isArray(folder)) return
      const id = deriveProjectId(folder)
      const label = projectLabelFromPath(folder)
      const nextProject: Project = { id, label, path: folder }
      saveProject(nextProject)
      const nextState = loadStateForProject(nextProject.id, mockNotes)
      setProject(nextProject)
      setNotes(nextState.notes)
      setSelectedNoteId(nextState.selected ?? null)
      setTagFilter(nextState.tagFilter)
      setZoomLevel(nextState.zoom)
    } catch (error) {
      console.error('Error switching project', error)
      window.alert('Unable to open that project folder.')
    }
  }

  const startCreateProject = () => {
    if (!isTauri) {
      window.alert('Creating projects is available in the desktop app.')
      return
    }
    setNewProjectName('chrononotes-project')
    setNewProjectParent(null)
    setCreateError(null)
    setIsCreateDialogOpen(true)
  }

  const pickCreateProjectFolder = async () => {
    try {
      const parent = await openDialog({
        directory: true,
        multiple: false,
        title: 'Choose where to create your project folder',
      })
      if (!parent || Array.isArray(parent)) return
      setNewProjectParent(parent)
      setCreateError(null)
    } catch (error) {
      console.error('Error picking project folder', error)
      setCreateError('Unable to open the folder picker.')
    }
  }

  const confirmCreateProject = async () => {
    if (!isTauri) {
      window.alert('Creating projects is available in the desktop app.')
      setIsCreateDialogOpen(false)
      return
    }
    if (isCreatingProject) return
    const trimmedName = newProjectName.trim()
    if (trimmedName.length === 0) {
      setCreateError('Enter a project name.')
      return
    }
    if (!newProjectParent) {
      setCreateError('Choose a parent folder.')
      return
    }
    setIsCreatingProject(true)
    setCreateError(null)
    try {
      const targetPath = await join(newProjectParent, trimmedName)
      await mkdir(targetPath, { recursive: true })
      const id = deriveProjectId(targetPath)
      const label = projectLabelFromPath(targetPath)
      const nextProject: Project = { id, label, path: targetPath }
      saveProject(nextProject)
      const nextState = loadStateForProject(nextProject.id, [])
      setProject(nextProject)
      setNotes(nextState.notes)
      setSelectedNoteId(nextState.selected ?? null)
      setTagFilter(nextState.tagFilter)
      setZoomLevel(nextState.zoom)
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Error creating project', error)
      setCreateError('Unable to create that project.')
    } finally {
      setIsCreatingProject(false)
    }
  }

  return (
    <div className="app-shell" ref={shellRef}>
      {isSidebarCollapsed ? (
        <button
          type="button"
          className="panel-toggle panel-toggle--left"
          onClick={() => setIsSidebarCollapsed(false)}
        >
          Show sidebar
        </button>
      ) : (
        <aside className="panel sidebar-panel">
          <Sidebar
            onExport={openExportDialog}
            tagFilter={tagFilter}
            onTagFilterChange={setTagFilter}
            zoomLevel={zoomLevel}
            onZoomLevelChange={setZoomLevel}
            projectLabel={project.label}
            onChangeProject={switchProject}
            onCreateProject={startCreateProject}
            onHideSidebar={() => setIsSidebarCollapsed(true)}
          />
        </aside>
      )}
      <main className="panel main-panel">
        <TimelineList
          notes={filteredNotes}
          selectedNoteId={selectedNoteId}
          selectNote={selectNote}
          zoomLevel={zoomLevel}
        />
      </main>
      {isDetailsCollapsed ? (
        <button
          type="button"
          className="panel-toggle panel-toggle--right"
          onClick={() => setIsDetailsCollapsed(false)}
        >
          Show details
        </button>
      ) : (
        <section
          className="panel details-panel"
          style={{ width: `${detailsWidth}px` }}
        >
          <button
            type="button"
            aria-label="Resize details panel"
            className={`details-panel__handle${
              isResizing ? ' details-panel__handle--active' : ''
            }`}
            onMouseDown={(event) => {
              resizeStartX.current = event.clientX
              resizeStartWidth.current = detailsWidth
              setIsResizing(true)
              event.preventDefault()
            }}
          />
          <NoteDetailsPanel
            selectedNote={selectedNote}
            updateNote={updateNote}
            onNewNote={createNewNote}
            onHideDetails={() => setIsDetailsCollapsed(true)}
          />
        </section>
      )}
      <ExportDialog
        isOpen={isExportDialogOpen}
        scope={exportScope}
        onScopeChange={setExportScope}
        onConfirm={() => void handleExport()}
        onCancel={() => setIsExportDialogOpen(false)}
        totalCount={notes.length}
        filteredCount={filteredNotes.length}
      />
      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        projectName={newProjectName}
        parentPath={newProjectParent}
        onProjectNameChange={setNewProjectName}
        onBrowseFolder={() => void pickCreateProjectFolder()}
        onCancel={() => setIsCreateDialogOpen(false)}
        onConfirm={() => void confirmCreateProject()}
        errorMessage={createError}
        isBusy={isCreatingProject}
      />
    </div>
  )
}

export default App
