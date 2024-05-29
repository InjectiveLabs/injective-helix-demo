import { bugsnagSourceMaps } from './scripts/bugsnag'

/**
 * At this point there is no hook to execute scripts
 * after the nuxt generate command is done so we have to manually
 * execute them
 */
;(async () => {
  await bugsnagSourceMaps()
})()
