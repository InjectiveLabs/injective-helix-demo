/* eslint-disable no-console */
import path from 'path'
import { copy, removeSync, pathExistsSync, copySync } from 'fs-extra'

export function tokenMetadata(isProduction = false) {
  const outputPathPrefix = isProduction ? '.output/public' : 'public'
  const tokenMetadataDstDir = path.resolve(
    process.cwd(),
    `${outputPathPrefix}/vendor/@injectivelabs/token-metadata`
  )
  const tokenMetadataSrcDir = path.resolve(
    process.cwd(),
    'node_modules/@injectivelabs/token-metadata/dist/images'
  )
  const outDirPathExist = pathExistsSync(tokenMetadataDstDir)

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
