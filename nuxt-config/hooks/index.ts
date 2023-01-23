/* eslint-disable no-console */
import path from 'path'
import { copy, removeSync, pathExistsSync, copySync } from 'fs-extra'
import staticRouteConfig from './route'
import webpackConfig from './webpack'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack' || isProduction

const outputPathPrefix = isWebpack ? '.output/public' : 'public'
const tokenMetadataDstDir = path.resolve(
  `${outputPathPrefix}/vendor/@injectivelabs/token-metadata`
)
const tokenMetadataSrcDir = path.resolve(
  'node_modules/@injectivelabs/token-metadata/dist/images'
)

export default {
  'build:before'() {
    try {
      removeSync(tokenMetadataDstDir)
    } catch (e) {
      console.log(`Error deleting dir: ${e}`)
    }
  },

  'build:done'() {
    try {
      const outDirPathExist = pathExistsSync(tokenMetadataDstDir)

      if (outDirPathExist) {
        copySync(tokenMetadataSrcDir, tokenMetadataDstDir, {
          overwrite: true,
          recursive: true
        })
      } else {
        copy(tokenMetadataSrcDir, tokenMetadataDstDir, {
          overwrite: true,
          recursive: true
        })
      }
      console.log('✔ Successfully copied token images!')
    } catch (e) {
      console.log(`Error copying token images: ${e}`)
    }
  },
  ...staticRouteConfig,
  ...webpackConfig
}
