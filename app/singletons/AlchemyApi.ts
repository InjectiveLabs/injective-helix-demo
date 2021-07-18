import { AlchemyApi } from '@injectivelabs/alchemy-api'

export const alchemyApi = new AlchemyApi(
  `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`
)
