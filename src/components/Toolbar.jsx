export default function Toolbar({ search, onSearch, typeFilter, onTypeFilter, allTypes, shown, total }) {
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
    </div>
  )
}
