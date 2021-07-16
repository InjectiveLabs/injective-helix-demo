import { TransactionOptions } from '@injectivelabs/ts-types'
import { DEFAULT_GAS_PRICE } from './constants'

const TX_DEFAULTS_GAS = 80_000_000

export const getTransactionOptions = (
  transactionOptions: Partial<TransactionOptions>
): TransactionOptions => {
  return {
    from: transactionOptions.from,
    gas: transactionOptions.gas ? transactionOptions.gas : TX_DEFAULTS_GAS,
    gasPrice: transactionOptions.gasPrice
      ? transactionOptions.gasPrice.toString()
      : DEFAULT_GAS_PRICE.toString()
  }
}
