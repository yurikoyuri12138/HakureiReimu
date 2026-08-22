// 同人文分段与章节识别（与 Vue 版逻辑一致）

// 按原文空行分段：保留段落前的空行数量与段落内的原始排版
export function paragraphs(text) {
  const lines = String(text || '').replace(/\r\n/g, '\n').split('\n')
  const paras = []
  let buf = []
  let gap = 0
  let pendingGap = 0
  lines.forEach((line) => {
    if (line.trim() === '') { gap++; return }
    if (buf.length === 0) {
      pendingGap = paras.length === 0 ? 0 : gap
      gap = 0
      buf.push(line)
      return
    }
    if (gap > 0) {
      paras.push({ text: buf.join('\n'), gap: pendingGap })
      buf = [line]
      pendingGap = gap
      gap = 0
    } else {
      buf.push(line)
    }
  })
  if (buf.length) paras.push({ text: buf.join('\n'), gap: pendingGap })
  return paras
}

// 章节拆分：段首独立短行（≤8字、无标点、非 ~ 拟声、含汉字、非数字/引号开头）且段落后有正文；
// 诗歌小节标题：『』「」【】包裹的独立短行（内含汉字、无句末标点/数字）也识别为章节
export function splitBlocks(text) {
  return paragraphs(text).map((p) => {
    const lines = p.text.split('\n')
    const first = lines[0].trim()
    const quoted = first.match(/^[『「【]([^』」】]{1,12})[』」】]$/)
    const isQuotedHead =
      !!quoted &&
      /[\u4e00-\u9fa5]/.test(quoted[1]) &&
      !/[。！？；…—!?]/.test(quoted[1]) &&
      !/[\d=]/.test(quoted[1])
    const isPlainHead =
      !quoted &&
      first.length <= 8 &&
      !/[，。！？、；：……—!?]/.test(first) &&
      !/~$/.test(first) &&
      /[\u4e00-\u9fa5]/.test(first) &&
      !/^\d/.test(first) &&
      !/^[“"「『]/.test(first)
    if (lines.length > 1 && (isQuotedHead || isPlainHead)) {
      return { heading: first, text: lines.slice(1).join('\n').trim(), gap: p.gap }
    }
    return { heading: null, text: p.text, gap: p.gap }
  })
}