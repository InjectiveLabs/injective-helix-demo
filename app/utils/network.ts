import { IS_DEVNET, IS_TESTNET } from '@/app/utils/constants'

export const getExplorerUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.explorer.injective.dev'
  }

  if (IS_TESTNET) {
    return 'https://testnet.explorer.injective.network'
  }

  return 'https://explorer.injective.network'
}

export const getBridgeUrl = (): string => {
  if (IS_DEVNET) {
    return 'https://devnet.bridge.injective.dev'
  }

  return 'https://bridge.injective.network'
}
