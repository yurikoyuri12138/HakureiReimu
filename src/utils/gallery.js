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