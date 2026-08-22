import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true, // 启动后自动打开浏览器
    fs: {
      // 允许读取上级目录中的 workplace 数据文件（灵梦接力信息.js 等）
      allow: ['..']
    }
  }
})