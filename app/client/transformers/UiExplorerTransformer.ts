import {
  BankMsgSendTransaction,
  GrpcBankMsgSendMessage,
  Transaction
} from '@injectivelabs/sdk-ts'

export class UiExplorerTransformer {
  static transactionMessageToBankMsgSendTransaction(
    tx: Transaction
  ): BankMsgSendTransaction {
    const messages = (tx.messages || []).map(
      (m) => m.value as unknown as GrpcBankMsgSendMessage['value']
    )

    const message = messages.find((msg) => msg.amount)

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      sender: message ? message.from_address : '',
      receiver: message ? message.to_address : '',
      denom: message ? message.amount[0].denom : '',
      amount: message ? message.amount[0].amount : '',
      blockTimestamp: tx.blockTimestamp
    }
  }
}
