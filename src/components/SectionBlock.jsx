import WorkCard from './WorkCard.jsx'

// 单个分区：标题 + 数量 + 四列网格
export default function SectionBlock({ sec, info, texts, paused, onOpen }) {
  const workCount = sec.items.reduce((n, i) => n + i.works.length, 0)
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-title">{sec.key}</h2>
        <span className="section-count">{sec.items.length} 棒 · {workCount} 个作品</span>
      </div>
      <div className="gallery">
        {sec.items.map((item, idx) => (
          <WorkCard key={item.infoId} index={idx} item={item} info={info} texts={texts} paused={paused} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}