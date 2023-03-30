import { defineConfig, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'

const isWebpack = process.env.BUILDER_TYPE === 'webpack'
const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'

export default defineConfig({
  define: {
    'process.env': JSON.stringify({}),
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
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
    exclude: ['fsevents']
  }
}) as UserConfig

export const vitePlugins = isWebpack
  ? []
  : [{ src: './nuxt-config/buffer.ts', ssr: false }]
