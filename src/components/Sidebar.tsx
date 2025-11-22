interface SidebarProps {
  onNewNote: () => void
  onExport: () => void
  tagFilter: string
  onTagFilterChange: (value: string) => void
  zoomLevel: 'years' | 'months'
  onZoomLevelChange: (value: 'years' | 'months') => void
  projectLabel: string
  onChangeProject: () => void
  onCreateProject: () => void
}

function Sidebar({
  onNewNote,
  onExport,
  tagFilter,
  onTagFilterChange,
  zoomLevel,
  onZoomLevelChange,
  projectLabel,
  onChangeProject,
  onCreateProject,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <h1>Chrononotes</h1>
      <p className="sidebar__tagline">
        Filters and project controls will live here.
      </p>
      <div className="sidebar__project">
        <div className="sidebar__project-label">Project</div>
        <div className="sidebar__project-row">
          <span title={projectLabel}>{projectLabel}</span>
          <div className="sidebar__project-actions">
            <button
              type="button"
              className="sidebar__button sidebar__button--ghost"
              onClick={onChangeProject}
            >
              Open…
            </button>
            <button
              type="button"
              className="sidebar__button sidebar__button--ghost"
              onClick={onCreateProject}
            >
              New…
            </button>
          </div>
        </div>
      </div>
      <button type="button" className="sidebar__button" onClick={onNewNote}>
        + New Note
      </button>
      <button
        type="button"
        className="sidebar__button sidebar__button--ghost"
        onClick={onExport}
      >
        Export…
      </button>
      <label className="sidebar__filter">
        <span>Filter by tag</span>
        <input
          type="text"
          value={tagFilter}
          onChange={(event) => onTagFilterChange(event.target.value)}
          placeholder="e.g. travel"
        />
      </label>
      <label className="sidebar__filter">
        <span>Zoom</span>
        <select
          value={zoomLevel}
          onChange={(event) =>
            onZoomLevelChange(event.target.value as 'years' | 'months')
          }
        >
          <option value="years">Years</option>
          <option value="months">Months</option>
        </select>
      </label>
    </div>
  )
}

export default Sidebar
