import { useEffect, useState } from 'react'
import { assetUrl, itemMeta, textOf, workUrl } from '../utils/gallery.js'
import { splitBlocks } from '../utils/paragraphs.js'

// 详情浮层：同棒多作品翻页 / 信息栏 / 进入与关闭动画 / 键盘控制 / 视频跳转
export default function DetailOverlay({ item, info, texts, notes, onClose }) {
  const [workIdx, setWorkIdx] = useState(0)
  const [animOpen, setAnimOpen] = useState(true)
  const [closing, setClosing] = useState(false)
  // 移动端：底部信息栏展开态（点下侧拉出，点上侧图恢复）
  const [infoOpen, setInfoOpen] = useState(false)

  const works = item.works
  const work = works[Math.min(workIdx, works.length - 1)] || null
  const meta = itemMeta(item, info)
  const note = notes[item.infoId] || null
  const videoUrl = workUrl(work, meta)
  const fullText = work && work.text ? textOf(item.infoId, texts) : ''
  const blocks = fullText ? splitBlocks(fullText) : []
  const imgCls = 'work-item' + (animOpen ? ' detail-img' : '') + (closing ? ' img-out' : '')
  const maskCls = 'detail-mask' + (closing ? ' mask-out' : '')

  function move(delta) {
    if (closing) return
    setAnimOpen(false)
    setWorkIdx((i) => (i + delta + works.length) % works.length)
  }

  function requestClose() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 320)
  }

  function gapStyle(b) {
    return b.gap > 1 ? { marginTop: 1.2 * (b.gap - 1) + 'em' } : undefined
  }

  // 键盘控制：← → 翻页，Esc 关闭
  useEffect(() => {
    function onKey(e) {
      if (closing) return
      if (e.key === 'Escape') requestClose()
      else if (e.key === 'ArrowLeft') { e.preventDefault(); move(-1) }
      else if (e.key === 'ArrowRight') { e.preventDefault(); move(1) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing, works.length])

  return (
    <div className={maskCls} onClick={(e) => { if (e.target === e.currentTarget) requestClose() }}>
      <span className="d-counter">作品 {workIdx + 1} / {works.length}</span>
      <button className="d-btn d-close" onClick={requestClose}>✕</button>
      <button className="d-btn d-back" onClick={requestClose} title="返回画廊" aria-label="返回画廊">←</button>
      <div className={'detail' + (infoOpen ? ' info-open' : '')}>
        <div
          className={'detail-media' + (videoUrl ? ' media-clickable' : '')}
          onClick={() => {
            if (infoOpen) { setInfoOpen(false); return }
            if (videoUrl) window.open(videoUrl, '_blank')
          }}
        >
          {works.length > 1 && workIdx > 0 && (
            <button className="media-btn mb-prev" onClick={(e) => { e.stopPropagation(); move(-1) }}>‹</button>
          )}
          {work && work.file ? (
            <img key={work.name} className={imgCls} src={assetUrl(work.file)} alt={work.name} />
          ) : (
            <div key={'t' + (work ? work.name : '')} className="detail-text work-item">
              {blocks.map((b, i) =>
                b.heading ? (
                  <p key={i} className="chapter" style={gapStyle(b)}>{b.heading}</p>
                ) : (
                  <p key={i} style={gapStyle(b)}>{b.text}</p>
                )
              )}
            </div>
          )}
          {works.length > 1 && workIdx < works.length - 1 && (
            <button className="media-btn mb-next" onClick={(e) => { e.stopPropagation(); move(1) }}>›</button>
          )}
          {videoUrl && <span className="video-hint">▶ 点击查看原视频 ↗</span>}
        </div>
        <div
          className={'detail-info' + (closing ? ' panel-out' : '')}
          onClick={(e) => {
            if (e.target.closest('a, button')) return
            setInfoOpen(true)
          }}
        >
          <span className="pull-handle" aria-hidden="true" />
          <h3>
            {item.infoId}
            {meta.time && <span className="time">· {meta.time}</span>}
            {meta.daifa && <span className="badge badge-daifa">代发</span>}
          </h3>
          <div className="info-row">
            <span className="label">创作者</span>
            {meta.creatorUrl ? (
              <a href={meta.creatorUrl} target="_blank" rel="noopener noreferrer">@{meta.creator}</a>
            ) : (
              <span>@{meta.creator}</span>
            )}
          </div>
          <div className="info-row">
            <span className="label">作品链接</span>
            {meta.links.length ? (
              meta.links.map((l) => (
                <a key={l.url} className="link-btn" href={l.url} target="_blank" rel="noopener noreferrer">🔗 {l.type} · {l.label}</a>
              ))
            ) : (
              <span style={{ color: '#6f6f8a' }}>暂无</span>
            )}
          </div>
          {note && (
            <div className="info-row">
              <span className="label">💌 寄语</span>
              <div className="note-box">
                {note.title && <div className="note-title">{note.title}</div>}
                {note.text && <div className="note-text">{note.text}</div>}
              </div>
            </div>
          )}
          {work && work.text && (
            <div className="info-row">
              <span className="label">全文 · {fullText.length} 字</span>
            </div>
          )}
          <div className="nav-hint">
            点击背景或按 Esc 关闭<br />
            ← → 键翻动本棒作品{works.length > 1 ? '（' + works.length + ' 个）' : ''}
          </div>
        </div>
      </div>
    </div>
  )
}