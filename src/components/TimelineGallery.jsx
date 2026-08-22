import { Fragment, useMemo } from 'react'
import { BRANCHES, groupByShichen } from '../utils/gallery.js'
import WorkCard from './WorkCard.jsx'

// 时辰轴布局（PC 端）：左侧 1/4 为时间轴，最左侧写子丑寅卯…亥区分时段，右侧 3/4 展示缩略图块
export default function TimelineGallery({ items, info, texts, paused, onOpen }) {
  const groups = useMemo(() => groupByShichen(items, info), [items, info])
  if (!groups.length) return null
  return (
    <div className="tl">
      <div className="tl-axis" aria-hidden="true">
        <div className="tl-line" />
        {BRANCHES.map((b, i) => {
          const top = ((i + 0.5) / 12) * 100 + '%'
          return (
            <Fragment key={b}>
              <span className="tl-mark" style={{ top }} />
              <span className="tl-char" style={{ top }}>{b}</span>
            </Fragment>
          )
        })}
      </div>
      <div className="tl-body">
        {groups.map((g) => (
          <section key={g.key} className="tl-group">
            <header className="tl-group-head">
              <span className="tl-branch">{g.char}</span>
              <span className="tl-range">
                {g.label}
                {g.range ? ` · ${g.range}` : ''}
              </span>
              <span className="tl-count">{g.items.length} 棒</span>
            </header>
            <div className="tl-grid">
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
