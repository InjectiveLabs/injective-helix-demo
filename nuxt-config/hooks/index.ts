/* eslint-disable no-console */
import path from 'path'
import { copy, mkdir, removeSync, pathExistsSync, copySync } from 'fs-extra'
import nitroConfig from './nitro'
import webpackConfig from './webpack'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack'

const outputPathPrefix = isWebpack && isProduction ? '.output/public' : 'public'
const tokenMetadataDstDir = path.resolve(
  `${outputPathPrefix}/vendor/@injectivelabs/token-metadata`
)
const tokenMetadataSrcDir = path.resolve(
  'node_modules/@injectivelabs/token-metadata/dist/images'
)
const outDirPathExist = pathExistsSync(tokenMetadataDstDir)

export default {
  'build:before'() {
    try {
      if (outDirPathExist) {
        removeSync(tokenMetadataDstDir)
      }
    } catch (e) {
      console.log(`Error deleting dir: ${e}`)
    }
  },

  'build:done'() {
    try {
      if (outDirPathExist) {
        copySync(tokenMetadataSrcDir, tokenMetadataDstDir, {
          overwrite: true
        })
      } else {
        mkdir(tokenMetadataDstDir)
        copy(tokenMetadataSrcDir, tokenMetadataDstDir, {
          overwrite: true
        })
      }
      console.log('✔ Successfully copied token images!')
    } catch (e) {
      console.log(`Error copying token images: ${e}`)
    }
  },
  ...nitroConfig,
  ...webpackConfig
}
