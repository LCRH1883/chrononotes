interface ExportDialogProps {
  isOpen: boolean
  scope: 'all' | 'filtered'
  onScopeChange: (scope: 'all' | 'filtered') => void
  onConfirm: () => void
  onCancel: () => void
  totalCount: number
  filteredCount: number
}

function ExportDialog({
  isOpen,
  scope,
  onScopeChange,
  onConfirm,
  onCancel,
  totalCount,
  filteredCount,
}: ExportDialogProps) {
  if (!isOpen) return null

  const hasFilteredSubset = filteredCount !== totalCount

  return (
    <div className="export-overlay" role="dialog" aria-modal="true">
      <div className="export-modal">
        <div className="export-modal__header">
          <h2>Export notes</h2>
          <p>Save your notes as a Markdown file.</p>
        </div>
        <div className="export-modal__section">
          <h3>Scope</h3>
          <label className="export-option">
            <input
              type="radio"
              name="export-scope"
              value="all"
              checked={scope === 'all'}
              onChange={() => onScopeChange('all')}
            />
            <span>All notes ({totalCount})</span>
          </label>
          <label
            className={`export-option${
              hasFilteredSubset ? '' : ' export-option--disabled'
            }`}
          >
            <input
              type="radio"
              name="export-scope"
              value="filtered"
              checked={scope === 'filtered'}
              onChange={() => {
                if (!hasFilteredSubset) return
                onScopeChange('filtered')
              }}
              disabled={!hasFilteredSubset}
            />
            <span>
              Filtered notes ({filteredCount}
              {hasFilteredSubset ? '' : ' – same as all'})
            </span>
          </label>
        </div>
        <div className="export-modal__section">
          <h3>Format</h3>
          <p className="export-modal__format">Markdown (.md)</p>
        </div>
        <div className="export-modal__actions">
          <button
            type="button"
            className="export-button export-button--ghost"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="export-button export-button--primary"
            onClick={onConfirm}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExportDialog
