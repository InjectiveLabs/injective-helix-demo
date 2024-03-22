import { Wallet, WalletStrategy } from '@injectivelabs/wallet-ts'
import {
  ALCHEMY_SEPOLIA_KEY,
  ALCHEMY_KEY,
  CHAIN_ID,
  ETHEREUM_CHAIN_ID,
  IS_DEVNET,
  IS_TESTNET
} from '@/app/utils/constants'

export const alchemyRpcEndpoint =
  IS_TESTNET || IS_DEVNET
    ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_SEPOLIA_KEY}`
    : `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
export const alchemyKey = (
  IS_TESTNET || IS_DEVNET ? ALCHEMY_SEPOLIA_KEY : ALCHEMY_KEY
) as string

export const walletStrategy = new WalletStrategy({
  chainId: CHAIN_ID,
  ethereumOptions: {
    ethereumChainId: ETHEREUM_CHAIN_ID,
    rpcUrl: alchemyRpcEndpoint
  },
  disabledWallets: [Wallet.WalletConnect, Wallet.CosmostationEth]
})
