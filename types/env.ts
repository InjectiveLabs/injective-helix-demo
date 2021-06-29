import { Network } from '@injectivelabs/networks'

declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv {
      NODE_ENV: string
      APP_MAINTENANCE_ENABLED: string
      APP_BASE_URL: string
      METRICS_ENABLED: string
      APP_FEE_RECIPIENT: string
      APP_NETWORK: Network
      APP_BUGSNAG_KEY: string
      APP_ALCHEMY_KEY: string
      APP_ALCHEMY_KOVAN_KEY: string
      APP_NETWORK_ID: number
      APP_CHAIN_ID: number
    }
  }
}

export {}
