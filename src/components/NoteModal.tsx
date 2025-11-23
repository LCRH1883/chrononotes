import { useMemo, useState, type ChangeEvent } from 'react'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { open as openShell } from '@tauri-apps/plugin-shell'
import RichTextEditor from './RichTextEditor'
import { getDateSummary, sortNotesByDate } from '../utils/noteFormatting'
import type { Attachment, DateType, Note } from '../types/Note'

interface NoteModalProps {
  isOpen: boolean
  note: Note | null
  onClose: () => void
  updateNote: (id: string, patch: Partial<Note>) => void
  onNewNote: () => void
  otherNotes: Note[]
  onSelectNote: (noteId: string) => void
}

function NoteModal({
  isOpen,
  note,
  onClose,
  updateNote,
  onNewNote,
  otherNotes,
  onSelectNote,
}: NoteModalProps) {
  const isTauri =
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  const [isAddingAttachment, setIsAddingAttachment] = useState(false)

  const sortedOthers = useMemo(
    () => sortNotesByDate(otherNotes),
    [otherNotes],
  )

  if (!isOpen) return null

  const buildAttachment = (filePath: string): Attachment => {
    const parts = filePath.split(/[\\/]/)
    const fileName = parts[parts.length - 1] ?? filePath
    const id =
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `att-${Date.now()}-${Math.random().toString(16).slice(2)}`)
    return { id, fileName, filePath }
  }

  const handleAddAttachment = async () => {
    if (!note) return
    if (!isTauri) {
      window.alert('Attachment picking is available in the desktop app.')
      return
    }
    if (isAddingAttachment) return
    setIsAddingAttachment(true)
    try {
      const selection = await openDialog({
        multiple: true,
        directory: false,
      })
      if (!selection) return
      const paths = Array.isArray(selection) ? selection : [selection]
      const newAttachments = paths
        .filter((path): path is string => Boolean(path))
        .map((path) => buildAttachment(path))
      if (newAttachments.length === 0) return
      updateNote(note.id, {
        attachments: [...note.attachments, ...newAttachments],
      })
    } catch (error) {
      console.error('Error picking attachments', error)
      window.alert('Unable to pick attachments right now.')
    } finally {
      setIsAddingAttachment(false)
    }
  }

  const handleOpenAttachment = async (filePath: string) => {
    if (!isTauri) {
      window.alert('Opening attachments works in the desktop app.')
      return
    }
    try {
      await openShell(filePath)
    } catch (error) {
      console.error('Error opening attachment', error)
      window.alert('Unable to open this attachment.')
    }
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!note) return
    const next = note.attachments.filter((att) => att.id !== attachmentId)
    updateNote(note.id, { attachments: next })
  }

  if (!note) {
    return (
      <div className="note-modal-overlay" role="dialog" aria-modal="true">
        <div className="note-modal">
          <div className="note-modal__header">
            <div>
              <h3>Note details</h3>
              <p>Double-click a note to view it here.</p>
            </div>
            <div className="note-modal__actions">
              <button
                type="button"
                className="export-button export-button--primary"
                onClick={onNewNote}
              >
                + New Note
              </button>
              <button
                type="button"
                className="export-button export-button--ghost"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(note.id, { title: event.target.value })
  }

  const handleDateTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    updateNote(note.id, { dateType: event.target.value as DateType })
  }

  const handleDateStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(note.id, { dateStart: event.target.value })
  }

  const handleDateEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(note.id, { dateEnd: event.target.value })
  }

  const handleRangeMarginChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target
    updateNote(note.id, {
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
    updateNote(note.id, { tags })
  }

  const handleBodyHtmlChange = (html: string) => {
    updateNote(note.id, { body: html })
  }

  const tagsDisplayValue = note.tags.join(', ')

  return (
    <div className="note-modal-overlay" role="dialog" aria-modal="true">
      <div className="note-modal">
        <div className="note-modal__header">
          <div>
            <h3>{note.title.trim() || 'Untitled note'}</h3>
            <p>{getDateSummary(note)}</p>
          </div>
          <div className="note-modal__actions">
            <button
              type="button"
              className="export-button export-button--primary"
              onClick={onNewNote}
            >
              + New Note
            </button>
            <button
              type="button"
              className="export-button export-button--ghost"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        <div className="note-modal__body">
          <div className="note-modal__main">
            <label>
              <span>Title</span>
              <input
                type="text"
                value={note.title}
                onChange={handleTitleChange}
                placeholder="Note title"
              />
            </label>
            <div className="note-modal__richtext">
              <span>Body</span>
              <RichTextEditor
                noteId={note.id}
                value={note.body}
                onChange={handleBodyHtmlChange}
              />
            </div>
          </div>
          <div className="note-modal__side">
            <div className="note-modal__card">
              <h4>Timing</h4>
              <label>
                <span>Date type</span>
                <select
                  value={note.dateType}
                  onChange={handleDateTypeChange}
                >
                  <option value="exact">Exact</option>
                  <option value="approx_range">Approximate range</option>
                  <option value="broad_period">Broad period</option>
                </select>
              </label>
              {note.dateType === 'exact' && (
                <label>
                  <span>Date</span>
                  <input
                    type="date"
                    value={note.dateStart ?? ''}
                    onChange={handleDateStartChange}
                  />
                </label>
              )}
              {note.dateType === 'approx_range' && (
                <>
                  <label>
                    <span>Base date</span>
                    <input
                      type="date"
                      value={note.dateStart ?? ''}
                      onChange={handleDateStartChange}
                    />
                  </label>
                  <label>
                    <span>Range margin (± days)</span>
                    <input
                      type="number"
                      value={
                        note.rangeMarginDays !== undefined
                          ? note.rangeMarginDays
                          : ''
                      }
                      onChange={handleRangeMarginChange}
                      min={0}
                    />
                  </label>
                </>
              )}
              {note.dateType === 'broad_period' && (
                <>
                  <label>
                    <span>Start date</span>
                    <input
                      type="date"
                      value={note.dateStart ?? ''}
                      onChange={handleDateStartChange}
                    />
                  </label>
                  <label>
                    <span>End date</span>
                    <input
                      type="date"
                      value={note.dateEnd ?? ''}
                      onChange={handleDateEndChange}
                    />
                  </label>
                </>
              )}
            </div>

            <div className="note-modal__card">
              <h4>Tags</h4>
              <input
                type="text"
                value={tagsDisplayValue}
                onChange={handleTagsChange}
                placeholder="e.g. travel, research, draft"
              />
            </div>

            <div className="note-modal__card">
              <div className="note-modal__card-header">
                <h4>Attachments</h4>
                <button
                  type="button"
                  className="attachments__button"
                  onClick={() => void handleAddAttachment()}
                  disabled={isAddingAttachment}
                >
                  {isAddingAttachment ? 'Adding…' : '+'}
                </button>
              </div>
              {note.attachments.length === 0 ? (
                <p className="attachments__empty">No attachments yet.</p>
              ) : (
                <ul className="attachments__list">
                  {note.attachments.map((attachment) => (
                    <li key={attachment.id} className="attachments__item">
                      <div className="attachments__item-text">
                        <strong>{attachment.fileName}</strong>
                        <span className="attachments__path">
                          {attachment.filePath}
                        </span>
                      </div>
                      <div className="attachments__item-actions">
                        <button
                          type="button"
                          className="attachments__open-button"
                          onClick={() =>
                            void handleOpenAttachment(attachment.filePath)
                          }
                        >
                          Open
                        </button>
                        <button
                          type="button"
                          className="attachments__remove-button"
                          onClick={() =>
                            handleRemoveAttachment(attachment.id)
                          }
                        >
                          Del
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="note-modal__card">
              <div className="note-modal__card-header">
                <h4>Other notes</h4>
                <span className="note-modal__muted">
                  Quick references, click to switch
                </span>
              </div>
              {sortedOthers.length === 0 ? (
                <p className="attachments__empty">No other notes yet.</p>
              ) : (
                <ul className="note-modal__references">
                  {sortedOthers.map((other) => (
                    <li key={other.id}>
                      <button
                        type="button"
                        className="note-modal__reference"
                        onClick={() => onSelectNote(other.id)}
                      >
                        <div className="note-modal__reference-title">
                          {other.title.trim() || 'Untitled note'}
                        </div>
                        <div className="note-modal__reference-meta">
                          {getDateSummary(other)}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteModal
