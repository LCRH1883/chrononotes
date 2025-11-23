import { useEffect, useState, type ChangeEvent } from 'react'
import { open as openDialog } from '@tauri-apps/plugin-dialog'
import { open as openShell } from '@tauri-apps/plugin-shell'
import type { Attachment, DateType, Note } from '../types/Note'
import RichTextEditor from './RichTextEditor'

interface NoteDetailsPanelProps {
  selectedNote: Note | null
  updateNote: (id: string, patch: Partial<Note>) => void
  onNewNote: () => void
  onHideDetails: () => void
}

function NoteDetailsPanel({
  selectedNote,
  updateNote,
  onNewNote,
  onHideDetails,
}: NoteDetailsPanelProps) {
  const isTauri =
    typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window
  const [viewerOpen, setViewerOpen] = useState(false)
  const [tagsInput, setTagsInput] = useState('')

  const header = (
    <div className="details__header">
      <h2>{selectedNote ? 'Editing Note' : 'Note Details'}</h2>
      <div className="details__header-actions">
        <button
          type="button"
          className="details__hide"
          onClick={onHideDetails}
        >
          Hide
        </button>
        <button
          type="button"
          className="details__new-note"
          onClick={onNewNote}
        >
          + New Note
        </button>
      </div>
    </div>
  )

  if (!selectedNote) {
    return (
      <div className="details">
        {header}
        <p className="details__placeholder">Select a note to see its contents.</p>
      </div>
    )
  }

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    updateNote(selectedNote.id, { title: event.target.value })
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
    setTagsInput(raw)
    const tags =
      raw
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0) ?? []
    updateNote(selectedNote.id, { tags })
  }

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
    if (!isTauri) {
      window.alert('Attachment picking is available in the desktop app.')
      return
    }
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
      updateNote(selectedNote.id, {
        attachments: [...selectedNote.attachments, ...newAttachments],
      })
    } catch (error) {
      console.error('Error picking attachments', error)
      window.alert('Unable to pick attachments right now.')
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

  const handleBodyHtmlChange = (html: string) => {
    updateNote(selectedNote.id, { body: html })
  }

  const handleRemoveAttachment = (attachmentId: string) => {
    const next = selectedNote.attachments.filter(
      (att) => att.id !== attachmentId,
    )
    updateNote(selectedNote.id, { attachments: next })
  }

  useEffect(() => {
    setTagsInput(selectedNote.tags.join(', '))
  }, [selectedNote.id])

  return (
    <div className="details">
      {header}
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
        <div className="details__richtext">
          <span>Body</span>
          <RichTextEditor
            noteId={selectedNote.id}
            value={selectedNote.body}
            onChange={handleBodyHtmlChange}
          />
        </div>
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
            value={tagsInput}
            onChange={handleTagsChange}
            placeholder="e.g. travel, research, draft"
          />
        </label>
        <div className="attachments">
          <div className="attachments__header">
            <span>Attachments</span>
            <div className="attachments__actions">
              <button
                type="button"
                className="attachments__button attachments__button--ghost"
                onClick={() => setViewerOpen(true)}
                disabled={selectedNote.attachments.length === 0}
              >
                View
              </button>
              <button
                type="button"
                className="attachments__button"
                onClick={handleAddAttachment}
              >
                +
              </button>
            </div>
          </div>
          {selectedNote.attachments.length === 0 ? (
            <p className="attachments__empty">No attachments yet.</p>
          ) : (
            <ul className="attachments__list">
              {selectedNote.attachments.map((attachment) => (
                <li key={attachment.id} className="attachments__item attachments__item--clickable">
                  <button
                    type="button"
                    className="attachments__item-link"
                    onClick={() => void handleOpenAttachment(attachment.filePath)}
                  >
                    {attachment.fileName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {viewerOpen && (
          <div className="modal-overlay" role="dialog" aria-modal="true">
            <div className="modal attachments-modal">
              <div className="attachments-modal__header">
                <h3>Attachments</h3>
                <button
                  type="button"
                  className="modal__close"
                  onClick={() => setViewerOpen(false)}
                >
                  Close
                </button>
              </div>
              {selectedNote.attachments.length === 0 ? (
                <p className="attachments__empty">No attachments to show.</p>
              ) : (
                <ul className="attachments__list">
                  {selectedNote.attachments.map((attachment) => (
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
                          onClick={() => handleRemoveAttachment(attachment.id)}
                        >
                          Del
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteDetailsPanel
