import { Switch } from 'antd'

// 顶部控制：主题切换（浅色樱花 / 深色星空）+ 动态效果开关
// 隐藏开关：点击胶囊空白处（或按住 Shift 点击主题开关）切换“按系统时间自动选主题”，默认开启
export default function ThemeSwitch({ dark, onDark, fx, onFx, autoTheme, onToggleAuto }) {
  return (
    <div
      className="theme-switch"
      title={autoTheme ? '自动主题（按系统时间）· 点击空白处切换为手动' : '手动主题 · 点击空白处切换为自动（按系统时间）'}
      onClick={onToggleAuto}
    >
      <Switch
        checked={dark}
        onChange={(v, e) => { if (e) e.stopPropagation(); onDark(v) }}
        checkedChildren="🌙"
        unCheckedChildren="☀️"
      />
      <button
        type="button"
        className={'ts-btn' + (fx ? ' on' : '')}
        title={fx ? '关闭动态效果' : '开启动态效果'}
        aria-pressed={fx}
        onClick={(e) => { e.stopPropagation(); onFx(!fx) }}
      >
        <span className="ts-btn-ico">✨</span>
        <span className="ts-btn-label">动态</span>
      </button>
    </div>
  )
}
