import { useEffect, useState } from 'react'
import { assetUrl } from '../utils/gallery.js'

// 缩略图轮播：多作品交叉淡入 + 指示点，悬停/详情打开时暂停
export default function Carousel({ works, paused }) {
  const [idx, setIdx] = useState(0)
  const n = works.length

  useEffect(() => {
    if (n <= 1 || paused) return
    const timer = setInterval(() => setIdx((i) => (i + 1) % n), 2600)
    return () => clearInterval(timer)
  }, [n, paused])

  return (
    <>
      {works.map((w, i) => (
        <img
          key={w.name}
          className={'car-img' + (i === idx ? ' on' : '')}
          src={assetUrl(w.thumb) || assetUrl(w.file)}
          alt={w.name}
          loading="lazy"
          decoding="async"
        />
      ))}
      {n > 1 && (
        <span className="multi-dot">
          {works.map((w, i) => (
            <i key={w.name} className={i === idx ? 'on' : ''} />
          ))}
        </span>
      )}
    </>
  )
}