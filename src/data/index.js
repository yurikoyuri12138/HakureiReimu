// 数据对接层：读取本目录 generated/ 下的 ES 模块数据
// （数据由生成脚本扫描 img/ 与 workplace/灵梦接力信息.md 产出，
//   图片路径指向 img/webp/ 下的 WebP 展示版）
import { INFO } from './generated/info.js'
import { WORKS } from './generated/works.js'
import { TEXTS } from './generated/texts.js'
import { NOTES } from './generated/notes.js'

export { INFO, WORKS, TEXTS, NOTES }
