import { WalletStrategy } from '@injectivelabs/wallet-ts'
import { EthereumChainId } from '@injectivelabs/ts-types'
import { CHAIN_ID, ETHEREUM_CHAIN_ID, IS_TESTNET } from '~/app/utils/constants'

export const getRpcUrlsForChainIds = (): Record<EthereumChainId, string> => {
  return {
    [EthereumChainId.Ganache]: 'http://localhost:8545',
    [EthereumChainId.HardHat]: 'http://localhost:8545',
    [EthereumChainId.Kovan]: `https://eth-kovan.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`,
    [EthereumChainId.Mainnet]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`,
    [EthereumChainId.Injective]: '',
    [EthereumChainId.Rinkeby]: '',
    [EthereumChainId.Ropsten]: ''
  }
}

export const getRpcWsUrlsForChainIds = (): Record<EthereumChainId, string> => {
  return {
    [EthereumChainId.Ganache]: 'ws://localhost:1318',
    [EthereumChainId.HardHat]: 'ws://localhost:1318',
    [EthereumChainId.Kovan]: `wss://eth-kovan.ws.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`,
    [EthereumChainId.Mainnet]: `wss://eth-mainnet.ws.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`,
    [EthereumChainId.Injective]: '',
    [EthereumChainId.Rinkeby]: '',
    [EthereumChainId.Ropsten]: ''
  }
}

export const alchemyRpcEndpoint = IS_TESTNET
  ? `https://eth-kovan.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`
  : `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`

const rpcUrls = getRpcUrlsForChainIds()
const wsRpcUrls = getRpcWsUrlsForChainIds()

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumChainId: ETHEREUM_CHAIN_ID,
  options: {
    wsRpcUrls,
    rpcUrls
  }
})
