import path from 'path'
import { NitroConfig } from 'nitropack'
import { HttpClient } from '@injectivelabs/utils'
import { ENDPOINTS } from './../../app/utils/constants/setup'
import { getRoutes } from './../../app/utils/constants/routes'
import { GUILD_CONTRACT_ADDRESS } from './../../app/utils/constants'
import { TradeSubPage } from './../../types/page'

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

const resolvePagePath = (page: string) => {
  return path.resolve(__dirname, '..', '..', page)
}

const fetchGuildRoutes = async (): Promise<string[]> => {
  // hardcode guild ids to balance unstable indexer api response
  const GUILD_IDS = new Set(['ef3bc2', '25269b', '5f90cb', '50be68'])

  const client = new HttpClient(
    `${ENDPOINTS.campaign}/api/campaigns/v1/${GUILD_CONTRACT_ADDRESS}`
  )

  try {
    const { data } = (await client.get('guilds')) as {
      data: { guilds: { guildId: string }[] }
    }

    data.guilds || [].forEach(({ guildId }) => GUILD_IDS.add(guildId))

    return Array.from(GUILD_IDS).map((guildId) => `/guild/${guildId}`)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e)

    return Array.from(GUILD_IDS).map((guildId) => `/guild/${guildId}`)
  }
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
  },

  'pages:extend'(pages: any[]) {
    const routes = [
      {
        name: 'futures',
        path: '/futures',
        file: resolvePagePath('pages/futures/[futures].vue'),
        children: []
      },
      {
        name: 'spot',
        path: '/spot',
        file: resolvePagePath('pages/spot/[spot].vue'),
        children: []
      },
      {
        name: TradeSubPage.BinaryOption,
        path: '/binary-options/:binaryOption',
        file: resolvePagePath('pages/futures/[futures].vue'),
        children: []
      },
      {
        name: TradeSubPage.Derivatives,
        path: '/derivative/:derivative',
        file: resolvePagePath('pages/futures/[futures].vue')
      },
      {
        name: TradeSubPage.Perpetual,
        path: '/perpetual/:perpetual',
        file: resolvePagePath('pages/futures/[futures].vue')
      }
    ]

    pages.push(...routes)
  }
}
