import {
  BankMsgSendTransaction,
  GrpcBankMsgSendMessage
} from '@injectivelabs/explorer-consumer'
import { TransactionFromExplorerApiResponse } from './types'

export const transactionMessageToBankMsgSendTransaction = (
  tx: TransactionFromExplorerApiResponse
): BankMsgSendTransaction => {
  const [message] = tx.messages as GrpcBankMsgSendMessage[]

  return {
    blockNumber: tx.block_number,
    blockTimestamp: tx.block_timestamp,
    hash: tx.hash,
    amount: message.value.amount[0].amount,
    denom: message.value.amount[0].denom,
    sender: message.value.from_address,
    receiver: message.value.to_address
  }
}

export class ExplorerTransformer {
  static transactionMessageToBankMsgSendTransaction = transactionMessageToBankMsgSendTransaction
}
