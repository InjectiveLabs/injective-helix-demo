import { Token } from '@injectivelabs/token-metadata'
import { UiSubaccount } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithToken } from '@/types'

export const getBalanceInToken = (token: Token, balance: string) => {
  return new BigNumberInWei(balance).toBase(token.decimals).toFixed()
}

export const getSubaccountTokenWithBalance = (
  token: Token,
  subaccount?: UiSubaccount
): BalanceWithToken => {
  const defaultBalance = {
    token,
    denom: token.denom,
    balance: '0',
    balanceInToken: '0'
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
    balanceInToken: getBalanceInToken(token, accountBalance.availableBalance)
  }
}
