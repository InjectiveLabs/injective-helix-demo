import { TradePage, TradeSubPage } from './../../types/page'
import {
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from './../../app/json'
import type { NitroConfig } from 'nitropack'
import type { NuxtHooks } from 'nuxt/schema'

const isProduction = process.env.NODE_ENV === 'production'

const HELIX_OPTIMIZE_DEPS = [
  'buffer',
  'clsx',
  'gsap',
  'js-sha3',
  'gsap/ScrollTrigger',
  'gsap/ScrollToPlugin',
  'lightweight-charts',
  'html-to-image',
  'embla-carousel-vue',
  '@injectivelabs/wallet-ledger',
  '@shared/types',
  '@shared/Service',
  '@shared/utils',
  '@shared/data/token',
  '@shared/WalletService',
  '@shared/utils/async',
  '@shared/utils/helper',
  '@shared/utils/lib',
  '@shared/utils/network',
  '@shared/utils/constant',
  '@shared/utils/formatter',
  '@shared/wallet/alchemy',
  '@shared/Service/app/ethGasPrice',
  '@shared/transformer/market',
  '@shared/transformer/market/fundingRate',
  '@shared/transformer/trade',
  '@shared/transformer/oracle'
]

export default {
  'pages:extend'(pages) {
    const spotPage = pages.find((page) => page.name === TradePage.Spot)
    const futuresPage = pages.find((page) => page.name === TradePage.Futures)

    if (futuresPage) {
      pages.push({
        ...futuresPage,
        path: '/futures/stocks',
        name: TradeSubPage.Stocks
      })

      pages.push({
        ...futuresPage,
        path: '/futures/:slug()',
        name: TradeSubPage.Futures
      })
    }

    if (spotPage) {
      pages.push({
        ...spotPage,
        path: '/spot/:slug()',
        name: TradeSubPage.Spot
      })
    }
  },
  'nitro:config'(nitroConfig: NitroConfig) {
    if (
      nitroConfig.dev ||
      !nitroConfig.prerender ||
      !nitroConfig.prerender.routes
    ) {
      return
    }

    nitroConfig.prerender.routes = [
      ...nitroConfig.prerender.routes,
      ...Object.keys(verifiedSpotMarketIdMap).map((s) => `/spot/${s}`),
      ...Object.keys(verifiedDerivateMarketIdMap).map((s) => `/futures/${s}`)
    ]
  },
  'vite:extendConfig'(config: any) {
    if (isProduction) {
      return
    }

    config.optimizeDeps = config.optimizeDeps || {}
    config.optimizeDeps.include = config.optimizeDeps.include || []
    config.optimizeDeps.include.push(...HELIX_OPTIMIZE_DEPS)
    config.optimizeDeps.include = [...new Set(config.optimizeDeps.include)]
  }
} as Partial<NuxtHooks>
