import { NitroConfig } from 'nitropack'
import { getRoutes } from './../../app/utils/constants/routes'

/**
 * We can't import from constants because the nitro build will fail
 * so we have to get them based on the process env
 **/
const { ROUTES } = getRoutes()
const {
  spotRoutes,
  futuresRoutes,
  customStaticRoutes,
  binaryOptionsRoutes,
  upcomingMarketsRoutes,
  gridTradingSpotRoutes,
  liquidityBotSpotRoutes
} = ROUTES

const fetchGuildRoutes = (): string[] => {
  const GUILD_IDS = new Set(['ef3bc2', '25269b', '5f90cb', '50be68'])

  return Array.from(GUILD_IDS).map((guildId) => `/guild/${guildId}`)
}

export default {
  async 'nitro:config'(nitroConfig: NitroConfig) {
    if (
      nitroConfig.dev ||
      !nitroConfig.prerender ||
      !nitroConfig.prerender.routes
    ) {
      return
    }

    nitroConfig.prerender.routes = [
      ...nitroConfig.prerender.routes,
      ...binaryOptionsRoutes,
      ...customStaticRoutes,
      ...futuresRoutes,
      ...spotRoutes,
      ...upcomingMarketsRoutes,
      ...gridTradingSpotRoutes,
      ...liquidityBotSpotRoutes,
      ...(await fetchGuildRoutes())
    ]
  }

  // 'pages:extend'(pages: any[]) {
  //   const routes = [
  //     {
  //       name: 'futures',
  //       path: '/futures',
  //       file: resolvePagePath('pages/futures/[futures].vue'),
  //       children: []
  //     },
  //     {
  //       name: 'spot',
  //       path: '/spot',
  //       file: resolvePagePath('pages/spot/[spot].vue'),
  //       children: []
  //     },
  //     {
  //       name: TradeSubPage.BinaryOption,
  //       path: '/binary-options/:binaryOption',
  //       file: resolvePagePath('pages/futures/[futures].vue'),
  //       children: []
  //     },
  //     {
  //       name: TradeSubPage.Derivatives,
  //       path: '/derivative/:derivative',
  //       file: resolvePagePath('pages/futures/[futures].vue')
  //     },
  //     {
  //       name: TradeSubPage.Perpetual,
  //       path: '/perpetual/:perpetual',
  //       file: resolvePagePath('pages/futures/[futures].vue')
  //     }
  //   ]

  //   pages.push(...routes)
  // }
}
