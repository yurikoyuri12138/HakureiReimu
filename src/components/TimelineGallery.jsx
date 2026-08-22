import { useMemo } from 'react'
import { groupByShichen } from '../utils/gallery.js'
import WorkCard from './WorkCard.jsx'

// 时辰轴布局（PC 端）：左侧 1/4 时间轴（昨/子丑寅卯…亥/明 + 时段标注），右侧每时段一行横向滚动缩略图
export default function TimelineGallery({ items, info, texts, paused, onOpen }) {
  const groups = useMemo(() => groupByShichen(items, info), [items, info])
  if (!groups.length) return null
  return (
    <div className="tl">
      <div className="tl-axis" aria-hidden="true">
        <div className="tl-line" />
        {groups.map((g) => (
          <div key={g.key} className="tl-seg">
            <span className="tl-mark" />
            <span className="tl-dot" />
            <span className="tl-char">{g.char}</span>
            {g.range && <span className="tl-time">{g.range}</span>}
          </div>
        ))}
      </div>
      <div className="tl-body">
        {groups.map((g) => (
          <section key={g.key} className="tl-row">
            <header className="tl-row-head">
              <span className="tl-branch">{g.char}</span>
              <span className="tl-range">
                {g.label}
                {g.range ? ` · ${g.range}` : ''}
              </span>
              <span className="tl-count">{g.items.length} 棒</span>
            </header>
            <div className="tl-scroll">
              {g.items.map((item, idx) => (
                <WorkCard key={item.infoId} index={idx} item={item} info={info} texts={texts} paused={paused} onOpen={onOpen} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
