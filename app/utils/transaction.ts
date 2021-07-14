import { TransactionOptions } from '@injectivelabs/ts-types'
import { DEFAULT_GAS_PRICE } from './constants'

export const getTransactionOptions = (
  transactionOptions: Partial<TransactionOptions>
): TransactionOptions => {
  return {
    from: transactionOptions.from,
    gasPrice: transactionOptions.gasPrice
      ? transactionOptions.gasPrice.toString()
      : DEFAULT_GAS_PRICE.toString()
  }
}
