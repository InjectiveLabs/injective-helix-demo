import { BankBalances } from '@injectivelabs/sdk-ui-ts'
import { Token } from '@injectivelabs/token-metadata'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { BalanceWithTokenAndUsdPrice } from '@/types'

const getBalanceInToken = (token: Token, balance: string) => {
  return new BigNumberInWei(balance).toBase(token.decimals).toFixed()
}

const getCoinGeckoIdListWithDenomBalanceLargerThenZero = (
  balances: BankBalances,
  tokens: Token[]
) => {
  const denomsWithBalanceLargerThanZero = Object.entries(balances).reduce(
    (list, [denom, balance]) =>
      new BigNumberInBase(balance).gt(0) ? [...list, denom] : list,
    [] as String[]
  )

  const coinGeckoIdList = denomsWithBalanceLargerThanZero
    .map((denom) => tokens.find((token) => token.denom === denom)?.coinGeckoId)
    .filter((coinGeckoId) => coinGeckoId) as string[]

  return coinGeckoIdList
}

export function useBalance() {
  const accountStore = useAccountStore()
  const bankStore = useBankStore()
  const spotStore = useSpotStore()
  const derivativeStore = useDerivativeStore()
  const tokenStore = useTokenStore()

  const tradableDenomMap = computed(() => {
    const tradableSpotDenomMap = spotStore.markets.reduce(
      (list, { baseDenom, quoteDenom }) => {
        return { ...list, [quoteDenom]: '0', [baseDenom]: '0' }
      },
      {} as BankBalances
    )

    const tradableDerivativeDenomMap = derivativeStore.markets.reduce(
      (list, { quoteDenom }) => {
        return { ...list, [quoteDenom]: '0' }
      },
      {} as BankBalances
    )

    return {
      ...tradableDerivativeDenomMap,
      ...tradableSpotDenomMap
    }
  })

  const subaccountBalance = computed<BankBalances>(() => {
    if (!accountStore.subaccount || !accountStore.subaccount.balances) {
      return []
    }

    return accountStore.subaccount.balances.reduce(
      (list, { availableBalance, denom }) => ({
        ...list,
        [denom]: availableBalance
      }),
      {}
    )
  })

  const balances = computed(() => {
    return [
      ...Object.entries(tradableDenomMap.value),
      ...Object.entries(subaccountBalance.value),
      ...Object.entries(bankStore.bankBalances)
    ].reduce((list, [denom, balance]) => {
      const totalBalance = list[denom]
        ? new BigNumberInBase(list[denom]).plus(balance).toFixed()
        : balance

      return { ...list, [denom]: totalBalance }
    }, {} as Record<string, string>)
  })

  const balancesWithToken = computed<BalanceWithTokenAndUsdPrice[]>(() => {
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
          balanceInToken: getBalanceInToken(token, balance)
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
