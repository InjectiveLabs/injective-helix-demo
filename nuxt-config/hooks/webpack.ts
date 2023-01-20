import Dotenv from 'dotenv-webpack'
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'
import type { Configuration as WebpackConfig } from 'webpack'

export default {
  'webpack:config'(configs: WebpackConfig[]) {
    configs.forEach((config) => {
      const plugins = [
        new Dotenv({ systemvars: true }),
        new NodePolyfillPlugin()
      ]

      config.plugins = config.plugins || []
      config.plugins = [...config.plugins, ...plugins]

      config.resolve = config.resolve || {}
      config.resolve.fallback = {
        url: require.resolve('url'),
        assert: require.resolve('assert'),
        crypto: require.resolve('crypto-browserify'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer'),
        stream: require.resolve('stream-browserify')
      }
    })
  }
}
