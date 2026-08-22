import { useEffect, useMemo, useState } from 'react'
import { Divider } from 'antd'
import { INFO, WORKS, TEXTS, NOTES } from './data/index.js'
import { SECTION_ORDER, itemMeta, sectionOf } from './utils/gallery.js'
import Header from './components/Header.jsx'
import WarnBanner from './components/WarnBanner.jsx'
import Toolbar from './components/Toolbar.jsx'
import PromoSection from './components/PromoSection.jsx'
import Gallery from './components/Gallery.jsx'
import DetailOverlay from './components/DetailOverlay.jsx'
import ThemeSwitch from './components/ThemeSwitch.jsx'
import Footer from './components/Footer.jsx'
import BackToTop from './components/BackToTop.jsx'

// 固定种子随机数（保证装饰元素每次渲染一致，不闪烁）
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function App() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('全部')
  const [active, setActive] = useState(null)
  // 按系统时间决定主题：6:00–17:59 浅色，其余深色
  const themeByTime = () => {
    const h = new Date().getHours()
    return h >= 6 && h < 18 ? 'light' : 'dark'
  }

  // 自动主题模式（隐藏开关，默认开启；点击右上角胶囊空白处或 Shift+点击主题开关可切换）
  const [autoTheme, setAutoTheme] = useState(() => {
    try { return localStorage.getItem('lm-auto-theme') !== 'off' } catch { return true }
  })
  // 手动主题（浅色/深色）：自动模式下首次展示按系统时间
  const [dark, setDark] = useState(() => {
    let auto = true
    try { auto = localStorage.getItem('lm-auto-theme') !== 'off' } catch { /* ignore */ }
    if (auto) return themeByTime() === 'dark'
    try { return localStorage.getItem('lm-dark') === 'dark' } catch { return false }
  })
  // 动态效果（飘落樱花 / 闪烁星光）开关，默认关闭
  const [fx, setFx] = useState(() => {
    try { return localStorage.getItem('lm-fx') === 'on' } catch { return false }
  })

  // 主题属性挂到 <html>，确保 body 与全局背景生效；并持久化选择
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
    try { localStorage.setItem('lm-dark', dark ? 'dark' : 'light') } catch { /* ignore */ }
  }, [dark])

  // 动态效果选择持久化
  useEffect(() => {
    try { localStorage.setItem('lm-fx', fx ? 'on' : 'off') } catch { /* ignore */ }
  }, [fx])

  // 隐藏开关：切换自动主题模式；开启时立即按当前系统时间应用主题
  const toggleAutoTheme = () => {
    setAutoTheme((prev) => {
      const next = !prev
      try { localStorage.setItem('lm-auto-theme', next ? 'on' : 'off') } catch { /* ignore */ }
      if (next) setDark(themeByTime() === 'dark')
      return next
    })
  }

  // 手动切换主题：自动模式随之关闭，保留手动选择
  const handleDark = (v) => {
    setDark(v)
    setAutoTheme(false)
    try { localStorage.setItem('lm-auto-theme', 'off') } catch { /* ignore */ }
  }

  const dataWarn = !INFO.length || !WORKS.length || !TEXTS.length || !Object.keys(NOTES).length

  // 作品按信息表（md）顺序排序
  const items = useMemo(() => {
    const order = {}
    INFO.forEach((e, i) => { order[e.title] = i })
    return WORKS.slice().sort((a, b) => (order[a.infoId] ?? 999) - (order[b.infoId] ?? 999))
  }, [INFO, WORKS])

  const workCount = useMemo(() => items.reduce((n, i) => n + i.works.length, 0), [items])

  // 类型筛选选项：仅统计有本地作品的棒次
  const allTypes = useMemo(() => {
    const s = {}
    items.forEach((item) => itemMeta(item, INFO).links.forEach((l) => { s[l.type] = true }))
    return Object.keys(s)
  }, [items, INFO])

  const filteredItems = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return items.filter((item) => {
      const meta = itemMeta(item, INFO)
      if (typeFilter !== '全部' && !meta.links.some((l) => l.type === typeFilter)) return false
      if (!kw) return true
      const hay = [item.infoId, meta.creator, meta.time, ...meta.links.map((l) => l.type + l.label)].join(' ').toLowerCase()
      return hay.includes(kw)
    })
  }, [items, search, typeFilter, INFO])

  // 分栏：预热 / 正式 / 特典 / SP / 替补
  const sections = useMemo(() => {
    const map = {}
    SECTION_ORDER.forEach((c) => { map[c] = [] })
    filteredItems.forEach((item) => map[sectionOf(item.infoId)].push(item))
    return SECTION_ORDER.map((key) => ({ key, items: map[key] }))
  }, [filteredItems])

  // 装饰元素：浅色主题 → 飘落樱花；深色主题 → 闪烁星光
  const petals = useMemo(() => {
    const rnd = mulberry32(20260809)
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      delay: rnd() * 10,
      duration: 7 + rnd() * 7,
      size: 14 + rnd() * 14,
      sway: (30 + rnd() * 80).toFixed(0)
    }))
  }, [])

  const stars = useMemo(() => {
    const rnd = mulberry32(20260809)
    return Array.from({ length: 130 }, (_, i) => ({
      id: i,
      top: rnd() * 100,
      left: rnd() * 100,
      size: (1.5 + rnd() * 2.5).toFixed(1),
      delay: (rnd() * 5).toFixed(1),
      duration: (1.6 + rnd() * 3.4).toFixed(1)
    }))
  }, [])

  return (
    <div className="app" data-theme={dark ? 'dark' : 'light'}>
      {/* 主题切换（浅色/深色）+ 动态效果开关；胶囊空白处为自动主题隐藏开关 */}
      <ThemeSwitch
        dark={dark}
        onDark={handleDark}
        fx={fx}
        onFx={setFx}
        autoTheme={autoTheme}
        onToggleAuto={toggleAutoTheme}
      />

      {/* 背景装饰（动态效果关闭时不渲染） */}
      {fx && (
        <div className="deco" aria-hidden="true">
          {dark
            ? (
              <div className="starry">
                {stars.map((s) => (
                  <span
                    key={s.id}
                    className="star"
                    style={{
                      top: s.top + '%',
                      left: s.left + '%',
                      width: s.size + 'px',
                      height: s.size + 'px',
                      animationDelay: s.delay + 's',
                      animationDuration: s.duration + 's'
                    }}
                  />
                ))}
              </div>
            )
            : (
              <div className="sakura">
                {petals.map((p) => (
                  <span
                    key={p.id}
                    className="petal"
                    style={{
                      left: p.left + '%',
                      width: p.size + 'px',
                      height: p.size + 'px',
                      animationDelay: p.delay + 's',
                      animationDuration: p.duration + 's',
                      '--sway': p.sway + 'px'
                    }}
                  />
                ))}
              </div>
            )}
        </div>
      )}

      <Header itemCount={items.length} workCount={workCount} />
          {dataWarn && <WarnBanner />}
          <Toolbar
            search={search}
            onSearch={setSearch}
            typeFilter={typeFilter}
            onTypeFilter={setTypeFilter}
            allTypes={allTypes}
            shown={filteredItems.length}
            total={items.length}
          />

          <Divider style={{ margin: '2px auto 24px', maxWidth: 1360 }} />

          <PromoSection />

          <Divider style={{ margin: '4px auto 0', maxWidth: 1360 }} />

          <Gallery sections={sections} info={INFO} texts={TEXTS} paused={!!active} onOpen={setActive} />

          {active && (
            <DetailOverlay item={active} info={INFO} texts={TEXTS} notes={NOTES} onClose={() => setActive(null)} />
          )}

      <Footer />

      <BackToTop />
    </div>
  )
}
