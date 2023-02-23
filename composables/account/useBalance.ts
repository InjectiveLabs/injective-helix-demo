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

  const balancesWithToken = computed(() => {
    return tokenStore.tradeableTokens.map((token) => {
      const balance = bankStore.balanceMap[token.denom] || 0

      return {
        balance,
        token,
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
        balance: new BigNumberInBase(aggregatedBalance.balance)
          .plus(balance.balance)
          .toFixed(),
        totalBalance: new BigNumberInBase(aggregatedBalance.totalBalance)
          .plus(balance.totalBalance)
          .toFixed(),
        reservedBalance: new BigNumberInBase(aggregatedBalance.reservedBalance)
          .plus(balance.reservedBalance)
          .toFixed(),
        totalBalanceInUsd: new BigNumberInBase(
          aggregatedBalance.totalBalanceInUsd
        )
          .plus(balance.totalBalanceInUsd)
          .toFixed()
      }
    })
  }

  return {
    balancesWithToken,
    fetchTokenUsdPrice,
    aggregateBalanceByDenoms
  }
}
