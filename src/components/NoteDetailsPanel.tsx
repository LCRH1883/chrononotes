import type { ChangeEvent } from 'react'
import type { Note } from '../types/Note'
import type { DateType } from '../types/Note'

interface NoteDetailsPanelProps {
  selectedNote: Note | null
  updateNote: (id: string, patch: Partial<Note>) => void
}

function NoteDetailsPanel({ selectedNote, updateNote }: NoteDetailsPanelProps) {
  if (!selectedNote) {
    return (
      <div className="details">
        <h2>Note Details</h2>
        <p className="details__placeholder">Select a note to see its contents.</p>
      </div>
    )
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(selectedNote.id, { title: event.target.value })
  }

  const handleBodyChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateNote(selectedNote.id, { body: event.target.value })
  }

  const handleDateTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateNote(selectedNote.id, { dateType: event.target.value as DateType })
  }

  const handleDateStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(selectedNote.id, { dateStart: event.target.value })
  }

  const handleDateEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(selectedNote.id, { dateEnd: event.target.value })
  }

  const handleRangeMarginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    updateNote(selectedNote.id, {
      rangeMarginDays: value === '' ? undefined : Number(value),
    })
  }

  const handleTagsChange = (event: ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value
    const tags =
      raw
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0) ?? []
    updateNote(selectedNote.id, { tags })
  }

  return (
    <div className="details">
      <h2>Editing Note</h2>
      <div className="details__form">
        <label>
          <span>Title</span>
          <input
            type="text"
            value={selectedNote.title}
            onChange={handleTitleChange}
            placeholder="Note title"
          />
        </label>
        <label>
          <span>Body</span>
          <textarea
            value={selectedNote.body}
            onChange={handleBodyChange}
            placeholder="Write the body..."
            rows={10}
          />
        </label>
        <label>
          <span>Date type</span>
          <select
            value={selectedNote.dateType}
            onChange={handleDateTypeChange}
          >
            <option value="exact">Exact</option>
            <option value="approx_range">Approximate range</option>
            <option value="broad_period">Broad period</option>
          </select>
        </label>
        {selectedNote.dateType === 'exact' && (
          <label>
            <span>Date</span>
            <input
              type="date"
              value={selectedNote.dateStart ?? ''}
              onChange={handleDateStartChange}
            />
          </label>
        )}
        {selectedNote.dateType === 'approx_range' && (
          <>
            <label>
              <span>Base date</span>
              <input
                type="date"
                value={selectedNote.dateStart ?? ''}
                onChange={handleDateStartChange}
              />
            </label>
            <label>
              <span>Range margin (± days)</span>
              <input
                type="number"
                value={
                  selectedNote.rangeMarginDays !== undefined
                    ? selectedNote.rangeMarginDays
                    : ''
                }
                onChange={handleRangeMarginChange}
                min={0}
              />
            </label>
          </>
        )}
        {selectedNote.dateType === 'broad_period' && (
          <>
            <label>
              <span>Start date</span>
              <input
                type="date"
                value={selectedNote.dateStart ?? ''}
                onChange={handleDateStartChange}
              />
            </label>
            <label>
              <span>End date</span>
              <input
                type="date"
                value={selectedNote.dateEnd ?? ''}
                onChange={handleDateEndChange}
              />
            </label>
          </>
        )}
        <label>
          <span>Tags (comma-separated)</span>
          <input
            type="text"
            value={selectedNote.tags.join(', ')}
            onChange={handleTagsChange}
            placeholder="e.g. travel, research, draft"
          />
        </label>
      </div>
    </div>
  )
}

export default NoteDetailsPanel
