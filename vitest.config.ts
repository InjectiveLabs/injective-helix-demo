import { defineConfig } from 'vitest/config'
import AutoImport from 'unplugin-auto-import/vite'
import vue from '@vitejs/plugin-vue'
import { alias } from './test/config/utils'

export default defineConfig({
  plugins: [
    vue() as any,
    AutoImport({
      dirs: ['./composables', './store/', './store/**/index.ts'],
      imports: ['vue', '@vueuse/core']
    })
  ],
  test: {
    dangerouslyIgnoreUnhandledErrors: true,
    globals: true,
    testTimeout: 30 * 1000,
    minThreads: 1,
    include: ['./test/**/*.test.ts']
  },
  resolve: {
    alias
  }
})
