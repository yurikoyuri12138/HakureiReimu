import { useEffect, useMemo, useRef, useState } from 'react'
import { groupByShichen } from '../utils/gallery.js'
import WorkCard from './WorkCard.jsx'

// 单行横向滚动行：内容复制两份实现无缝循环；未悬停且显示在屏幕上时自动滚动，
// 悬停时暂停自动滚动，滚轮可操控该行双向无缝滚动
function TlRow({ g, info, texts, paused, onOpen }) {
  const sectionRef = useRef(null)
  const scrollRef = useRef(null)
  const [hover, setHover] = useState(false)
  const [visible, setVisible] = useState(false)
  // 单份内容是否放不下视口：只有放不下的行才复制第二份用于无缝循环
  const [overflow, setOverflow] = useState(false)
  // 一份内容的宽度（卡片 208px + 间距 14px），循环回绕的周期
  const period = g.items.length * (208 + 14)
  // 行可见时暂停卡片轮播，避免滚动过程中交叉淡入造成卡顿
  const cardPaused = paused || visible

  // 懒加载：仅当该时段行进入屏幕时才自动滚动
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const io = new IntersectionObserver((entries) => {
      setVisible(entries[0].isIntersecting)
    }, { threshold: 0.15 })
    io.observe(section)
    return () => io.disconnect()
  }, [])

  // 测量单份内容是否溢出；只有溢出时才需要第二份副本
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    const update = () => setOverflow(period > scroller.clientWidth + 4)
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [period])

  // 滚轮操控：无缝双向回绕；无溢出内容时放行页面滚动
  useEffect(() => {
    const section = sectionRef.current
    const scroller = scrollRef.current
    if (!section || !scroller) return
    const onWheel = (e) => {
      if (!overflow) return
      const delta = e.deltaY || e.deltaX
      if (!delta) return
      e.preventDefault()
      let target = scroller.scrollLeft + delta
      if (target >= period) target -= period
      if (target < 0) target += period
      scroller.scrollLeft = target
    }
    section.addEventListener('wheel', onWheel, { passive: false })
    return () => section.removeEventListener('wheel', onWheel)
  }, [period, overflow])

  // 自动滚动（懒加载：仅屏幕上可见的溢出行滚动）：整数像素步进，到周期点无缝回绕
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller || paused || hover || !visible || !overflow) return
    let raf = 0
    let pos = scroller.scrollLeft
    let last = performance.now()
    const tick = (now) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 100)
      last = now
      pos += 0.06 * dt
      if (pos >= period) pos -= period
      scroller.scrollLeft = Math.round(pos)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hover, paused, visible, period, overflow])

  const cards = (pass) => g.items.map((item, idx) => (
    <WorkCard key={pass + '-' + item.infoId} index={idx} item={item} info={info} texts={texts} paused={cardPaused} onOpen={onOpen} />
  ))

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
        {cards(0)}
        {overflow && cards(1)}
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
