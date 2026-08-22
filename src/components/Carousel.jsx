import { useEffect, useState } from 'react'
import { assetUrl } from '../utils/gallery.js'
import ImgPh from './ImgPh.jsx'

// 缩略图轮播：多作品交叉淡入 + 指示点，悬停/详情打开时暂停
// 图片加载期间显示主题占位（樱花/六芒星），完整加载后再淡入显示
export default function Carousel({ works, paused }) {
  const [idx, setIdx] = useState(0)
  const [loaded, setLoaded] = useState({})
  const n = works.length

  useEffect(() => {
    if (n <= 1 || paused) return
    const timer = setInterval(() => setIdx((i) => (i + 1) % n), 2600)
    return () => clearInterval(timer)
  }, [n, paused])

  return (
    <div className="car-slot">
      <ImgPh />
      {works.map((w, i) => (
        <img
          key={w.name}
          className={'car-img' + (i === idx && loaded[w.name] ? ' on' : '')}
          src={assetUrl(w.thumb) || assetUrl(w.file)}
          alt={w.name}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded((s) => (s[w.name] ? s : { ...s, [w.name]: true }))}
        />
      ))}
      {n > 1 && (
        <span className="multi-dot">
          {works.map((w, i) => (
            <i key={w.name} className={i === idx ? 'on' : ''} />
          ))}
        </span>
      )}
    </div>
  )
}
