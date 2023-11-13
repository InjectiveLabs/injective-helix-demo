import path from 'path'
import { NitroConfig } from 'nitropack'
import { Network } from '@injectivelabs/networks'
import { HttpClient } from '@injectivelabs/utils'
import { ENDPOINTS } from './../../app/utils/constants/setup'
import { getRoutes } from './../../app/utils/constants/routes'
import { GUILD_CONTRACT_ADDRESS } from './../../app/utils/constants'
import { TradeSubPage } from './../../types/page'

const VITE_ENV = process.env.VITE_ENV as string
const VITE_NETWORK = process.env.VITE_NETWORK as Network

/**
 * We can't import from constants because the nitro build will fail
 * so we have to get them based on the process env
 **/
const { ROUTES } = getRoutes(VITE_NETWORK, VITE_ENV)
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
  const client = new HttpClient(
    `${ENDPOINTS.guild}/api/campaigns/v1/${GUILD_CONTRACT_ADDRESS}`
  )

  try {
    const { data } = (await client.get('guilds')) as {
      data: { guilds: { guildId: string }[] }
    }

    return data.guilds.map(({ guildId }) => `/guild/${guildId}`)
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e)

    return []
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
