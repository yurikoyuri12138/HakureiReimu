import { useState } from 'react'
import { displayName, excerpt, imageWorks, isTextItem, itemMeta } from '../utils/gallery.js'
import Carousel from './Carousel.jsx'

// 作品卡片：封面轮播 / 文字摘要 / 类型角标 / 时间 / 徽章（index 用于入场错峰动画）
export default function WorkCard({ item, info, texts, paused, onOpen, index = 0 }) {
  const [hovered, setHovered] = useState(false)
  const meta = itemMeta(item, info)
  const imgs = imageWorks(item)

  return (
    <div
      className="gcard"
      style={{ animationDelay: (index % 12) * 0.045 + 's' }}
      onClick={() => onOpen(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="gcover">
        {isTextItem(item) ? (
          <div className="text-ph">
            <span className="book-ico">📖</span>
            <p className="excerpt">{excerpt(item, texts)}</p>
          </div>
        ) : (
          <Carousel works={imgs} paused={paused || hovered} />
        )}
        <span className="kind-badge">{meta.type || (isTextItem(item) ? '同人文' : '图片')}</span>
        <div className="gcover-hover">
          <span className="hover-title">{item.infoId}</span>
          <span className="hover-creator">作者：{meta.creator}</span>
          <span className="hover-meta">
            {meta.time && <span>{meta.time}</span>}
            {meta.type && <span>{meta.type}</span>}
            {item.works.length > 1 && <span>{item.works.length} 个作品</span>}
            {meta.daifa && <span>代发</span>}
          </span>
        </div>
      </div>
      <div className="gbar">
        <span className="gname">
          {displayName(item.infoId)}
          {meta.time && <span className="gtime">· {meta.time}</span>}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {item.works.length > 1 && <span className="badge badge-num">{item.works.length} 个作品</span>}
          {meta.daifa && <span className="badge badge-daifa">代发</span>}
        </span>
      </div>
    </div>
  )
}