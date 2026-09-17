import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// demo 页构建：GitHub Pages 项目站点
export default defineConfig({
  root: 'demo',
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
  build: {
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
})
