import { NuxtHooks } from 'nuxt/schema'
import nitroConfig from './nitro'
import webpackConfig from './webpack'
import { tokenMetadata } from './../../scripts/scripts/tokens'

const isWebpack = process.env.BUILDER_TYPE === 'webpack'

export default {
  'build:done'() {
    tokenMetadata()
  },

  ...nitroConfig,
  ...(isWebpack ? webpackConfig : {})
} as NuxtHooks
