import { Network } from '@injectivelabs/networks'

declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv {
      APP_NAME: string
      NODE_ENV: string
      MAINTENANCE_ENABLED: string
      APP_BASE_URL: string
      META_TAGS_ENABLED: string
      METRICS_ENABLED: string
      GEO_IP_RESTRICTIONS_ENABLED: string
      TRANSFER_RESTRICTIONS_ENABLED: string
      APP_FEE_RECIPIENT: string
      APP_GOOGLE_ANALYTICS_KEY: string
      APP_GOOGLE_SITE_VERIFICATION_KEY: string
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
