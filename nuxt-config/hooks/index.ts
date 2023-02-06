import nitroConfig from './nitro'
import webpackConfig from './webpack'
import { tokenMetadata } from './../../scripts/scripts/tokens'

export default {
  'build:done'() {
    tokenMetadata()
  },
  ...nitroConfig,
  ...webpackConfig
}
