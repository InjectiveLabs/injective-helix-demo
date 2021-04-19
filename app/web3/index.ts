import { Web3Strategy, Wallet } from '@injectivelabs/web3-strategy'
import { Web3Exception } from '@injectivelabs/exceptions'
import { ChainId } from '@injectivelabs/ts-types'
import { app } from '~/app/singletons/App'
import { localStorage } from '~/app/singletons/Storage'
import { CHAIN_ID, RPC_POLING_INTERVAL } from '~/app/utils/constants'

let web3Strategy: Web3Strategy

export const getRpcUrlsForChainIds = (): Record<ChainId, string> => {
  return {
    [ChainId.Ganache]: 'http://localhost:8545',
    [ChainId.HardHat]: 'http://localhost:8545',
    [ChainId.Kovan]:
      'https://eth-kovan.alchemyapi.io/v2/vSqxSDsS7fSB0VNQfWC1r0yVq5QCTy_n',
    [ChainId.Testnet]: app.appRpcUrl,
    [ChainId.Mainnet]:
      'https://eth-mainnet.alchemyapi.io/v2/DqEv1TiHskO-G6JprqyhE25k1x0p3hpj',
    [ChainId.Rinkeby]: '',
    [ChainId.Ropsten]: ''
  }
}

export const getRpcWsUrlsForChainIds = (): Record<ChainId, string> => {
  return {
    [ChainId.Ganache]: 'ws://localhost:1318',
    [ChainId.HardHat]: 'ws://localhost:1318',
    [ChainId.Kovan]:
      'wss://eth-kovan.ws.alchemyapi.io/v2/vSqxSDsS7fSB0VNQfWC1r0yVq5QCTy_n',
    [ChainId.Testnet]: app.wsRpcUrl,
    [ChainId.Mainnet]:
      'wss://eth-mainnet.ws.alchemyapi.io/v2/DqEv1TiHskO-G6JprqyhE25k1x0p3hpj',
    [ChainId.Rinkeby]: '',
    [ChainId.Ropsten]: ''
  }
}

export const initWeb3Strategy = (wallet: Wallet) => {
  web3Strategy = new Web3Strategy({
    wallet,
    chainId: parseInt(CHAIN_ID.toString()),
    options: {
      wsRpcUrls: getRpcWsUrlsForChainIds(),
      rpcUrls: getRpcUrlsForChainIds(),
      pollingInterval: RPC_POLING_INTERVAL
    }
  })

  web3Strategy.onAccountChange(() => {
    localStorage.clear()
    window.location.reload()
  })

  web3Strategy.onChainChange(() => {
    localStorage.clear()
    window.location.reload()
  })

  return web3Strategy
}

export const getWeb3Strategy = (wallet?: Wallet) => {
  if (!web3Strategy) {
    initWeb3Strategy(wallet || app.wallet)
  }

  return web3Strategy
}

export const transactionReceiptAsync = async (txHash: string): Promise<any> => {
  return await new Promise((resolve, reject) => {
    getWeb3Strategy()
      .getWeb3()
      .eth.getTransactionReceipt(txHash)
      .then((receipt) => {
        if (receipt) {
          resolve(receipt)
        } else {
          reject(new Web3Exception('The transaction failed to be confirmed.'))
        }
      })
  })
}
