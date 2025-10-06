import type { ModuleOptions } from '@injectivelabs/nuxt-bugsnag'

const shouldInstantiateBugsnag = !!(
  process.env.GIT_TAG &&
  process.env.VITE_ENV &&
  process.env.VITE_BASE_URL &&
  process.env.VITE_BUGSNAG_KEY
)

const bugsnagConfig: Partial<ModuleOptions> = {
  config: {
    appVersion: process.env.GIT_TAG,
    releaseStage: process.env.VITE_ENV,
    apiKey: process.env.VITE_BUGSNAG_KEY as string,
    notifyReleaseStages: ['staging', 'mainnet']
  },
  baseUrl: process.env.VITE_BASE_URL,
  publishRelease: false,
  disabled: !shouldInstantiateBugsnag
}

if (shouldInstantiateBugsnag) {
  // eslint-disable-next-line no-console
  console.log(
    `Instantiating bugsnag: ${shouldInstantiateBugsnag}`,
    '\n',
    bugsnagConfig
  )
}

export default bugsnagConfig
