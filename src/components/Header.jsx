export default function Header({ itemCount, workCount }) {
  return (
    <header className="app-header">
      <h1>⛩️ 2026夏季博丽灵梦24H接力</h1>
      <p>2026年8月9日举办的夏季灵梦24H接力创作线上活动，灵梦厨的夏之盛宴。</p>
      <div className="test-badge">📋 已收录：{itemCount} 棒 · {workCount} 个作品</div>
      <div className="stats">
        <span className="stat-badge">📋 棒次 {itemCount} 个</span>
        <span className="stat-badge">🖼️ 作品 {workCount} 个</span>
      </div>
    </header>
  )
}
