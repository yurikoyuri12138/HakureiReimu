// 作品/棒次相关纯函数工具

export function itemMeta(item, info) {
  const e = info.find((i) => i.title === item.infoId) || {}
  return {
    creator: e.creator || '未知',
    creatorUrl: e.creatorUrl || '',
    links: e.links || [],
    time: e.time || '',
    daifa: !!e.daifa,
    type: (e.links && e.links[0] && e.links[0].type) || ''
  }
}

// SP棒 / 替补棒 缩略界面只显示类别名
export function displayName(infoId) {
  if (infoId.startsWith('SP棒')) return 'SP棒'
  if (infoId.startsWith('替补棒')) return '替补棒'
  return infoId
}

export function sectionOf(infoId) {
  if (infoId.startsWith('预热')) return '预热棒'
  if (infoId.startsWith('特典')) return '特典棒'
  if (infoId.startsWith('SP棒')) return 'SP棒'
  if (infoId.startsWith('替补棒')) return '替补棒'
  return '正式棒'
}

export const SECTION_ORDER = ['预热棒', '正式棒', '特典棒', 'SP棒', '替补棒']

export function imageWorks(item) {
  return item.works.filter((w) => !w.text)
}

export function isTextItem(item) {
  return item.works.length > 0 && item.works.every((w) => !!w.text)
}

export function textOf(infoId, texts) {
  const t = texts.find((x) => x.name === infoId)
  return t ? t.text : ''
}

export function excerpt(item, texts) {
  if (!isTextItem(item)) return ''
  const text = textOf(item.infoId, texts).replace(/\s+/g, ' ')
  return text.length > 70 ? text.slice(0, 70) + '…' : text
}

// 视频（封面）作品：返回 md 中的作品链接
export function workUrl(work, meta) {
  if (!work || !work.video) return ''
  return (meta.links[0] && meta.links[0].url) || ''
}

// 数据中的 img/ 路径 -> 浏览器可访问的静态路径（public/img/）
const BASE = import.meta.env.BASE_URL
export function assetUrl(p) {
  if (!p) return ''
  if (p.startsWith('img/')) return BASE + p
  return p
}

// ---------- 时辰轴（时间轴布局） ----------
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 解析发布时刻："0:00" / "昨日8:09" / "明日1:06" → { day, mins }；无法解析返回 null
export function parseTime(t) {
  if (!t) return null
  const m = /^(昨日|明日)?(\d{1,2}):(\d{2})$/.exec(t.trim())
  if (!m) return null
  return { day: m[1] === '昨日' ? -1 : m[1] === '明日' ? 1 : 0, mins: Number(m[2]) * 60 + Number(m[3]) }
}

// 第 idx 个时辰的整点区间，如 "00:00–02:00"
export function branchRange(idx) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(idx * 2)}:00–${pad(idx * 2 + 2)}:00`
}

// 时刻 → "8:09" 形式
export function fmtTime(mins) {
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`
}

// 按时辰分组：昨日(预热) → 子丑寅…亥 → 明日(替补) → 其他（组内按时刻排序）
export function groupByShichen(items, info) {
  const prev = []
  const next = []
  const other = []
  const buckets = BRANCHES.map(() => [])
  items.forEach((item, i) => {
    const t = parseTime(itemMeta(item, info).time)
    if (!t) { other.push({ item, i }); return }
    const rec = { item, i, mins: t.mins }
    if (t.day < 0) { prev.push(rec); return }
    if (t.day > 0) { next.push(rec); return }
    buckets[Math.min(Math.floor(t.mins / 120), 11)].push(rec)
  })
  const byTime = (a, b) => a.mins - b.mins || a.i - b.i
  const span = (list) => {
    list.sort(byTime)
    const first = fmtTime(list[0].mins)
    const last = fmtTime(list[list.length - 1].mins)
    return list.length === 1 || first === last ? first : `${first}–${last}`
  }
  const out = []
  if (prev.length) out.push({ key: '昨日', char: '昨', label: '昨日', date: '8月9日', range: span(prev), items: prev.map((x) => x.item) })
  buckets.forEach((list, idx) => {
    if (list.length) out.push({ key: BRANCHES[idx], char: BRANCHES[idx], label: `${BRANCHES[idx]}时`, range: branchRange(idx), items: list.sort(byTime).map((x) => x.item) })
  })
  if (next.length) out.push({ key: '明日', char: '明', label: '明日', date: '8月10日', range: span(next), items: next.map((x) => x.item) })
  if (other.length) out.push({ key: '其他', char: '时', label: '其他', items: other.map((x) => x.item) })
  return out
}