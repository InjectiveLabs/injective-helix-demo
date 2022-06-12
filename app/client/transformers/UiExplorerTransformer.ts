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
      blockNumber: tx.blockNumber,
      blockTimestamp: tx.blockTimestamp,
      hash: tx.hash,
      amount: message.amount[0].amount,
      denom: message.amount[0].denom,
      sender: message.from_address,
      receiver: message.to_address
    }
  }
}
