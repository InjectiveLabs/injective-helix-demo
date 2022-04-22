import { Network } from '@injectivelabs/networks'

declare global {
  namespace NodeJS {
    // @ts-ignore
    interface ProcessEnv {
      APP_NAME: string
      NODE_ENV: string
      MAINTENANCE_ENABLED: string
      APP_BASE_URL: string
      APP_EXCHANGE_API_ENDPOINT: string
      APP_SENTRY_GRPC_ENDPOINT: string
      APP_SENTRY_HTTP_ENDPOINT: string
      APP_GAS_REBATE_API: string
      META_TAGS_ENABLED: string
      ORDERBOOK_POLLING_ENABLED: string
      METRICS_ENABLED: string
      REFERRALS_ENABLED: string
      PRICE_BAND_ENABLED: string
      GEO_IP_RESTRICTIONS_ENABLED: string
      APP_ELEVIO_ID: string
      APP_COINGECKO_API_KEY: string
      APP_PROXY_DETECTION_API_KEY: string
      APP_FEE_RECIPIENT: string
      APP_GOOGLE_ANALYTICS_KEY: string
      APP_GOOGLE_SITE_VERIFICATION_KEY: string
      APP_NETWORK: Network
      APP_BUGSNAG_KEY: string
      APP_ALCHEMY_KEY: string
      APP_ALCHEMY_KOVAN_KEY: string
      APP_CHAIN_ID: string
    }
  }
}

export {}
