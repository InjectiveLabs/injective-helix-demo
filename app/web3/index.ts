import {
  Web3Strategy,
  Wallet,
  ConcreteStrategyOptions
} from '@injectivelabs/web3-strategy'
import { ChainId } from '@injectivelabs/ts-types'
import { app } from '~/app/singletons/App'
import { CHAIN_ID } from '~/app/utils/constants'

let web3Strategy: Web3Strategy

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

export const initWeb3Strategy = (
  wallet: Wallet,
  options: Partial<ConcreteStrategyOptions> = {}
) => {
  const RPC_POLING_INTERVAL = 4000

  web3Strategy = new Web3Strategy({
    wallet,
    chainId: parseInt(CHAIN_ID.toString()),
    options: {
      ...options,
      wsRpcUrls: getRpcWsUrlsForChainIds(),
      rpcUrls: getRpcUrlsForChainIds(),
      pollingInterval: RPC_POLING_INTERVAL,
      blockTracker: false
    }
  })

  /*
  web3Strategy.onAccountChange(() => {
    localStorage.clear()
    window.location.reload()
  })

  web3Strategy.onChainChange(() => {
    localStorage.clear()
    window.location.reload()
  }) */

  return web3Strategy
}

export const getWeb3Strategy = (wallet?: Wallet) => {
  if (!web3Strategy) {
    initWeb3Strategy(wallet || app.wallet)
  }

  return web3Strategy
}

export const transactionReceiptAsync = async (txHash: string): Promise<any> => {
  return await getWeb3Strategy().getTransactionReceipt(txHash)
}
