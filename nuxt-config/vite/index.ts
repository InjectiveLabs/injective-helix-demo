import { defineConfig } from 'vite'
import { ViteConfig } from 'nuxt/schema'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'
const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'

export default defineConfig({
  define: {
    // 'process.env': JSON.stringify({}),
    // 'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
  },
  plugins: [tsconfigPaths(), nodePolyfills({ protocolImports: true })],

  build: {
    sourcemap: buildSourceMap,

    rollupOptions: {
      cache: false,
      output: {
        manualChunks: (id: string) => {
          if (id.includes('@keplr-wallet')) {
            return 'keplr'
          }
        }
      }
    }
  },

  server: {
    fs: {
      allow: ['..']
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],
    include: []
  }
}) as ViteConfig

export const vitePlugins = [{ src: './nuxt-config/buffer.ts', ssr: false }]
