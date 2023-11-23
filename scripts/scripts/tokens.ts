/* eslint-disable no-console */
import path from 'path'
import { copy, removeSync, pathExistsSync, readdir } from 'fs-extra'

async function copyInChunks(
  sourceDir: string,
  destDir: string,
  chunkSize = 25
) {
  const files = await readdir(sourceDir)

  for (let i = 0; i < files.length; i += chunkSize) {
    const chunk = files.slice(i, i + chunkSize)

    for (const file of chunk) {
      await copy(path.join(sourceDir, file), path.join(destDir, file), {
        overwrite: true
      })
    }
  }
}

export async function tokenMetadata(isProduction = false) {
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
    }

    await copyInChunks(tokenMetadataSrcDir, tokenMetadataDstDir)

    console.log('✔ Successfully copied token images!')
  } catch (e) {
    console.log(`Error copying token images: ${e}`)
  }
}
