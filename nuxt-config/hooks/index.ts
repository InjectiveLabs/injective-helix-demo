import { NuxtHooks } from 'nuxt/schema'
import nitroConfig from './nitro'
import {
  fetchSpotMarketSlugs,
  fetchMarketCategorySlugs,
  fetchDerivativeMarketSlugs,
  fetchExpiryFuturesMarketSlugs
} from './../../scripts/slugs'
import { tokenMetadata } from './../../scripts/scripts/tokens'

export default {
  async 'build:before'() {
    await fetchSpotMarketSlugs()
    await fetchMarketCategorySlugs()
    await fetchDerivativeMarketSlugs()
    await fetchExpiryFuturesMarketSlugs()
  },
  async 'build:done'() {
    await tokenMetadata()
  },

  ...nitroConfig
} as NuxtHooks
