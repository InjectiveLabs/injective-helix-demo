import { INJ_COIN_GECKO_ID, BridgingNetwork } from '@injectivelabs/sdk-ui-ts'
import { getContractAddressesForNetworkOrThrow } from '@injectivelabs/contracts'
import { TokenType, TokenWithPrice } from '@injectivelabs/token-metadata'
import { INJ_DENOM } from '@injectivelabs/utils'
import { CW20_ADAPTER_CONTRACT_BY_NETWORK } from '@injectivelabs/sdk-ts'
import { NETWORK } from '@/app/utils/constants'
import { denomClient } from '@/app/Services'
import { USDCSymbol } from '@/types'

const adapterContract = CW20_ADAPTER_CONTRACT_BY_NETWORK[NETWORK]

export const injToken = {
  denom: INJ_DENOM,
  name: 'Injective',
  symbol: 'INJ',
  decimals: 18,
  logo: '/injective-v3.svg',
  coinGeckoId: INJ_COIN_GECKO_ID,
  tokenType: TokenType.Native,

  erc20: {
    decimals: 18,
    address: getContractAddressesForNetworkOrThrow(NETWORK).injective
  },
  usdPrice: 0
} as TokenWithPrice

interface NetworkToSymbolMap {
  [key: string]: string
}

export const networkToSymbolMap = {
  [BridgingNetwork.Ethereum]: 'ETH',
  [BridgingNetwork.Axelar]: 'AXL',
  [BridgingNetwork.CosmosHub]: 'ATOM',
  [BridgingNetwork.Crescent]: 'CRE',
  [BridgingNetwork.Evmos]: 'EVMOS',
  [BridgingNetwork.Moonbeam]: 'AXL',
  [BridgingNetwork.Osmosis]: 'OSMO',
  [BridgingNetwork.Persistence]: 'XPRT',
  [BridgingNetwork.Secret]: 'SCRT',
  [BridgingNetwork.Stride]: 'STRD'
} as NetworkToSymbolMap

export const getFactoryDenomFromSymbol = (symbol: USDCSymbol) => {
  const tokenMeta = denomClient.getTokenMetaDataBySymbol(symbol)

  if (!tokenMeta || !adapterContract) {
    return ''
  }

  if (tokenMeta.cw20) {
    return `factory/${adapterContract}/${tokenMeta.cw20.address}`
  }

  const cw20TokenMeta = (tokenMeta.cw20s || []).find(
    (cw20) => cw20.symbol.toLowerCase() === symbol.toLowerCase()
  )

  if (!cw20TokenMeta) {
    return ''
  }

  return `factory/${adapterContract}/${cw20TokenMeta.address}`
}

export const getPeggyDenomFromSymbol = (symbol: USDCSymbol) => {
  const tokenMeta = denomClient.getTokenMetaDataBySymbol(symbol)

  if (!tokenMeta || !tokenMeta.erc20) {
    return ''
  }

  return `peggy${tokenMeta.erc20.address.toLowerCase()}`
}

export const usdcTokenDenom = {
  [USDCSymbol.PeggyEthereum]: getPeggyDenomFromSymbol(USDCSymbol.PeggyEthereum),
  [USDCSymbol.WormholeEthereum]: getFactoryDenomFromSymbol(
    USDCSymbol.WormholeEthereum
  ),
  [USDCSymbol.WormholeSolana]: getFactoryDenomFromSymbol(
    USDCSymbol.WormholeSolana
  )
}

export const usdcTokenDenoms = [
  usdcTokenDenom.USDC,
  usdcTokenDenom.USDCet
  // usdcTokenDenom.USDCso
]

export const stableCoinDenoms = ['USDT', 'USDC', 'USDCet', 'USDCso']
