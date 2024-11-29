import { format } from 'date-fns'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInWei, formatWalletAddress } from '@injectivelabs/utils'
import { DATE_TIME_DISPLAY } from '@/app/utils/constants'
import {
  HistoryWalletTableColumn,
  UiSubaccountTransactionWithToken
} from '@/types'

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
          ? t('walletHistory.subaccountInternalTransferType')
          : transaction.sender.startsWith('0x')
          ? t('walletHistory.subaccountWithdrawalType')
          : t('walletHistory.subaccountDepositType')

      const amount = !transaction.amount
        ? ZERO_IN_BASE
        : new BigNumberInWei(transaction.amount).toBase(
            transaction.token.decimals
          )

      return {
        transaction,
        transferType,
        formattedOrigin: formatWalletAddress(transaction.sender),
        formattedDestination: formatWalletAddress(transaction.receiver),
        [HistoryWalletTableColumn.Time]: time,
        [HistoryWalletTableColumn.Amount]: amount
      }
    })
  })

  return { rows }
}
