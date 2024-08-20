/* eslint-disable no-console */
import { dirname } from 'node:path'
import { mkdirSync, existsSync, writeFileSync } from 'node:fs'

export const storeJsonFile = (path: string, data: any) => {
  const dirPath = dirname(path)

  if (!existsSync(dirPath)) {
    try {
      mkdirSync(dirPath, { recursive: true })
    } catch (e: any) {
      console.log('❌❌❌ Error creating directory', e)

      throw e
    }
  }

  try {
    writeFileSync(path, JSON.stringify(data, null, '\t'))
  } catch (e: any) {
    console.log(`❌❌❌ Error creating JSON file: ${path}`, e)

    throw e
  }
}
