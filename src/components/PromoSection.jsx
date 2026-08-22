import { useState } from 'react'
import { assetUrl } from '../utils/gallery.js'
import ImgPh from './ImgPh.jsx'

const PROMO = [
  { name: '零宣图', display: 'img/零宣图.webp' },
  { name: '一宣图', display: 'img/一宣图.webp' },
  { name: '二宣图', display: 'img/二宣图.webp' },
  { name: '座次表', display: 'img/座次表.webp' }
]

// 宣传图卡片：加载期间显示主题占位，完整加载后再显示图片
function PromoImg({ p }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className="promo-cover">
      {!loaded && (
        <div className="promo-ph">
          <ImgPh />
        </div>
      )}
      <img
        src={assetUrl(p.display)}
        alt={p.name}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
      />
    </div>
  )
}

// 宣传栏：零宣图 / 一宣图 / 二宣图 一排，座次表单列一排（原比例，无点击反馈）
export default function PromoSection() {
  return (
    <div className="promo-section">
      <div className="promo-head">
        <h2 className="section-title">📢 宣传栏</h2>
        <span className="hint">活动宣传图及座次表</span>
      </div>
      <div className="promo-row">
        {PROMO.slice(0, 3).map((p) => (
          <div className="promo-card" key={p.name}>
            <PromoImg p={p} />
            <div className="promo-name">📢 {p.name}</div>
          </div>
        ))}
      </div>
      <div className="promo-row promo-single">
        {PROMO.slice(3).map((p) => (
          <div className="promo-card" key={p.name}>
            <PromoImg p={p} />
            <div className="promo-name">🪑 {p.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
