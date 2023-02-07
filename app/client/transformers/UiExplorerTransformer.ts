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
      (m) => m.value as unknown as GrpcBankMsgSendMessage['value']
    )

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      sender: message.from_address,
      receiver: message.to_address,
      denom: message.amount[0].denom,
      amount: message.amount[0].amount,
      blockTimestamp: tx.blockTimestamp
    }
  }
}
