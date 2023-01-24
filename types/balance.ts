import { BankBalanceWithToken } from '@injectivelabs/sdk-ui-ts'

export type BalanceWithToken = BankBalanceWithToken & {
  balanceInToken: string
}
