import { SubaccountBalance } from '@injectivelabs/spot-consumer'
import { UiSubaccountBalance } from '~/types'

export const grpcSubaccountBalanceToUiSubaccountBalance = (
  balance: SubaccountBalance
): UiSubaccountBalance => ({
  denom: balance.denom,
  totalBalance: balance.deposit ? balance.deposit.availableBalance : '0',
  availableBalance: balance.deposit ? balance.deposit.totalBalance : '0'
})
