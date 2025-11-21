interface SidebarProps {
  onNewNote: () => void
  tagFilter: string
  onTagFilterChange: (value: string) => void
  zoomLevel: 'years' | 'months'
  onZoomLevelChange: (value: 'years' | 'months') => void
}

function Sidebar({
  onNewNote,
  tagFilter,
  onTagFilterChange,
  zoomLevel,
  onZoomLevelChange,
}: SidebarProps) {
  return (
    <div className="sidebar">
      <h1>Chrononotes</h1>
      <p className="sidebar__tagline">
        Filters and project controls will live here.
      </p>
      <button type="button" className="sidebar__button" onClick={onNewNote}>
        + New Note
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
      <ul className="sidebar__list">
        <li>All Notes</li>
        <li>Favorites</li>
        <li>Recently Viewed</li>
      </ul>
    </div>
  )
}

export default Sidebar
