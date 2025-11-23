interface SidebarProps {
  onExport: () => void
  tagFilter: string
  onTagFilterChange: (value: string) => void
  zoomLevel: 'years' | 'months'
  onZoomLevelChange: (value: 'years' | 'months') => void
  projectLabel: string
  onChangeProject: () => void
  onCreateProject: () => void
  onHideSidebar: () => void
}

function Sidebar({
  onExport,
  tagFilter,
  onTagFilterChange,
  zoomLevel,
  onZoomLevelChange,
  projectLabel,
  onChangeProject,
  onCreateProject,
  onHideSidebar,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar__heading">
        <h1>Chrononotes</h1>
        <button
          type="button"
          className="sidebar__button sidebar__button--ghost sidebar__button--sm"
          onClick={onHideSidebar}
        >
          Hide
        </button>
      </div>
      <p className="sidebar__tagline">
        Filters and project controls will live here.
      </p>
      <div className="sidebar__project">
        <div className="sidebar__project-label">Project</div>
        <div className="sidebar__project-row">
          <span className="sidebar__project-name" title={projectLabel}>
            {projectLabel}
          </span>
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
