import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithTokenAndUsdPrice } from '@/types'

export const getCoinGeckoIdListWithDenomBalanceLargerThenZero = (
  balances: BalanceWithTokenAndUsdPrice[],
  tokens: Token[]
) => {
  const denomsWithBalanceLargerThanZero = balances
    .filter((balance) => new BigNumberInBase(balance.balanceToBase).gt(0))
    .map((balance) => balance.denom)

  const coinGeckoIdList = denomsWithBalanceLargerThanZero
    .map((denom) => tokens.find((token) => token.denom === denom)?.coinGeckoId)
    .filter((coinGeckoId) => coinGeckoId) as string[]

  return coinGeckoIdList
}

/**
 * For the account page balances, we use all
 * balances that the user has in their bank balance
 */
export function useBalance() {
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()

  const balancesWithToken = computed(() => {
    return tokenStore.tokens
      .map((token) => {
        const bankBalance = bankStore.bankBalances[token.denom] || 0
        const subaccountBalance =
          accountStore.subaccountBalancesAsBankBalances[token.denom] || 0

        const totalBalance = new BigNumberInWei(bankBalance).plus(
          subaccountBalance
        )

        return {
          token,
          denom: token.denom,
          balance: totalBalance.toFixed(),
          usdPrice: tokenStore.tokenUsdPriceMap[token.coinGeckoId] || 0,
          balanceToBase: totalBalance.toBase(token.decimals).toFixed()
        }
      }, [] as BalanceWithTokenAndUsdPrice[])
      .filter((token) => new BigNumberInBase(token.balance).gt(0))
  })

  return {
    balancesWithToken
  }
}
