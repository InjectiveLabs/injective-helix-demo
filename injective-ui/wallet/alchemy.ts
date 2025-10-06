import { EvmChainId } from '@injectivelabs/ts-types'
import {
  IS_DEVNET,
  IS_TESTNET,
  IS_MAINNET,
  ALCHEMY_KEY,
  ALCHEMY_SEPOLIA_KEY
} from './../utils/constant'

export const getRpcUrlsForChainIds = (): Partial<
  Record<EvmChainId, string>
> => {
  return {
    [EvmChainId.Ganache]: 'http://localhost:8545',
    [EvmChainId.HardHat]: 'http://localhost:8545',
    [EvmChainId.Sepolia]: `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_SEPOLIA_KEY}`,
    [EvmChainId.Mainnet]: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`
  }
}

export const alchemyRpcEndpoint =
  IS_TESTNET || IS_DEVNET
    ? `https://eth-sepolia.alchemyapi.io/v2/${ALCHEMY_SEPOLIA_KEY}`
    : `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_KEY}`

export const alchemyKey = (
  IS_MAINNET ? ALCHEMY_KEY : ALCHEMY_SEPOLIA_KEY
) as string
