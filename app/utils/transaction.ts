import { TransactionOptions } from '@injectivelabs/ts-types'
import { TX_DEFAULTS } from './constants'

export const getTransactionOptions = (
  transactionOptions: Partial<TransactionOptions>
): TransactionOptions => {
  return {
    from: transactionOptions.from,
    gas: transactionOptions.gas ? transactionOptions.gas : TX_DEFAULTS.gas,
    gasPrice: transactionOptions.gasPrice
      ? transactionOptions.gasPrice.toString()
      : TX_DEFAULTS.gasPrice.toString()
  }
}
