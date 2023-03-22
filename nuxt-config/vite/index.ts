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
        manualChunks: (_id: string) => {
          //
        }
      }
    }
  },

  server: {
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],

    include: ['@keplr-wallet/unit']
  }
}) as UserConfig

export const vitePlugins = isWebpack
  ? []
  : [{ src: './nuxt-config/buffer.ts', ssr: false }]
