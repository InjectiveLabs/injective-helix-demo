import {
  TransferType,
  getInjectiveAddress,
  SubaccountTransfer
} from '@injectivelabs/sdk-ts'
import { getUnknownTokenWithSymbol } from '@injectivelabs/token-metadata'
import { getExplorerUrl } from '@/app/utils/network'
import { UiSubaccountTransactionWithToken } from '@/types'
import { denomClient } from '@/app/Services'

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

    const token = await denomClient.getDenomToken(
      transaction?.amount?.denom || ''
    )

    return {
      sender,
      receiver,
      amount: transaction?.amount?.amount || '',
      denom: transaction?.amount?.denom || '',
      timestamp: transaction.executedAt,
      token:
        token || getUnknownTokenWithSymbol(transaction?.amount?.denom || ''),
      explorerLink: `${getExplorerUrl()}/account/${explorerAccount}/`
    }
  }
}
