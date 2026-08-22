import { useEffect, useMemo, useRef, useState } from 'react'
import { groupByShichen } from '../utils/gallery.js'
import WorkCard from './WorkCard.jsx'

// 单行横向滚动行：未悬停时自动滚动；悬停时暂停自动滚动，滚轮可操控该行横向滚动
function TlRow({ g, info, texts, paused, onOpen }) {
  const sectionRef = useRef(null)
  const scrollRef = useRef(null)
  const [hover, setHover] = useState(false)

  // 滚轮操控：仅在该行可滚动且方向未到尽头时接管，其余情况放行页面滚动
  useEffect(() => {
    const section = sectionRef.current
    const scroller = scrollRef.current
    if (!section || !scroller) return
    const onWheel = (e) => {
      if (scroller.scrollWidth <= scroller.clientWidth) return
      const atStart = scroller.scrollLeft <= 0
      const atEnd = scroller.scrollLeft >= scroller.scrollWidth - scroller.clientWidth - 1
      const delta = e.deltaY || e.deltaX
      if ((delta > 0 && atEnd) || (delta < 0 && atStart)) return
      e.preventDefault()
      scroller.scrollLeft += delta
    }
    section.addEventListener('wheel', onWheel, { passive: false })
    return () => section.removeEventListener('wheel', onWheel)
  }, [])

  // 自动滚动：滚到末尾停留片刻后回到起点循环
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller || paused || hover) return
    if (scroller.scrollWidth <= scroller.clientWidth) return
    let raf = 0
    let hold = 0
    let last = performance.now()
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 100)
      last = now
      const max = scroller.scrollWidth - scroller.clientWidth
      if (scroller.scrollLeft >= max - 0.5) {
        hold += dt
        if (hold >= 1600) { scroller.scrollLeft = 0; hold = 0 }
        return
      }
      hold = 0
      scroller.scrollLeft = Math.min(scroller.scrollLeft + 0.06 * dt, max)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hover, paused])

  return (
    <section
      ref={sectionRef}
      className="tl-row"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <header className="tl-row-head">
        <span className="tl-branch">{g.char}</span>
        <span className="tl-range">
          {g.label}
          {g.range ? ` · ${g.range}` : ''}
        </span>
        <span className="tl-count">{g.items.length} 棒</span>
      </header>
      <div ref={scrollRef} className="tl-scroll">
        {g.items.map((item, idx) => (
          <WorkCard key={item.infoId} index={idx} item={item} info={info} texts={texts} paused={paused} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

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
            <span className="tl-time">{g.date || g.range}</span>
          </div>
        ))}
      </div>
      <div className="tl-body">
        {groups.map((g) => (
          <TlRow key={g.key} g={g} info={info} texts={texts} paused={paused} onOpen={onOpen} />
        ))}
      </div>
    </div>
  )
}
