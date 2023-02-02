import { defineConfig, UserConfig } from 'vite'
import notifier from 'vite-plugin-notifier'
import tsconfigPaths from 'vite-tsconfig-paths'
import { NodeGlobalsPolyfillPlugin } from '@injectivelabs/node-globals-polyfill'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack' || isProduction

export default defineConfig({
  define: {
    'process.env.DEBUG': JSON.stringify(process.env.DEBUG)
  },
  plugins: [tsconfigPaths(), notifier()],

  resolve: {
    preserveSymlinks: true,
    alias: {
      path: 'path-browserify',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      http: 'agent-base',
      https: 'agent-base',
      assert: 'assert-browserify',
      util: 'util/'
    }
  },

  optimizeDeps: {
    force: true,

    esbuildOptions: {
      target: ['es2020'],
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true
        }) as any
      ]
    }
  }
}) as UserConfig

export const vitePlugins = isWebpack
  ? []
  : [{ src: './nuxt-config/buffer.ts', ssr: false }]
