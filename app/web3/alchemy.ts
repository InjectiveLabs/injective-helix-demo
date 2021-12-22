import { AlchemyApi } from '@injectivelabs/alchemy-api'
import { IS_TESTNET } from '../utils/constants'

const endpoint = IS_TESTNET
  ? `https://eth-kovan.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`
  : `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`
export const alchemyApi = new AlchemyApi(endpoint)
