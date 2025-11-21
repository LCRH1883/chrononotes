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

interface TimelineListProps {
  notes: Note[]
  selectedNoteId: string | null
  selectNote: (noteId: string) => void
}

function TimelineList({
  notes,
  selectedNoteId,
  selectNote,
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
      <div className="timeline-list__items">
        {sortedNotes.map((note) => {
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
              <p className="timeline-card__summary">{getDateSummary(note)}</p>
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
  )
}

export default TimelineList
