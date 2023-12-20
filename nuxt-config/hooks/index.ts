import { NuxtHooks } from 'nuxt/schema'
import nitroConfig from './nitro'
import { tokenMetadata } from './../../scripts/scripts/tokens'

export default {
  async 'build:done'() {
    await tokenMetadata()
  },

  ...nitroConfig
} as NuxtHooks
