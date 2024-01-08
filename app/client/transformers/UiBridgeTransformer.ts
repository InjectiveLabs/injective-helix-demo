import {
  TransferType,
  getInjectiveAddress,
  BankMsgSendTransaction
} from '@injectivelabs/sdk-ts'
import {
  BridgingNetwork,
  UiBridgeTransaction,
  UiSubaccountTransfer,
  BridgeTransactionState,
  getBridgeTransactionType
} from '@injectivelabs/sdk-ui-ts'
import { getExplorerUrl } from '@/app/utils/network'

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
      timestamp: Date.parse(transaction.blockTimestamp),
      state: BridgeTransactionState.Completed,
      blockHeight: transaction.blockNumber,
      type: getBridgeTransactionType(
        BridgingNetwork.Injective,
        BridgingNetwork.Injective
      ),
      explorerLink: `${getExplorerUrl()}/transaction/${transaction.hash}/`
    }
  }

  static convertSubaccountTransfersToUiBridgeTransaction(
    transaction: UiSubaccountTransfer
  ): UiBridgeTransaction {
    const isDeposit = transaction.transferType === TransferType.Deposit
    const isInternal = transaction.transferType === TransferType.Internal

    const sender = isDeposit
      ? transaction.srcSubaccountAddress
      : transaction.srcSubaccountId
    const receiver =
      isDeposit || isInternal
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
      timestamp: transaction.executedAt,
      state: BridgeTransactionState.Completed,
      type: getBridgeTransactionType(
        BridgingNetwork.Injective,
        BridgingNetwork.Injective
      ),
      explorerLink: `${getExplorerUrl()}/account/${explorerAccount}/`
    }
  }
}
