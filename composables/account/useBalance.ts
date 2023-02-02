import { BankBalances } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithTokenAndUsdPrice } from '@/types'

const getCoinGeckoIdListWithDenomBalanceLargerThenZero = (
  balances: BankBalances,
  tokens: Token[]
) => {
  const denomsWithBalanceLargerThanZero = Object.keys(balances).reduce(
    (denoms, denom) => {
      if (new BigNumberInBase(balances[denom]).lte(0)) {
        return denoms
      }

      return [...denoms, denom]
    },
    [] as string[]
  )

  const coinGeckoIdList = denomsWithBalanceLargerThanZero
    .map((denom) => tokens.find((token) => token.denom === denom)?.coinGeckoId)
    .filter((coinGeckoId) => coinGeckoId) as string[]

  return coinGeckoIdList
}

export function useBalance() {
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const tokenStore = useTokenStore()
  const { tradeableDenoms } = useMarketTradeableDenoms()

  const balances = computed(() => {
    return tradeableDenoms.value.reduce((balances, denom) => {
      const bankBalance = bankStore.bankBalances[denom] || 0
      const subaccountBalance =
        accountStore.subaccountBalancesAsBankBalances[denom] || 0

      const totalBalance = new BigNumberInBase(bankBalance).plus(
        subaccountBalance
      )

      return { ...balances, [denom]: totalBalance.toFixed() }
    }, {} as BankBalances)
  })

  const balancesWithToken = computed(() => {
    return Object.entries(balances.value)
      .map(([denom, balance]) => {
        const token = tokenStore.tokens.find((token) => token.denom === denom)

        if (!token) {
          return undefined
        }

        return {
          denom,
          balance,
          token,
          usdPrice: tokenStore.tokenUsdPriceMap[token.coinGeckoId] || '0',
          balanceToBase: new BigNumberInWei(balance)
            .toBase(token.decimals)
            .toFixed()
        }
      })
      .filter(
        (balance) => balance && !balance.denom.startsWith('share')
      ) as BalanceWithTokenAndUsdPrice[]
  })

  const fetchTokensUsdPrice = () => {
    const coinGeckoIdList = getCoinGeckoIdListWithDenomBalanceLargerThenZero(
      balances.value,
      tokenStore.tokens
    )

    return tokenStore.getTokenUsdPriceMap(coinGeckoIdList)
  }

  return { balances, balancesWithToken, fetchTokensUsdPrice }
}
