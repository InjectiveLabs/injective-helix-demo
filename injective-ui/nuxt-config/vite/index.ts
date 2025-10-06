import { defineConfig } from 'vite'
import { createResolver } from '@nuxt/kit'
import tsconfigPaths from 'vite-tsconfig-paths'
import { visualizer } from 'rollup-plugin-visualizer'
import {
  IS_HUB,
  IS_HELIX,
  IS_MITO,
  IS_BRIDGE,
  IS_EXPLORER,
  IS_ADMIN_UI,
  IS_TRADING_UI
} from './../../utils/constant'
import type { ViteConfig } from '@nuxt/schema'

const isLocalLayer = process.env.LOCAL_LAYER === 'true'
const isProduction = process.env.NODE_ENV === 'production'
const isAnalyzeBundle = process.env.ANALYZE_BUNDLE === 'true'

const buildSourceMap = process.env.BUILD_SOURCEMAP !== 'false'
const { resolve } = createResolver(import.meta.url)

// deps affecting local build against github source
const additionalDeps = [
  'bs58',
  'bn.js',
  'aes-js',
  'hash.js',
  'js-sha3',
  'eventemitter3',
  '@solana/web3.js',
  '@cosmjs/stargate',
  '@cosmjs/launchpad',
  '@solana/buffer-layout',
  'qr-code-generator-vue3',
  '@injectivelabs/grpc-web',
  'jayson/lib/client/browser',
  '@ethersproject/json-wallets',
  '@cosmostation/extension-client',
  'jayson/lib/client/browser/index',
  '@cosmostation/extension-client/error',
  '@cosmostation/extension-client/index'
]

export default defineConfig({
  define: {
    global: 'globalThis'
  },

  plugins: [
    tsconfigPaths(),
    visualizer({ open: isAnalyzeBundle }),
  ],

  server: {
    watch: {
      usePolling: true
    },

    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..']
    }
  },

  build: {
    sourcemap: buildSourceMap,

    rollupOptions: {
      cache: false,
      output: {
        manualChunks: (id: string) => {
          if (id.includes('@keplr-wallet')) {
            return 'keplr'
          }

          if (id.includes('@injectivelabs/wallet')) {
            return 'injective-wallet'
          }

          if (id.includes('@cosmjs')) {
            return 'cosmjs'
          }

          if (id.includes('@injectivelabs')) {
            return 'injective'
          }
        }
      }
    }
  },

  optimizeDeps: {
    exclude: ['fsevents'],
    include: isProduction
      ? []
      : [
          'ethers',
          'date-fns',
          'vue-imask',
          'vue-hotjar',
          'apexcharts',
          'lottie-web',
          'js-confetti',
          'date-fns-tz',
          'tailwind-merge',
          'canvas-confetti',
          'mixpanel-browser',
          'lightweight-charts',
          '@injectivelabs/utils',
          '@injectivelabs/sdk-ts',
          'qr-code-generator-vue3',
          '@metamask/eth-sig-util',
          '@injectivelabs/ts-types',
          '@injectivelabs/networks',
          'class-variance-authority',
          '@injectivelabs/exceptions',
          '@injectivelabs/wallet-evm',
          '@injectivelabs/wallet-base',
          '@injectivelabs/wallet-core',
          '@injectivelabs/wallet-ledger',
          '@injectivelabs/wallet-cosmos',
          '@injectivelabs/wallet-turnkey',
          '@injectivelabs/wallet-strategy',
          '@injectivelabs/wallet-cosmostation',
          '@injectivelabs/wallet-cosmos-strategy',
          ...(isLocalLayer ? [] : additionalDeps),
          ...(IS_MITO ? ['floating-vue'] : []),
          ...(IS_BRIDGE
            ? [
                'axios',
                'js-sha3',
                'js-base64',
                'alchemy-sdk',
                'floating-vue',
                '@solana/web3.js',
                '@ethersproject/bytes',
                '@wormhole-foundation/sdk',
                '@bangjelkoski/ens-validation',
                '@injectivelabs/sdk-ts/cosmjs',
                '@wormhole-foundation/sdk/evm',
                '@wormhole-foundation/sdk/solana',
                '@wormhole-foundation/sdk/cosmwasm'
              ]
            : []),
          ...(IS_ADMIN_UI
            ? [
                'axios',
                'js-sha3',
                'alchemy-sdk',
                '@vuepic/vue-datepicker',
                '@bangjelkoski/ens-validation'
              ]
            : []),
          ...(IS_HELIX
            ? [
                'gsap',
                'html-to-image',
                'embla-carousel-vue',
                'gsap/ScrollTrigger',
                'gsap/ScrollToPlugin'
              ]
            : []),
          ...(IS_EXPLORER
            ? [
                'v-calendar',
                'vue3-ace-editor',
                'ace-builds/src-noconflict/mode-json',
                'ace-builds/src-noconflict/theme-chrome'
              ]
            : []),
          ...(IS_HUB
            ? [
                'highcharts',
                'ace-builds',
                'vue3-ace-editor',
                'ace-builds/src-noconflict/mode-json',
                'ace-builds/src-noconflict/theme-solarized_dark'
              ]
            : []),
          ...(IS_TRADING_UI
            ? [
                '@shared/types',
                '@shared/data/token',
                '@shared/WalletService',
                '@shared/utils/formatter',
                '@shared/transformer/market',
                '@shared/transformer/oracle'
              ]
            : [])
        ]
  }
}) as ViteConfig

export const vitePlugins = [
  { ssr: false, src: resolve('./../../nuxt-config/polyfill.ts') }
]
