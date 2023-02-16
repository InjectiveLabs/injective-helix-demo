import path from 'path'
import { NitroConfig } from 'nitropack'
import { Network } from '@injectivelabs/networks'
import { getRoutes } from './../../app/utils/constants/routes'

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
  deprecatedMarketsRoutes
} = ROUTES

const resolvePagePath = (page: string) => {
  return path.resolve(__dirname, '..', '..', page)
}

export default {
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
      ...binaryOptionsRoutes,
      ...customStaticRoutes,
      ...deprecatedMarketsRoutes,
      ...futuresRoutes,
      ...spotRoutes,
      ...upcomingMarketsRoutes
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
        name: 'register',
        path: '/register',
        file: resolvePagePath('pages/account.vue'),
        children: []
      },
      {
        name: 'binary-options-binaryOption',
        path: '/binary-options/:binaryOption',
        file: resolvePagePath('pages/futures/[futures].vue'),
        children: []
      },
      {
        name: 'derivative-derivative',
        path: '/derivative/:derivative',
        file: resolvePagePath('pages/futures/[futures].vue')
      },
      {
        name: 'perpetual-perpetual',
        path: '/perpetual/:perpetual',
        file: resolvePagePath('pages/futures/[futures].vue')
      }
    ]

    pages.push(...routes)
  }
}
