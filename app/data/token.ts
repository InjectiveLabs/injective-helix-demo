import { INJ_COIN_GECKO_ID } from '@injectivelabs/sdk-ui-ts'
import { getContractAddressesForNetworkOrThrow } from '@injectivelabs/contracts'
import { Token, TokenType } from '@injectivelabs/token-metadata'
import { INJ_DENOM } from '@injectivelabs/utils'
import { NETWORK } from '../utils/constants'

export const injToken = {
  symbol: 'INJ',
  logo: '/bridgingNetworks/injective.png',
  icon: '/bridgingNetworks/injective.png',
  name: 'Injective',
  decimals: 18,
  coinGeckoId: INJ_COIN_GECKO_ID,
  address: getContractAddressesForNetworkOrThrow(NETWORK).injective,
  denom: INJ_DENOM,
  usdPrice: 0,
  tokenType: TokenType.Native
} as Token
