import { TradePage, TradeSubPage } from './../../types/page'
import {
  expiryMarketIdMap,
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from './../../app/json'
import type { NitroConfig } from 'nitropack'
import type { NuxtHooks } from 'nuxt/schema'

const customStaticRoutes: string[] = []

export default {
  'pages:extend'(pages) {
    const spotPage = pages.find((page) => page.name === TradePage.Spot)
    const futuresPage = pages.find((page) => page.name === TradePage.Futures)

    if (futuresPage) {
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
      ...customStaticRoutes,
      ...Object.keys(verifiedSpotMarketIdMap).map((s) => `/spot/${s}`),
      ...Object.values(verifiedSpotMarketIdMap).map((s) => `/spot/${s}`),
      ...[
        ...Object.keys(verifiedDerivateMarketIdMap),
        ...Object.keys(expiryMarketIdMap)
      ].map((s) => `/futures/${s}`),
      ...['ef3bc2', '25269b', '5f90cb', '50be68'].map(
        (guildId) => `/guild/${guildId}`
      )
    ]
  }
} as NuxtHooks
