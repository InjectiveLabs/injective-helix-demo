import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase } from '@injectivelabs/utils'
import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
import { AccountBalance } from '@/types'

export const getCoinGeckoIdListWithDenomBalanceLargerThenZero = (
  balances: BalanceWithTokenAndPrice[],
  tokens: Token[]
) => {
  const denomsWithBalanceLargerThanZero = balances
    .filter((balance) => new BigNumberInBase(balance.balance).gt(0))
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
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()

  // TODO - support for multi subaccounts (take available from the subaccount available balance not only from bank)
  const balancesWithToken = computed(() => {
    return tokenStore.tradeableTokens.map((token) => {
      const balance = bankStore.balanceMap[token.denom] || 0

      return {
        token,
        balance,
        denom: token.denom,
        usdPrice: tokenStore.tokenUsdPriceMap[token.coinGeckoId] || 0
      } as BalanceWithTokenAndPrice
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
        bankBalance: new BigNumberInBase(aggregatedBalance.bankBalance)
          .plus(balance.bankBalance)
          .toFixed(),
        availableBalance: new BigNumberInBase(
          aggregatedBalance.availableBalance
        )
          .plus(balance.availableBalance)
          .toFixed(),
        totalBalance: new BigNumberInBase(aggregatedBalance.totalBalance)
          .plus(balance.totalBalance)
          .toFixed(),
        inOrderBalance: new BigNumberInBase(aggregatedBalance.inOrderBalance)
          .plus(balance.inOrderBalance)
          .toFixed(),
        unrealizedPnl: new BigNumberInBase(aggregatedBalance.unrealizedPnl)
          .plus(balance.unrealizedPnl)
          .toFixed(),
        accountTotalBalance: new BigNumberInBase(
          aggregatedBalance.accountTotalBalance
        )
          .plus(balance.accountTotalBalance)
          .toFixed(),
        accountTotalBalanceInUsd: new BigNumberInBase(
          aggregatedBalance.accountTotalBalanceInUsd
        )
          .plus(balance.accountTotalBalanceInUsd)
          .toFixed()
      } as AccountBalance
    })
  }

  return {
    balancesWithToken,
    fetchTokenUsdPrice,
    aggregateBalanceByDenoms
  }
}
