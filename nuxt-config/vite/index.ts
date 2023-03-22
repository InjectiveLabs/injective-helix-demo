import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import { nodePolyfills } from '@bangjelkoski/vite-plugin-node-polyfills'
import VueI18nPlugin from '@intlify/vite-plugin-vue-i18n'

const isWebpack = process.env.BUILDER_TYPE === 'webpack'
const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'

export default defineConfig({
  define: {
    'process.env': JSON.stringify({}),
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
  },
  plugins: [
    tsconfigPaths(),
    nodePolyfills({ protocolImports: true }),
    VueI18nPlugin({
      include: resolve(
        dirname(fileURLToPath(import.meta.url)),
        './app/region/messages/en.ts'
      ),
      runtimeOnly: false
    })
  ],

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

  resolve: {
    //
  },

  server: {
    fs: {
      // Allow serving files from one level up to the project root
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
