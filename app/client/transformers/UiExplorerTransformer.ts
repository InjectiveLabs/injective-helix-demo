import {
  BankMsgSendTransaction,
  GrpcBankMsgSendMessage,
  Transaction
} from '@injectivelabs/sdk-ts'

export class UiExplorerTransformer {
  static transactionMessageToBankMsgSendTransaction(
    tx: Transaction
  ): BankMsgSendTransaction {
    const [message] = (tx.messages || []).map(
      (m) => JSON.parse(m.value) as GrpcBankMsgSendMessage
    )

    return {
      blockNumber: tx.blockNumber,
      blockTimestamp: tx.blockTimestamp,
      hash: tx.hash,
      amount: message.value.amount[0].amount,
      denom: message.value.amount[0].denom,
      sender: message.value.from_address,
      receiver: message.value.to_address
    }
  }
}
