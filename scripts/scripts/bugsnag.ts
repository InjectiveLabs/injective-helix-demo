/* eslint-disable no-console */
import path from 'path'
import { browser } from '@bugsnag/source-maps'

export async function bugsnagSourceMaps() {
  const apiKey = process.env.VITE_BUGSNAG_KEY
  const baseUrl = process.env.VITE_BASE_URL

  if (!apiKey || !baseUrl) {
    return
  }

  if (baseUrl.includes('localhost')) {
    return
  }

  const packageVersion = process.env.npm_package_version
  const projectRoot = process.cwd()
  const outputDirectory = path.join(projectRoot, '.output')

  const config = {
    apiKey,
    baseUrl,
    projectRoot,
    overwrite: true,
    appVersion: packageVersion,
    directory: `${outputDirectory}/public`
  }

  console.log('Source map upload to Bugsnag started \n')

  await browser.uploadMultiple(config)

  console.log('Source map upload to Bugsnag completed \n')
}
