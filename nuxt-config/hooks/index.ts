import { NuxtHooks } from 'nuxt/schema'
import { NitroConfig } from 'nitropack'
import {
  expiryMarketIdMap,
  verifiedSpotMarketIdMap,
  verifiedDerivateMarketIdMap
} from './../../app/json'
import { TradePage, TradeSubPage } from './../../types/page'

const customStaticRoutes: string[] = []
const upcomingMarketsRoutes: string[] = []

export default {
  'pages:extend'(pages) {
    const spotPage = pages.find((page) => page.name === TradePage.Spot)
    const futuresPage = pages.find((page) => page.name === TradePage.Futures)

    if (futuresPage) {
      pages.push({
        ...futuresPage,
        name: TradeSubPage.Futures,
        path: '/futures/:slug()'
      })
    }

    if (spotPage) {
      pages.push({
        ...spotPage,
        name: TradeSubPage.Spot,
        path: '/spot/:slug()'
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
      ...upcomingMarketsRoutes,
      ...Object.keys(verifiedSpotMarketIdMap).map((s) => `/spot/${s}`),
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
