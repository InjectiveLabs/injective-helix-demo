import { TradePage, TradeSubPage } from './../../types/page'
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
  }
} as NuxtHooks
