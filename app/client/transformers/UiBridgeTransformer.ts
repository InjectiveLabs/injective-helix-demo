import {
  BankMsgSendTransaction,
  getInjectiveAddress,
  TransferType
} from '@injectivelabs/sdk-ts'
import {
  BridgeTransactionState,
  getExplorerUrl,
  UiBridgeTransaction,
  UiSubaccountTransfer
} from '@injectivelabs/sdk-ui-ts'
import { NETWORK } from '~/app/utils/constants'

export class UiBridgeTransformer {
  static convertBankMsgSendTransactionToUiBridgeTransaction(
    transaction: BankMsgSendTransaction
  ): UiBridgeTransaction {
    return {
      amount: transaction.amount,
      denom: transaction.denom,
      receiver: transaction.receiver,
      sender: transaction.sender,
      txHash: transaction.hash,
      explorerLink: `${getExplorerUrl(NETWORK)}/transaction/${
        transaction.hash
      }`,
      timestamp: Date.parse(transaction.blockTimestamp),
      state: BridgeTransactionState.Completed,
      blockHeight: transaction.blockNumber
    }
  }

  static convertSubaccountTransfersToUiBridgeTransaction(
    transaction: UiSubaccountTransfer
  ): UiBridgeTransaction {
    const isDeposit = transaction.transferType === TransferType.Deposit

    const sender = isDeposit
      ? transaction.srcSubaccountAddress
      : transaction.srcSubaccountId
    const receiver = isDeposit
      ? transaction.dstSubaccountId
      : transaction.dstSubaccountAddress

    const explorerAccount = isDeposit
      ? getInjectiveAddress(receiver.slice(0, -24))
      : receiver

    return {
      sender,
      receiver,
      amount: transaction.amount,
      denom: transaction.denom,
      txHash: '',
      explorerLink: `${getExplorerUrl(NETWORK)}/account/${explorerAccount}`,
      timestamp: transaction.executedAt,
      state: BridgeTransactionState.Completed
    }
  }
}
