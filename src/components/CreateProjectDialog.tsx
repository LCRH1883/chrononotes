interface CreateProjectDialogProps {
  isOpen: boolean
  projectName: string
  parentPath: string | null
  onProjectNameChange: (value: string) => void
  onBrowseFolder: () => void
  onConfirm: () => void
  onCancel: () => void
  errorMessage: string | null
  isBusy: boolean
}

function CreateProjectDialog({
  isOpen,
  projectName,
  parentPath,
  onProjectNameChange,
  onBrowseFolder,
  onConfirm,
  onCancel,
  errorMessage,
  isBusy,
}: CreateProjectDialogProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal create-project-modal">
        <div className="create-project__header">
          <h3>Create Project</h3>
          <p>Pick the folder and name in one step.</p>
        </div>
        <label className="create-project__field">
          <span>Project name</span>
          <input
            className="create-project__input"
            type="text"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
            placeholder="chrononotes-project"
            disabled={isBusy}
          />
        </label>
        <div className="create-project__field">
          <span>Project folder</span>
          <div className="create-project__folder">
            <div className="create-project__path" title={parentPath ?? ''}>
              {parentPath ?? 'No folder selected'}
            </div>
            <button
              type="button"
              className="export-button export-button--ghost"
              onClick={onBrowseFolder}
              disabled={isBusy}
            >
              Browse…
            </button>
          </div>
        </div>
        {errorMessage && (
          <p className="create-project__error">{errorMessage}</p>
        )}
        <div className="export-modal__actions">
          <button
            type="button"
            className="export-button export-button--ghost"
            onClick={onCancel}
            disabled={isBusy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="export-button export-button--primary"
            onClick={onConfirm}
            disabled={isBusy}
          >
            {isBusy ? 'Creating…' : 'Create project'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateProjectDialog
