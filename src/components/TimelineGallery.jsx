import { Fragment, useMemo } from 'react'
import { BRANCHES, displayName, excerpt, groupByShichen, imageWorks, isTextItem, itemMeta } from '../utils/gallery.js'
import Carousel from './Carousel.jsx'

// 时辰轴缩略图块：封面（轮播/文字摘要）+ 类型角标 + 数量 + 棒次/创作者信息
function TlCard({ item, info, texts, paused, onOpen, index }) {
  const meta = itemMeta(item, info)
  const imgs = imageWorks(item)
  return (
    <div
      className="tl-card"
      style={{ animationDelay: (index % 9) * 0.04 + 's' }}
      onClick={() => onOpen(item)}
    >
      <div className="tl-cover">
        {isTextItem(item) ? (
          <div className="text-ph">
            <span className="book-ico">📖</span>
            <p className="excerpt">{excerpt(item, texts)}</p>
          </div>
        ) : (
          <Carousel works={imgs} paused={paused} />
        )}
        <span className="kind-badge">{meta.type || (isTextItem(item) ? '同人文' : '图片')}</span>
        {item.works.length > 1 && <span className="tl-num">×{item.works.length}</span>}
      </div>
      <div className="tl-cardbar">
        <span className="tl-name">{displayName(item.infoId)}</span>
        <span className="tl-credit">
          {meta.creator}
          {meta.daifa ? ' · 代发' : ''}
        </span>
      </div>
    </div>
  )
}

// 时辰轴布局（PC 端）：左侧 1/4 为时间轴，最左侧写子丑寅卯…亥区分时段，右侧 3/4 展示缩略图块
export default function TimelineGallery({ items, info, texts, paused, onOpen }) {
  const groups = useMemo(() => groupByShichen(items, info), [items, info])
  if (!groups.length) return null
  return (
    <div className="tl">
      <div className="tl-axis" aria-hidden="true">
        <div className="tl-line" />
        {BRANCHES.map((b, i) => (
          <Fragment key={b}>
            <span className="tl-mark" style={{ top: (i / 12) * 100 + '%' }} />
            <span className="tl-dot" style={{ top: (i / 12) * 100 + '%' }} />
            <span className="tl-char" style={{ top: ((i + 0.5) / 12) * 100 + '%' }}>{b}</span>
          </Fragment>
        ))}
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
                <TlCard key={item.infoId} item={item} info={info} texts={texts} paused={paused} onOpen={onOpen} index={idx} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
