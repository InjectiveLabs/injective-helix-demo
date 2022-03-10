import { contractAddresses } from '@injectivelabs/contracts'
import { INJ_COIN_GECKO_ID, INJ_DENOM, Token } from '@injectivelabs/ui-common'
import { CHAIN_ID } from '../utils/constants'

export const injToken = {
  symbol: 'INJ',
  logo: '/bridgingNetworks/injective.png',
  name: 'Injective',
  decimals: 18,
  coinGeckoId: INJ_COIN_GECKO_ID,
  address: contractAddresses[CHAIN_ID].injective,
  denom: INJ_DENOM,
  usdPrice: 0
} as Token
