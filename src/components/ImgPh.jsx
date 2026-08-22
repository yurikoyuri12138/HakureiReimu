import { useId } from 'react'

// 图片加载占位：浅色主题 = 匀速旋转的五瓣缺刻樱花；深色主题 = 六芒星步进旋转（每次转60°后停顿）
export default function ImgPh() {
  const gid = 'phg' + useId().replace(/:/g, '')
  return (
    <span className="img-ph" aria-hidden="true">
      <svg className="ph-sakura" viewBox="-60 -60 120 120">
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={a}
            transform={`rotate(${a})`}
            d="M0 -10 C -18 -28 -24 -48 -8 -58 L0 -49 L8 -58 C 24 -48 18 -28 0 -10 Z"
            fill="#ffb1c7"
            stroke="#ff7d9e"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ))}
        <circle cx="0" cy="0" r="4.5" fill="#f7d78a" />
      </svg>
      <svg className="ph-star" viewBox="-60 -60 120 120">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe9b3" />
            <stop offset="1" stopColor="#ff9fb0" />
          </linearGradient>
        </defs>
        <path d="M0 -52 L45 26 L-45 26 Z M0 52 L-45 -26 L45 -26 Z" fill={`url(#${gid})`} />
      </svg>
    </span>
  )
}
