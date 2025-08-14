import { TradePage, TradeSubPage } from './../../types/page'
import {
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from './../../app/json'
import type { NitroConfig } from 'nitropack'
import type { NuxtHooks } from 'nuxt/schema'

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
  }
} as NuxtHooks
