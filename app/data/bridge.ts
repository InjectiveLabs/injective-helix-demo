import {
  NetworkMeta,
  CosmosChannel,
  BridgingNetwork,
  tokenDenomsPerNetwork
} from '@injectivelabs/sdk-ui-ts'
import { CosmosChainId, TestnetCosmosChainId } from '@injectivelabs/ts-types'
import {
  TokenType,
  type Token,
  getTokenTypeFromDenom
} from '@injectivelabs/token-metadata'
import { LocationQuery } from 'vue-router'
import { INJ_DENOM } from '@injectivelabs/utils'
import { BridgeType, TransferSide } from '@/types'
import { IS_TESTNET } from '@/app/utils/constants'

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
  },
  {
    text: 'Celestia',
    value: BridgingNetwork.Celestia,
    icon: '/bridgingNetworks/celestia.webp',
    symbol: 'celestia.webp'
  },
  {
    text: 'Kava',
    value: BridgingNetwork.Kava,
    icon: '/bridgingNetworks/kava.webp'
  },
  {
    text: 'Oraichain',
    value: BridgingNetwork.Oraichain,
    icon: '/bridgingNetworks/orai.svg'
  },
  {
    text: 'Migaloo',
    value: BridgingNetwork.Migaloo,
    icon: '/bridgingNetworks/migaloo.svg'
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

export const COSMOS_CHAIN_ID = {
  [BridgingNetwork.Injective]: IS_TESTNET
    ? TestnetCosmosChainId.Injective
    : CosmosChainId.Injective,
  [BridgingNetwork.CosmosHub]: IS_TESTNET
    ? TestnetCosmosChainId.Cosmoshub
    : CosmosChainId.Cosmoshub,
  [BridgingNetwork.Osmosis]: IS_TESTNET ? '' : CosmosChainId.Osmosis,
  [BridgingNetwork.Axelar]: IS_TESTNET ? '' : CosmosChainId.Axelar,
  [BridgingNetwork.Chihuahua]: IS_TESTNET ? '' : CosmosChainId.Chihuahua,
  [BridgingNetwork.Juno]: IS_TESTNET ? '' : CosmosChainId.Juno,
  [BridgingNetwork.Evmos]: IS_TESTNET ? '' : CosmosChainId.Evmos,
  [BridgingNetwork.Persistence]: IS_TESTNET ? '' : CosmosChainId.Persistence,
  [BridgingNetwork.Secret]: IS_TESTNET ? '' : CosmosChainId.Secret,
  [BridgingNetwork.Stride]: IS_TESTNET ? '' : CosmosChainId.Stride,
  [BridgingNetwork.Crescent]: IS_TESTNET ? '' : CosmosChainId.Crescent,
  [BridgingNetwork.Sommelier]: IS_TESTNET ? '' : CosmosChainId.Sommelier,
  [BridgingNetwork.Canto]: IS_TESTNET ? '' : CosmosChainId.Canto,
  [BridgingNetwork.Kava]: IS_TESTNET ? '' : CosmosChainId.Kava,
  [BridgingNetwork.Oraichain]: IS_TESTNET ? '' : CosmosChainId.Oraichain,
  [BridgingNetwork.Noble]: IS_TESTNET ? '' : CosmosChainId.Noble,
  [BridgingNetwork.Celestia]: IS_TESTNET ? '' : CosmosChainId.Celestia,
  [BridgingNetwork.Migaloo]: IS_TESTNET ? '' : CosmosChainId.Migaloo
} as { [key in BridgingNetwork]: string }

export const COSMOS_CHANNEL: Array<CosmosChannel> = [
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.CosmosHub],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? 'channel-86' : 'channel-220',
    aToBClientId: IS_TESTNET ? '07-tendermint-107' : '07-tendermint-470',
    bToAChannelId: IS_TESTNET ? 'channel-1' : 'channel-1',
    bToAClientId: IS_TESTNET ? '07-tendermint-1' : '07-tendermint-5',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Osmosis],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-122',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-1703',
    bToAChannelId: IS_TESTNET ? '' : 'channel-8',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-19',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Axelar],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-10',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-37',
    bToAChannelId: IS_TESTNET ? '' : 'channel-84',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-113',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Evmos],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-10',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-19',
    bToAChannelId: IS_TESTNET ? '' : 'channel-83',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-112',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Persistence],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-41',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-57',
    bToAChannelId: IS_TESTNET ? '' : 'channel-82',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-110',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Secret],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-23',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-22',
    bToAChannelId: IS_TESTNET ? '' : 'channel-88',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-97',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Stride],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-6',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-2',
    bToAChannelId: IS_TESTNET ? '' : 'channel-89',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-131',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Crescent],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-23',
    aToBClientId: IS_TESTNET ? '' : '',
    bToAChannelId: IS_TESTNET ? '' : 'channel-90',
    bToAClientId: IS_TESTNET ? '' : '',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Sommelier],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-1',
    aToBClientId: IS_TESTNET ? '' : '',
    bToAChannelId: IS_TESTNET ? '' : 'channel-93',
    bToAClientId: IS_TESTNET ? '' : '',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Kava],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-122',
    aToBClientId: IS_TESTNET ? '' : '',
    bToAChannelId: IS_TESTNET ? '' : 'channel-143',
    bToAClientId: IS_TESTNET ? '' : '',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Oraichain],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-146',
    aToBClientId: IS_TESTNET ? '' : '',
    bToAChannelId: IS_TESTNET ? '' : 'channel-147',
    bToAClientId: IS_TESTNET ? '' : '',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Noble],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-31',
    aToBClientId: IS_TESTNET ? '' : '07-tendermint-57',
    bToAChannelId: IS_TESTNET ? '' : 'channel-148',
    bToAClientId: IS_TESTNET ? '' : '07-tendermint-212',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Celestia],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-7',
    aToBClientId: IS_TESTNET ? '' : '',
    bToAChannelId: IS_TESTNET ? '' : 'channel-152',
    bToAClientId: IS_TESTNET ? '' : '',
    port: 'transfer'
  },
  {
    aChainId: COSMOS_CHAIN_ID[BridgingNetwork.Migaloo],
    bChainId: COSMOS_CHAIN_ID[BridgingNetwork.Injective],
    aToBChannelId: IS_TESTNET ? '' : 'channel-3',
    aToBClientId: IS_TESTNET ? '' : '',
    bToAChannelId: IS_TESTNET ? '' : 'channel-102',
    bToAClientId: IS_TESTNET ? '' : '',
    port: 'transfer'
  }
]
