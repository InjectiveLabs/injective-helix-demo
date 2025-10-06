import { DEFAULT_GAS_PRICE } from '../../utils/constant'
import type { TransactionOptions } from '@injectivelabs/ts-types'

export const TX_DEFAULTS_GAS = 80_000_000
export const ALLOWANCE_DEFAULT_GAS_LIMIT = 45000
export const PEGGY_TRANSFER_DEFAULT_GAS_LIMIT = 100000

export const getTransactionOptions = (
  transactionOptions: Partial<TransactionOptions>
): TransactionOptions => ({
  from: transactionOptions.from,
  gas: transactionOptions.gas ? transactionOptions.gas : TX_DEFAULTS_GAS,
  gasPrice: transactionOptions.gasPrice
    ? transactionOptions.gasPrice.toString()
    : DEFAULT_GAS_PRICE.toString()
})

export const peggyDenomToContractAddress = (denom: string): string =>
  denom.replace('peggy', '')

export const getKeyFromRpcUrl = (rpcUrl: string) => {
  if (!rpcUrl.includes('alchemyapi.io') && !rpcUrl.includes('alchemy.com')) {
    return rpcUrl
  }

  const [key] = rpcUrl.split('/').reverse()

  return key
}
