import {
  TransferType,
  SubaccountTransfer,
  getInjectiveAddress
} from '@injectivelabs/sdk-ts'
import { unknownToken } from '@shared/data/token'
import { sharedGetToken } from '@shared/utils/helper'
import { getExplorerUrl } from '@shared/utils/network'
import { UiSubaccountTransactionWithToken } from '@/types'

export class UiSubaccountTransformer {
  static async convertSubaccountTransfersToUiSubaccountTransaction(
    transaction: SubaccountTransfer
  ): Promise<UiSubaccountTransactionWithToken> {
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
      amount: transaction?.amount?.amount || '',
      denom: transaction?.amount?.denom || '',
      timestamp: transaction.executedAt,
      token:
        (await sharedGetToken(transaction?.amount?.denom || '')) ||
        unknownToken,
      explorerLink: `${getExplorerUrl()}/account/${explorerAccount}/`
    }
  }
}
