import type { Note } from '../types/Note'
import type { Project } from '../types/Project'

const PROJECT_KEY = 'timeline-project-current'

const defaultProject: Project = {
  id: 'default',
  label: 'Default',
}

const storageFor = (projectId: string) => ({
  notes: `timeline-notes::${projectId}`,
  selected: `timeline-selected-note::${projectId}`,
  tagFilter: `timeline-tag-filter::${projectId}`,
  zoom: `timeline-zoom-level::${projectId}`,
})

export const deriveProjectId = (path: string | undefined) => {
  if (!path) return 'default'
  return `path:${path}`
}

export const projectLabelFromPath = (path: string | undefined) => {
  if (!path) return 'Default'
  const trimmed = path.replace(/[\\/]+$/, '')
  const parts = trimmed.split(/[\\/]/)
  const last = parts[parts.length - 1]
  return last && last.length > 0 ? last : trimmed
}

export const loadProject = (): Project => {
  try {
    const raw = localStorage.getItem(PROJECT_KEY)
    if (!raw) return defaultProject
    const parsed = JSON.parse(raw) as Project
    if (!parsed.id || !parsed.label) return defaultProject
    return parsed
  } catch {
    return defaultProject
  }
}

export const saveProject = (project: Project) => {
  try {
    localStorage.setItem(PROJECT_KEY, JSON.stringify(project))
  } catch {
    // ignore
  }
}

const parseNotes = (raw: string | null, fallback: Note[]) => {
  if (!raw) return fallback
  try {
    const parsed = JSON.parse(raw) as Note[]
    if (!Array.isArray(parsed)) return fallback
    return parsed.map((note) => ({
      ...note,
      attachments: note.attachments ?? [],
    }))
  } catch {
    return fallback
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

export const loadStateForProject = (
  projectId: string,
  fallbackNotes: Note[],
): {
  notes: Note[]
  selected: string | null
  tagFilter: string
  zoom: 'years' | 'months'
} => {
  const keys = storageFor(projectId)
  const notes = parseNotes(localStorage.getItem(keys.notes), fallbackNotes)
  const selected = loadStoredString(keys.selected)
  const tagFilter = loadStoredString(keys.tagFilter, '') ?? ''
  const zoom = loadStoredString(keys.zoom, 'years') === 'months' ? 'months' : 'years'
  return { notes, selected, tagFilter, zoom }
}

export const persistStateForProject = (
  projectId: string,
  data: {
    notes: Note[]
    selectedNoteId: string | null
    tagFilter: string
    zoomLevel: 'years' | 'months'
  },
) => {
  const keys = storageFor(projectId)
  localStorage.setItem(keys.notes, JSON.stringify(data.notes))
  if (data.selectedNoteId) {
    localStorage.setItem(keys.selected, data.selectedNoteId)
  } else {
    localStorage.removeItem(keys.selected)
  }
  localStorage.setItem(keys.tagFilter, data.tagFilter)
  localStorage.setItem(keys.zoom, data.zoomLevel)
}

export const getStorageKeys = storageFor

export const getDefaultProject = () => defaultProject
