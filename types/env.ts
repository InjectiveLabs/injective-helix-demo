import { Network } from '@injectivelabs/networks'

declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv {
      NODE_ENV: string
      APP_MAINTENANCE_ENABLED: string
      APP_BASE_URL: string
      APP_FEE_RECIPIENT: string
      APP_NETWORK: Network
      APP_BUGSNAG_KEY: string
      APP_NETWORK_ID: number
      APP_CHAIN_ID: number
    }
  }
}

export {}
