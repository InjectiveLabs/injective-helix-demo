import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { AccountBalance, BalanceWithTokenAndUsdPrice } from '@/types'

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
    return tokenStore.tradeableTokens.map((token) => {
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
    })
  })

  const fetchTokenUsdPrice = () => {
    const coinGeckoIdList = getCoinGeckoIdListWithDenomBalanceLargerThenZero(
      balancesWithToken.value,
      tokenStore.tokens
    )

    return tokenStore.fetchTokenUsdPriceMap(coinGeckoIdList)
  }

  const aggregateBalanceByDenoms = ({
    balances,
    denoms
  }: {
    balances: AccountBalance[]
    denoms: string[]
  }) => {
    const filteredBalances = balances.filter((balance) =>
      denoms.includes(balance.token.denom.toLowerCase())
    )

    if (!filteredBalances.length) {
      return undefined
    }

    return filteredBalances.reduce((aggregatedBalance, balance) => {
      return {
        ...balance,
        denom: denoms.join('-'),
        balanceToBase: new BigNumberInBase(aggregatedBalance.balanceToBase)
          .plus(balance.balanceToBase)
          .toFixed(),
        totalBalanceInUsd: new BigNumberInBase(
          aggregatedBalance.totalBalanceInUsd
        )
          .plus(balance.totalBalanceInUsd)
          .toFixed(),
        totalBalance: new BigNumberInBase(aggregatedBalance.totalBalance)
          .plus(balance.totalBalance)
          .toFixed(),
        reservedBalance: new BigNumberInBase(aggregatedBalance.reservedBalance)
          .plus(balance.reservedBalance)
          .toFixed(),
        subaccountBalance: new BigNumberInBase(
          aggregatedBalance.subaccountBalance
        )
          .plus(balance.subaccountBalance)
          .toFixed(),
        balance: new BigNumberInBase(aggregatedBalance.balance)
          .plus(balance.balance)
          .toFixed()
      }
    })
  }

  return {
    aggregateBalanceByDenoms,
    fetchTokenUsdPrice,
    balancesWithToken
  }
}
