import { CoinGeckoApi } from '@injectivelabs/token-utils'

export const coinGeckoApi = new CoinGeckoApi({
  apiKey: process.env.APP_COINGECKO_API_KEY as string,
  baseUrl: process.env.APP_COINGECKO_API_KEY
    ? 'https://pro-api.coingecko.com/api/v3'
    : 'https://api.coingecko.com/api/v3'
})
