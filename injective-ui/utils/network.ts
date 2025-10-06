import { IS_DEVNET, IS_TESTNET } from './../utils/constant'
import { Network } from './../types'

export const getHubUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.hub.injective.dev'
  }

  if (IS_TESTNET) {
    return 'https://testnet.hub.injective.network'
  }

  return 'https://injhub.com'
}

export const getMitoUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.mito.fi'
  }

  if (IS_TESTNET) {
    return 'https://testnet.mito.fi'
  }

  return 'https://mito.fi'
}

export const getExchangeUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://dev.helixapp.com'
  }

  if (IS_TESTNET) {
    return 'https://testnet.helixapp.com'
  }

  return 'https://helixapp.com'
}

export const getExplorerUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.explorer.injective.dev'
  }

  if (IS_TESTNET) {
    return 'https://testnet.explorer.injective.network'
  }

  return 'https://injscan.com'
}

export const getBridgeUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.bridge.injective.dev'
  }

  if (IS_TESTNET) {
    return 'https://testnet.bridge.injective.network'
  }

  return 'https://bridge.injective.network'
}

export const getNetworkFromAddress = (address: string): Network => {
  switch (true) {
    case address.startsWith('inj'):
      return Network.Injective
    case address.startsWith('cosmos'):
      return Network.CosmosHub
    case address.startsWith('juno'):
      return Network.Juno
    case address.startsWith('terra'):
      return Network.Terra
    case address.startsWith('osmo'):
      return Network.Osmosis
    case address.startsWith('chihuahua'):
      return Network.Chihuahua
    case address.startsWith('axelar'):
      return Network.Axelar
    case address.startsWith('evmos'):
      return Network.Evmos
    case address.startsWith('persistence'):
      return Network.Persistence
    case address.startsWith('secret'):
      return Network.Secret
    case address.startsWith('stride'):
      return Network.Stride
    case address.startsWith('cre'):
      return Network.Crescent
    case address.startsWith('somm'):
      return Network.Sommelier
    case address.startsWith('canto'):
      return Network.Canto
    case address.startsWith('kava'):
      return Network.Kava
    case address.startsWith('orai'):
      return Network.Oraichain
    case address.startsWith('0x'):
      return Network.Ethereum
    case address.startsWith('noble'):
      return Network.Noble
    case address.startsWith('celestia'):
      return Network.Celestia
    case address.startsWith('migaloo'):
      return Network.Migaloo
    case address.startsWith('kujira'):
      return Network.Kujira
    case address.startsWith('saga'):
      return Network.Saga
    case address.startsWith('fetch'):
      return Network.Fetch
    case address.startsWith('mantra'):
      return Network.Mantra
    case address.startsWith('xion'):
      return Network.Xion
    case address.startsWith('wormhole'):
      return Network.Wormhole
    default:
      return Network.Injective
  }
}

const getMainnetNetworkExplorerUrl = (network: Network): string => {
  switch (network) {
    case Network.Oraichain:
      return 'https://scan.orai.io'
    case Network.Migaloo:
      return 'https://migaloo.explorers.guru'
    case Network.CosmosHub:
      return 'https://www.mintscan.io/cosmos'
    case Network.Chihuahua:
      return 'https://www.mintscan.io/chihuahua'
    case Network.Axelar:
      return 'https://www.mintscan.io/axelar'
    case Network.Evmos:
      return 'https://www.mintscan.io/evmos'
    case Network.Persistence:
      return 'https://www.mintscan.io/persistence'
    case Network.Osmosis:
      return 'https://www.mintscan.io/osmosis'
    case Network.Secret:
      return 'https://www.mintscan.io/secret'
    case Network.Stride:
      return 'https://www.mintscan.io/stride'
    case Network.Crescent:
      return 'https://www.mintscan.io/crescent'
    case Network.Sommelier:
      return 'https://www.mintscan.io/sommelier'
    case Network.Canto:
      return 'https://www.mintscan.io/canto'
    case Network.Kava:
      return 'https://www.mintscan.io/kava'
    case Network.Noble:
      return 'https://www.mintscan.io/noble'
    case Network.Celestia:
      return 'https://www.mintscan.io/celestia'
    case Network.Ethereum:
      return 'https://etherscan.io'
    case Network.EthereumWh:
      return 'https://etherscan.io'
    case Network.Arbitrum:
      return 'https://arbiscan.io'
    case Network.Polygon:
      return 'https://polygonscan.com'
    case Network.Solana:
      return 'https://explorer.solana.com'
    case Network.Terra:
      return 'https://finder.terra.money/mainnet'
    case Network.Andromeda:
      return 'https://ping.wildsage.io/andromeda'
    case Network.Saga:
      return 'https://www.mintscan.io/saga'
    case Network.Fetch:
      return 'https://www.mintscan.io/fetchai'
    case Network.Mantra:
      return 'https://www.mintscan.io/mantra'
    case Network.Xion:
      return 'https://www.mintscan.io/xion'
    case Network.Injective:
      return 'https://injscan.com'
    case Network.Wormhole:
      return 'https://bigdipper.live/wormhole'
    default:
      return 'https://injscan.com'
  }
}

const getTestNetworkExplorerUrl = (network: Network): string => {
  switch (network) {
    case Network.Ethereum:
      return 'https://sepolia.etherscan.io'
    case Network.EthereumWh:
      return 'https://sepolia.etherscan.io'
    case Network.Arbitrum:
      return 'https://sepolia.arbiscan.io'
    case Network.Polygon:
      return 'https://mumbai.polygonscan.com'
    case Network.Solana:
      return 'https://explorer.solana.com/'
    case Network.Terra:
      return 'https://finder.terra.money/testnet'
    case Network.Injective:
      return 'https://testnet.explorer.injective.network'
    case Network.CosmosHub:
      return 'https://www.mintscan.io/cosmoshub-testnet'
    case Network.Axelar:
      return 'https://www.mintscan.io/axelar-testnet'
    case Network.Evmos:
      return 'https://www.mintscan.io/evmos'
    case Network.Persistence:
      return 'https://www.mintscan.io/persistence-testnet'
    case Network.Osmosis:
      return 'https://www.mintscan.io/osmosis-testnet'
    case Network.XionTestnet:
      return 'https://explorer.burnt.com/xion-testnet-1'
    case Network.Kava:
      return 'https://www.mintscan.io/kava-testnet'
    case Network.Noble:
      return 'https://www.mintscan.io/noble-testnet'
    case Network.EvmosTestnet:
      return 'https://www.mintscan.io/evmos-testnet'
    default:
      return 'https://mintscan.io/cosmoshub-testnet'
  }
}

export const getNetworkExplorerUrl = (network: Network): string =>
  IS_TESTNET
    ? getTestNetworkExplorerUrl(network)
    : getMainnetNetworkExplorerUrl(network)

export const getNetworkExplorerAccountUrl = (address: string): string => {
  const network = getNetworkFromAddress(address)

  const urlPrefix = [
    Network.Solana,
    Network.Ethereum,
    Network.EthereumWh,
    Network.Polygon
  ].includes(network)
    ? 'address'
    : 'account'

  return `${getNetworkExplorerUrl(network)}/${urlPrefix}/${address}`
}
