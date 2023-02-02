import { Token } from '@injectivelabs/token-metadata'
import { UiSubaccount } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithToken } from '@/types'

export const getSubaccountTokenWithBalance = (
  token: Token,
  subaccount?: UiSubaccount
): BalanceWithToken => {
  const defaultBalance = {
    token,
    denom: token.denom,
    balance: '0',
    balanceToBase: '0'
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
    balance: accountBalance.availableBalance,
    balanceToBase: new BigNumberInWei(accountBalance.availableBalance)
      .toBase(token.decimals)
      .toFixed()
  }
}
