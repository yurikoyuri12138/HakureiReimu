# ⛩️ 2026夏季博丽灵梦24H接力 · 展示画廊

2026 年 8 月 9 日举办的夏季灵梦 24H 接力创作线上活动展示站，收录各棒次的插画 / 视频 / 小说等作品，支持搜索与类型筛选。

**线上地址：https://yurikoyuri12138.github.io/HakureiReimu/**

## 功能特性

- **双主题**：浅色（樱花飘落）/ 深色（星空闪烁），右上角 ☀️/🌙 切换，选择持久化到 localStorage
- **自动主题（隐藏开关，默认开启）**：首次进入页面时按系统时间选择主题——6:00–17:59 浅色，其余时段深色；点击右上角胶囊的空白处（或按住 Shift 点击主题开关）可切换为手动模式，手动切换主题后自动模式随之关闭
- **动态效果开关**：右上角「✨ 动态」按钮开/关樱花与星光动画，默认关闭，降低移动端 GPU 负载与耗电；选择持久化
- **作品画廊**：按 预热 / 正式 / 特典 / SP / 替补 分栏展示，支持关键词搜索、类型筛选、封面轮播、点击查看详情（图文 / 视频跳转 / 作者寄语）
- **移动端适配**：≤640px 时详情页全屏，上方图/文占屏幕 3/4、下方作者信息与寄语占 1/4，点击下侧信息区可将整层上拉展开（再点图/文区恢复），信息区顶部有拉动标识，左上角有返回画廊按键；除宣传栏外的栏目始终保持一行两个卡片；移动端取消动态效果并隐藏「动态」按钮；防移动端 WebView 强制深色反色的 color-scheme 处理

## 技术栈

Vite 5 · React 18 · Ant Design 5 · GitHub Pages

## 本地开发 / 构建

```bash
npm install       # 安装依赖（若提示 npm.ps1 执行策略，改用 npm.cmd）
npm run dev       # 开发服务器 → http://localhost:5173
npm run build     # 打包到 dist/（--base=/HakureiReimu/）
npm run preview   # 预览构建产物
```

## 部署

本仓库远端 `master` 分支直接存放构建产物（`dist/` 内容 + README），在 GitHub Pages 设置中选择发布源为 **分支 master / (root)** 即可上线。

更新站点：修改 `src/` 与 `index.html` 后执行 `npm run build`，将 `dist/` 新产物覆盖推送到 `master`。

## 目录结构

```
├── index.html               # 入口（含首屏同步主题的内联脚本）
├── src/                     # 源码
│   ├── App.jsx              # 根组件：自动/手动主题、动态效果开关、装饰层
│   ├── index.css            # 双主题变量 + 移动端适配
│   ├── components/          # Header / ThemeSwitch / Toolbar / PromoSection /
│   │                        # Gallery / WorkCard / Carousel / DetailOverlay 等
│   ├── data/generated/      # 生成的棒次数据（信息 / 作品 / 文本 / 寄语）
│   └── utils/               # 画廊分组与资源路径工具
├── img/                     # 素材源（原图 / 缩略图 / 寄语）
├── scripts/                 # 素材同步与数据生成脚本
├── dist/                    # 构建产物（部署内容）
└── package.json
```

## 常用命令

| 命令 | 说明 |
|---|---|
| `npm run dev` | 开发服务器（热更新） |
| `npm run build` | 打包到 dist/（部署用） |
| `npm run preview` | 预览打包产物 |
| `node scripts/sync-assets.mjs` | 手动同步图片 |
