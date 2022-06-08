import { Web3Strategy } from '@injectivelabs/web3-strategy'
import { EthereumChainId } from '@injectivelabs/ts-types'
import { ETHEREUM_CHAIN_ID } from '~/app/utils/constants'

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

const rpcUrls = getRpcUrlsForChainIds()
const wsRpcUrls = getRpcWsUrlsForChainIds()

export const web3Strategy = new Web3Strategy({
  chainId: parseInt(ETHEREUM_CHAIN_ID.toString()) /** TODO  */,
  // ethereumChainId: parseInt(ETHEREUM_CHAIN_ID.toString()),
  options: {
    wsRpcUrl: wsRpcUrls[ETHEREUM_CHAIN_ID],
    rpcUrl: rpcUrls[ETHEREUM_CHAIN_ID]
  }
})
