import {
  BridgingNetwork,
  BalanceWithToken,
  tokenDenomsPerNetwork
} from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { injToken } from '@/app/data/token'

export const getNetworkDefaultToken = (
  balancesWithToken: BalanceWithToken[],
  currentToken: Token | undefined
): BalanceWithToken => {
  const [defaultToken] = balancesWithToken

  const sameSymbolTokenInSupply = balancesWithToken.find(
    ({ token: { symbol } }) => symbol === currentToken?.symbol
  )

  return (
    sameSymbolTokenInSupply ||
    defaultToken || {
      token: injToken,
      balance: '0',
      denom: injToken.decimals
    }
  )
}

export const getBridgingNetworkFromDenom = (denom: string) => {
  const bridgingNetwork = tokenDenomsPerNetwork.find(({ denoms }) =>
    denoms.includes(denom)
  )?.network

  return bridgingNetwork || BridgingNetwork.CosmosHub
}
