import { tokenMetadata } from './scripts/tokens'
import { bugsnagSourceMaps } from './scripts/bugsnag'

/**
 * At this point there is no hook to execute scripts
 * after the nuxt generate command is done so we have to manually
 * execute them
 */
;(async () => {
  const isProduction = true
  tokenMetadata(isProduction)
  await bugsnagSourceMaps()
})()
