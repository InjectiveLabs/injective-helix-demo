/* eslint-disable no-console */
import path from 'path'
import { copy, removeSync, pathExistsSync, copySync } from 'fs-extra'

const isProduction = process.env.NODE_ENV === 'production'
const isWebpack = process.env.BUILDER_TYPE === 'webpack'

const outputPathPrefix = isWebpack && isProduction ? '.output/public' : 'public'
const tokenMetadataDstDir = path.resolve(
  process.cwd(),
  `${outputPathPrefix}/vendor/@injectivelabs/token-metadata`
)
const tokenMetadataSrcDir = path.resolve(
  process.cwd(),
  'node_modules/@injectivelabs/token-metadata/dist/images'
)
const outDirPathExist = pathExistsSync(tokenMetadataDstDir)

export function tokenMetadata() {
  try {
    if (outDirPathExist) {
      removeSync(tokenMetadataDstDir)
      copySync(tokenMetadataSrcDir, tokenMetadataDstDir, {
        overwrite: true
      })
    } else {
      copy(tokenMetadataSrcDir, tokenMetadataDstDir, {
        overwrite: true,
        errorOnExist: false
      })
    }
    console.log('✔ Successfully copied token images!')
  } catch (e) {
    console.log(`Error copying token images: ${e}`)
  }
}
