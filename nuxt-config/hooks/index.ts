import nitroConfig from './nitro'
import webpackConfig from './webpack'
import { tokenMetadata } from './../../scripts/scripts/tokens'

const isWebpack = process.env.BUILDER_TYPE === 'webpack'

export default {
  'render:response'() {
    tokenMetadata()
  },

  ...nitroConfig,
  ...(isWebpack ? webpackConfig : {})
}
