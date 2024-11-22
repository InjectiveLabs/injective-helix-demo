import { NuxtHooks } from 'nuxt/schema'
import { NitroConfig } from 'nitropack'
import {
  verifiedSpotSlugs,
  verifiedExpirySlugs,
  verifiedDerivativeSlugs
} from './../../app/json'

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
      ...verifiedSpotSlugs.map((s) => `/spot/${s}`),
      ...[...verifiedDerivativeSlugs, ...verifiedExpirySlugs].map(
        (s) => `/futures/${s}`
      ),
      ...['ef3bc2', '25269b', '5f90cb', '50be68'].map(
        (guildId) => `/guild/${guildId}`
      )
    ]
  }
} as NuxtHooks
