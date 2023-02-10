import { Token } from '@injectivelabs/token-metadata'
import { BalanceWithToken, UiSubaccount } from '@injectivelabs/sdk-ui-ts'

export const getSubaccountTokenWithBalance = (
  token: Token,
  subaccount?: UiSubaccount
): BalanceWithToken => {
  const defaultBalance: BalanceWithToken = {
    token,
    denom: token.denom,
    balance: '0'
  }

  if (!subaccount) {
    return defaultBalance
  }

  const accountBalance = subaccount.balances.find(
    ({ denom }) => denom === token.denom
  )

  if (!accountBalance) {
    return defaultBalance
  }

  return {
    ...defaultBalance,
    balance: accountBalance.availableBalance
  }
}
