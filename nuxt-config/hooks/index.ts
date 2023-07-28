import { NuxtHooks } from 'nuxt/schema'
import nitroConfig from './nitro'
import { tokenMetadata } from './../../scripts/scripts/tokens'

export default {
  'build:done'() {
    tokenMetadata()
  },

  ...nitroConfig
} as NuxtHooks
