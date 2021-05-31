import { SubaccountBalance } from '@injectivelabs/subaccount-consumer'
import { ZERO_TO_STRING } from '~/app/utils/constants'
import { UiSubaccountBalance } from '~/types'

export const grpcSubaccountBalanceToUiSubaccountBalance = (
  balance: SubaccountBalance
): UiSubaccountBalance => ({
  denom: balance.denom,
  totalBalance: balance.deposit ? balance.deposit.totalBalance : ZERO_TO_STRING,
  availableBalance: balance.deposit
    ? balance.deposit.availableBalance
    : ZERO_TO_STRING
})
