import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei } from '@injectivelabs/utils'
import { sharedEllipsisFormatText } from '@shared/utils/formatter'
import {
  DATE_TIME_DISPLAY,
  DEFAULT_TRUNCATE_LENGTH
} from '@/app/utils/constants'
import { HistoryWalletTableColumn } from '@/types'
import type { UiSubaccountTransactionWithToken } from '@/types'

export function useHistoryWalletTransformer(
  transactionList: ComputedRef<UiSubaccountTransactionWithToken[]>
) {
  const { t } = useLang()

  const rows = computed(() => {
    return transactionList.value.map((transaction) => {
      const time = !transaction.timestamp
        ? ''
        : format(transaction.timestamp, DATE_TIME_DISPLAY)

      const transferType =
        transaction.sender.startsWith('0x') &&
        transaction.receiver.startsWith('0x')
          ? t('portfolio.walletHistory.subaccountInternalTransferType')
          : transaction.sender.startsWith('0x')
            ? t('portfolio.walletHistory.subaccountWithdrawalType')
            : t('portfolio.walletHistory.subaccountDepositType')

      const amount = !transaction.amount
        ? ZERO_IN_BASE
        : new BigNumberInWei(transaction.amount).toBase(
            transaction.token.decimals
          )

      return {
        transaction,
        transferType,
        formattedOrigin: sharedEllipsisFormatText(
          transaction.sender,
          DEFAULT_TRUNCATE_LENGTH
        ),
        formattedDestination: sharedEllipsisFormatText(
          transaction.receiver,
          DEFAULT_TRUNCATE_LENGTH
        ),
        [HistoryWalletTableColumn.Time]: time,
        [HistoryWalletTableColumn.Amount]: amount
      }
    })
  })

  return { rows }
}
