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

      if (config.module) {
        config.module.rules = [
          ...(config.module.rules as string[]),
          {
            test: /\.m?js/,
            include: [
              /node_modules\/@injectivelabs\/(bridge-ts|contracts|exceptions|networks|test-utils|token-metadata|token-utils|utils|core-proto-ts|indexer-proto-ts|ts-types|wallet-ts|sdk-ts|sdk-ui-ts)/
            ],
            resolve: {
              fullySpecified: false
            }
          } as any
        ]
      }
    })
  }
}
