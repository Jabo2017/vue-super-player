/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

// 库构建：ES + UMD + d.ts，vue 外置（peer）
export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
  },
  plugins: [
    vue(),
    dts({ tsconfigPath: './tsconfig.json', include: ['src'], outDir: 'dist' }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'VueSuperPlayer',
      fileName: 'vue-super-player',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vue', 'vue-aliplay-player'],
      output: {
        globals: { vue: 'Vue' },
        exports: 'named',
        assetFileNames(info) {
          if (info.names?.some((n) => n.endsWith('.css'))) return 'vue-super-player.css'
          return '[name][extname]'
        },
      },
    },
  },
})
