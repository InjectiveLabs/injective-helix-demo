import { Web3Strategy } from '@injectivelabs/web3-strategy'
import { ChainId } from '@injectivelabs/ts-types'
import { CHAIN_ID } from '~/app/utils/constants'

export const getRpcUrlsForChainIds = (): Record<ChainId, string> => {
  return {
    [ChainId.Ganache]: 'http://localhost:8545',
    [ChainId.HardHat]: 'http://localhost:8545',
    [ChainId.Kovan]: `https://eth-kovan.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`,
    [ChainId.Mainnet]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`,
    [ChainId.Injective]: '',
    [ChainId.Rinkeby]: '',
    [ChainId.Ropsten]: ''
  }
}

export const getRpcWsUrlsForChainIds = (): Record<ChainId, string> => {
  return {
    [ChainId.Ganache]: 'ws://localhost:1318',
    [ChainId.HardHat]: 'ws://localhost:1318',
    [ChainId.Kovan]: `wss://eth-kovan.ws.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KOVAN_KEY}`,
    [ChainId.Mainnet]: `wss://eth-mainnet.ws.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`,
    [ChainId.Injective]: '',
    [ChainId.Rinkeby]: '',
    [ChainId.Ropsten]: ''
  }
}

const rpcUrls = getRpcUrlsForChainIds()
const wsRpcUrls = getRpcWsUrlsForChainIds()

export const web3Strategy = new Web3Strategy({
  chainId: parseInt(CHAIN_ID.toString()),
  options: {
    wsRpcUrl: wsRpcUrls[CHAIN_ID],
    rpcUrl: rpcUrls[CHAIN_ID]
  }
})
