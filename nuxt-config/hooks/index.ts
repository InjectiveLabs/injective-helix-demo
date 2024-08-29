import { NuxtHooks } from 'nuxt/schema'
import { NitroConfig } from 'nitropack'
import { spotSlugs, expirySlugs, derivativeSlugs } from './../../app/json'

const customStaticRoutes: string[] = []
const upcomingMarketsRoutes: string[] = []

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
      ...customStaticRoutes,
      ...upcomingMarketsRoutes,
      ...spotSlugs.map((s) => `/spot/${s}`),
      ...[...derivativeSlugs, ...expirySlugs].map((s) => `/futures/${s}`),
      ...['ef3bc2', '25269b', '5f90cb', '50be68'].map(
        (guildId) => `/guild/${guildId}`
      )
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
} as NuxtHooks
