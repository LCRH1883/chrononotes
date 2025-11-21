import type { Note } from '../types/Note'

const getDateSummary = (note: Note): string => {
  if (note.dateType === 'exact' && note.dateStart) {
    return `Exact: ${note.dateStart}`
  }

  if (
    note.dateType === 'approx_range' &&
    note.dateStart &&
    note.rangeMarginDays !== undefined
  ) {
    return `Around: ${note.dateStart} (±${note.rangeMarginDays} days)`
  }

  if (
    note.dateType === 'broad_period' &&
    note.dateStart &&
    note.dateEnd
  ) {
    return `Period: ${note.dateStart} – ${note.dateEnd}`
  }

  if (note.dateStart) {
    return `Date: ${note.dateStart}`
  }

  return 'No date'
}

const buildGroups = (
  sortedNotes: Note[],
  zoomLevel: 'years' | 'months',
): Array<[string, Note[]]> => {
  const groups = new Map<string, Note[]>()

  const toGroupKey = (note: Note) => {
    if (!note.dateStart) return 'No date'
    const year = note.dateStart.slice(0, 4)
    if (zoomLevel === 'years') {
      return year
    }
    const month = note.dateStart.slice(5, 7)
    return `${year}-${month}`
  }

  sortedNotes.forEach((note) => {
    const key = toGroupKey(note)
    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(note)
  })

  return Array.from(groups.entries())
}

interface TimelineListProps {
  notes: Note[]
  selectedNoteId: string | null
  selectNote: (noteId: string) => void
  zoomLevel: 'years' | 'months'
}

function TimelineList({
  notes,
  selectedNoteId,
  selectNote,
  zoomLevel,
}: TimelineListProps) {
  const sortedNotes = [...notes].sort((a, b) => {
    if (a.dateStart && b.dateStart) {
      return a.dateStart.localeCompare(b.dateStart)
    }
    if (a.dateStart) return -1
    if (b.dateStart) return 1
    return 0
  })

  return (
    <div className="timeline-list">
      <header>
        <h2>Timeline</h2>
        <p className="timeline-list__hint">
          Click a note to view more details in the panel on the right.
        </p>
      </header>
      <div className="timeline-list__groups">
        {buildGroups(sortedNotes, zoomLevel).map(([groupLabel, groupNotes]) => (
          <div key={groupLabel} className="timeline-group">
            <h3 className="timeline-group__heading">{groupLabel}</h3>
            <div className="timeline-group__items">
              {groupNotes.map((note) => {
                const isActive = note.id === selectedNoteId
                return (
                  <article
                    key={note.id}
                    className={`timeline-card${
                      isActive ? ' timeline-card--active' : ''
                    }`}
                    onClick={() => selectNote(note.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        selectNote(note.id)
                      }
                    }}
                  >
                    <h3>{note.title}</h3>
                    <p className="timeline-card__summary">
                      {getDateSummary(note)}
                    </p>
                    <p>{note.body}</p>
                    {note.tags.length > 0 && (
                      <div className="timeline-card__tags">
                        {note.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimelineList
