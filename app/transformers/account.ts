import { SubaccountBalance } from '@injectivelabs/subaccount-consumer'
import { getTokenMetaData } from '../services/tokens'
import { tokenMetaToToken } from './token'
import { ZERO_TO_STRING } from '~/app/utils/constants'
import {
  GrpcSubaccountTransfer,
  UiSubaccountBalance,
  UiSubaccountTransfer
} from '~/types'

export const grpcSubaccountBalanceToUiSubaccountBalance = (
  balance: SubaccountBalance
): UiSubaccountBalance => ({
  denom: balance.denom,
  totalBalance: balance.deposit ? balance.deposit.totalBalance : ZERO_TO_STRING,
  availableBalance: balance.deposit
    ? balance.deposit.availableBalance
    : ZERO_TO_STRING
})

export const subaccountHistoryToSubaccountUiHistory = (
  transferList: GrpcSubaccountTransfer[]
): UiSubaccountTransfer[] => {
  return transferList
    .filter((transfer) => transfer.amount)
    .map((transfer) => {
      return {
        ...transfer,
        token: tokenMetaToToken(
          getTokenMetaData(transfer.amount!.denom),
          transfer.amount!.denom
        )
      }
    })
    .filter(
      (transfer) => transfer.token !== undefined
    ) as UiSubaccountTransfer[]
}
