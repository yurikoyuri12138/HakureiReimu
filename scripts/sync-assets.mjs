// 资源同步脚本：把 img/ 目录整体同步到 public/img/（原图直用，不压缩）
// 运行时机：predev / prebuild 自动执行；也可手动 `node scripts/sync-assets.mjs`
import { cpSync, existsSync, linkSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url))) // workplace2
const imgDir = join(root, 'img')
const publicDir = join(root, 'public')

// 清理旧的 WebP 压缩产物目录
for (const old of ['works', 'thumbs', 'promo']) {
  rmSync(join(publicDir, old), { recursive: true, force: true })
}

// 同步 img/ → public/img/（硬链接优先，跨盘自动降级为复制）
const dst = join(publicDir, 'img')
rmSync(dst, { recursive: true, force: true })
mkdirSync(dst, { recursive: true })

function linkOrCopy(src, out) {
  try {
    linkSync(src, out)
  } catch {
    cpSync(src, out)
  }
}

let count = 0
function syncDir(from, to) {
  mkdirSync(to, { recursive: true })
  for (const f of readdirSync(from)) {
    const src = join(from, f)
    const out = join(to, f)
    if (statSync(src).isDirectory()) {
      syncDir(src, out) // thumbs/、寄语/ 等子目录
    } else {
      linkOrCopy(src, out)
      count++
    }
  }
}
syncDir(imgDir, dst)

console.log('[sync-assets] 原图同步完成：public/img（', count, '个文件，无压缩）')
