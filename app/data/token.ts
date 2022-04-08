import { INJ_COIN_GECKO_ID, INJ_DENOM, Token } from '@injectivelabs/ui-common'
import { getContractAddressesForNetworkOrThrow } from '@injectivelabs/contracts'
import { NETWORK } from '../utils/constants'

export const injToken = {
  symbol: 'INJ',
  logo: '/bridgingNetworks/injective.png',
  name: 'Injective',
  decimals: 18,
  coinGeckoId: INJ_COIN_GECKO_ID,
  address: getContractAddressesForNetworkOrThrow(NETWORK).injective,
  denom: INJ_DENOM,
  usdPrice: 0
} as Token
