import { WalletStrategy } from '@injectivelabs/wallet-ts'
import {
  CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  IS_DEVNET,
  IS_TESTNET
} from '~/app/utils/constants'

export const alchemyRpcEndpoint =
  IS_TESTNET || IS_DEVNET
    ? `https://eth-goerli.alchemyapi.io/v2/${process.env.APP_ALCHEMY_GOERLI_KEY}`
    : `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`

const rpcUrl =
  IS_TESTNET || IS_DEVNET
    ? `https://eth-goerli.alchemyapi.io/v2/${process.env.APP_ALCHEMY_GOERLI_KEY}`
    : `https://eth-mainnet.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`

const wsRpcUrl =
  IS_TESTNET || IS_DEVNET
    ? `wss://eth-goerli.ws.alchemyapi.io/v2/${process.env.APP_ALCHEMY_GOERLI_KEY}`
    : `https://eth-mainnet.ws.alchemyapi.io/v2/${process.env.APP_ALCHEMY_KEY}`

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    rpcUrl,
    wsRpcUrl,
    ethereumChainId: ETHEREUM_CHAIN_ID
  }
})
