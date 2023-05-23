import {
  BridgingNetwork,
  NetworkMeta,
  tokenDenomsPerNetwork
} from '@injectivelabs/sdk-ui-ts'
import {
  TokenType,
  type Token,
  getTokenTypeFromDenom
} from '@injectivelabs/token-metadata'
import { LocationQuery } from 'vue-router'
import { INJ_DENOM } from '@injectivelabs/utils'
import { BridgeType, TransferSide } from '@/types'

export const networksMeta = [
  {
    text: 'Injective',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png',
    symbol: 'injective-v3.svg'
  },
  {
    text: 'Ethereum',
    value: BridgingNetwork.Ethereum,
    icon: '/bridgingNetworks/ethereum.png',
    symbol: 'ethereum.svg'
  },
  {
    text: 'Ethereum (Wormhole)',
    value: BridgingNetwork.EthereumWh,
    icon: '/bridgingNetworks/ethereum.png',
    symbol: 'ethereum.svg'
  },
  {
    text: 'CosmosHub',
    value: BridgingNetwork.CosmosHub,
    icon: '/bridgingNetworks/cosmosHub.png',
    symbol: 'atom.svg'
  },
  {
    text: 'Osmosis',
    value: BridgingNetwork.Osmosis,
    icon: '/bridgingNetworks/osmosis.png',
    symbol: 'osmo.png'
  },
  {
    text: 'Chihuahua',
    value: BridgingNetwork.Chihuahua,
    icon: '/bridgingNetworks/chihuahua.jpeg',
    symbol: 'chihuahua.jpeg'
  },
  {
    text: 'Evmos',
    value: BridgingNetwork.Evmos,
    icon: '/bridgingNetworks/evmos.png',
    symbol: 'evmos.svg'
  },
  {
    text: 'Persistence',
    value: BridgingNetwork.Persistence,
    icon: '/bridgingNetworks/persistence.png',
    symbol: 'xprt.svg'
  },
  /*
  {
    text: 'Juno',
    value: BridgingNetwork.Juno,
    icon: '/bridgingNetworks/juno.jpeg',
  },
  */
  {
    text: 'Axelar',
    value: BridgingNetwork.Axelar,
    icon: '/bridgingNetworks/axelar.jpeg',
    symbol: 'axelar.jpeg'
  },
  {
    text: 'Moonbeam',
    value: BridgingNetwork.Moonbeam,
    icon: '/bridgingNetworks/moonbeam.png',
    symbol: 'dot.jpeg'
  },
  {
    text: 'Stride',
    value: BridgingNetwork.Stride,
    icon: '/bridgingNetworks/stride.png',
    symbol: 'stride.png'
  },
  {
    text: 'Crescent',
    value: BridgingNetwork.Crescent,
    icon: '/bridgingNetworks/crescent.jpeg',
    symbol: 'crescent.jpeg'
  },
  /*
  {
    text: 'Canto',
    value: BridgingNetwork.Canto,
    icon: '/bridgingNetworks/canto.png',
    symbol: 'canto.png'
  }, */
  {
    text: 'Solana',
    value: BridgingNetwork.Solana,
    icon: '/bridgingNetworks/solana.svg',
    symbol: 'solana.svg'
  }
] as NetworkMeta[]

export const transferSideMeta = {
  [TransferSide.Bank]: {
    text: 'Injective Wallet',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png'
  },

  [TransferSide.TradingAccount]: {
    text: 'Trading Account',
    value: BridgingNetwork.Injective,
    icon: '/bridgingNetworks/injective.png'
  }
}

export const getBridgingNetworkBySymbol = (symbol: string): BridgingNetwork => {
  const symbolToUpperCase = symbol.toUpperCase()

  if (['ATOM', 'UPHOTON'].includes(symbolToUpperCase)) {
    return BridgingNetwork.CosmosHub
  }

  if (['LUNA', 'ULUNA', 'UST', 'UUSD'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Terra
  }

  if (['OSMO', 'UOSMO'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Osmosis
  }

  if (['HUAHUA', 'UHUAHUA'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Chihuahua
  }

  if (['JUNO', 'UJUNO'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Juno
  }

  if (['EVMOS'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Evmos
  }

  if (['XPRT'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Persistence
  }

  if (['STRD'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Stride
  }

  if (['XRPT'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Persistence
  }

  if (['AXL', 'UAXL', 'DOT', 'DOT-PLANCK'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Axelar
  }

  if (['DOT'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Moonbeam
  }

  if (['CRE'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Crescent
  }

  if (['SOL', 'USDCSO'].includes(symbolToUpperCase)) {
    return BridgingNetwork.Solana
  }

  if (['USDCET'].includes(symbolToUpperCase)) {
    return BridgingNetwork.EthereumWh
  }

  if (['ARB'].includes(symbolToUpperCase)) {
    return BridgingNetwork.EthereumWh // TODO: Arbitrum
  }

  return BridgingNetwork.Ethereum
}

export const isTokenWormholeToken = (token: Token) => {
  const wormholeSymbols = tokenDenomsPerNetwork
    .filter(
      ({ network }: { network: BridgingNetwork }) =>
        network === BridgingNetwork.Arbitrum ||
        network === BridgingNetwork.EthereumWh ||
        network === BridgingNetwork.Solana
    )
    .map((config) => config.symbols)

  const isWormholeToken = wormholeSymbols?.find((symbol) =>
    symbol.includes(token.symbol)
  )

  return !!isWormholeToken
}

export const getDenomAndTypeFromQuery = (
  query: LocationQuery
): { denom: string; tokenType: TokenType; bridgeType: BridgeType } => {
  const actualQuery = query as
    | {
        denom: string
        type: BridgeType
      }
    | Record<string, undefined>

  if (!actualQuery.denom && !actualQuery.type) {
    return {
      denom: INJ_DENOM,
      tokenType: TokenType.Native,
      bridgeType: BridgeType.Deposit
    }
  }

  if (!actualQuery.denom && actualQuery.type) {
    return {
      denom: INJ_DENOM,
      tokenType: TokenType.Native,
      bridgeType: Object.values(BridgeType).includes(actualQuery.type)
        ? actualQuery.type
        : BridgeType.Deposit
    }
  }

  if (actualQuery.denom && !actualQuery.type) {
    return {
      denom: actualQuery.denom,
      bridgeType: BridgeType.Deposit,
      tokenType: getTokenTypeFromDenom(actualQuery.denom)
    }
  }

  if (actualQuery.denom && actualQuery.type) {
    return {
      denom: actualQuery.denom,
      tokenType: getTokenTypeFromDenom(actualQuery.denom),
      bridgeType: Object.values(BridgeType).includes(actualQuery.type)
        ? actualQuery.type
        : BridgeType.Deposit
    }
  }

  return {
    denom: INJ_DENOM,
    tokenType: TokenType.Native,
    bridgeType: BridgeType.Deposit
  }
}
