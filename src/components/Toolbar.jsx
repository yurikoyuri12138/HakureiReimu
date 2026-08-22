export default function Toolbar({ search, onSearch, typeFilter, onTypeFilter, allTypes, shown, total, timeline, onToggleLayout, layoutVisible }) {
  return (
    <div className="toolbar">
      <input
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        placeholder="🔍 搜索棒次 / 创作者 / 作品类型…"
      />
      <select value={typeFilter} onChange={(e) => onTypeFilter(e.target.value)}>
        <option value="全部">全部类型</option>
        {allTypes.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <span className="result-count">共 {shown} / {total} 棒</span>
      {layoutVisible && (
        <button
          type="button"
          className={'layout-toggle' + (timeline ? ' on' : '')}
          title={timeline ? '切换到墙式布局' : '切换到时辰轴布局'}
          aria-pressed={timeline}
          onClick={onToggleLayout}
        >
          <span className="ts-btn-ico">{timeline ? '⏳' : '🧱'}</span>
          <span className="ts-btn-label">{timeline ? '时辰轴' : '墙'}</span>
        </button>
      )}
    </div>
  )
}