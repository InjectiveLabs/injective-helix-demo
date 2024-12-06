import { usdtToken } from '@shared/data/token'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedBalanceWithToken } from '@shared/types'
import { TradeDirection } from '@injectivelabs/ts-types'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'
import { verifiedDenoms } from '@/app/json'

export function useEquity() {
  const tokenStore = useTokenStore()
  const accountStore = useAccountStore()
  const positionStore = usePositionStore()
  const derivativeStore = useDerivativeStore()

  const spotBalances = computed(() => {
    const activeSubaccountBalances =
      accountStore.subaccountBalancesMap[accountStore.subaccountId]

    return activeSubaccountBalances.reduce((list, balance) => {
      if (!verifiedDenoms.includes(balance.denom)) {
        return list
      }

      const token = tokenStore.tokenByDenomOrSymbol(balance.denom)

      if (!token) {
        return list
      }

      const cw20Address = getCw20AddressFromDenom(token.denom)
      const cw20Balance = accountStore.cw20BalancesMap[cw20Address] || '0'

      const totalBalance = new BigNumberInBase(balance.totalBalance)
        .plus(cw20Balance)
        .toFixed()

      return [
        ...list,
        {
          token,
          denom: balance.denom,
          balance: totalBalance
        }
      ]
    }, [] as SharedBalanceWithToken[])
  })

  const positionTotalMargin = computed(() => {})

  const positionTotalPNL = computed(() => {
    return positionStore.positions.reduce((sum, position) => {
      const market = derivativeStore.markets.find(
        (m) => m.marketId === position.marketId
      )

      if (!market) {
        return sum
      }

      const markPrice = derivativeStore.marketMarkPriceMap[market.marketId]
        .price
        ? new BigNumberInBase(
            derivativeStore.marketMarkPriceMap[market.marketId].price
          )
        : sharedToBalanceInTokenInBase({
            value: position.markPrice,
            decimalPlaces: market.quoteToken.decimals
          })

      const price = sharedToBalanceInTokenInBase({
        value: position.entryPrice,
        decimalPlaces: market.quoteToken.decimals
      })

      const pnl = new BigNumberInBase(position.quantity)
        .times(markPrice.minus(price))
        .times(position.direction === TradeDirection.Long ? 1 : -1)

      return sum.plus(pnl)
    }, ZERO_IN_BASE)
  })

  const spotTotalUsdBalance = computed(() =>
    spotBalances.value.reduce((total, balance) => {
      const tokenUsdPrice = tokenStore.tokenUsdPrice(balance.token)

      return total.plus(
        new BigNumberInBase(balance.balance).times(tokenUsdPrice)
      )
    }, ZERO_IN_BASE)
  )

  const positionTotalPNLUsd = computed(() =>
    positionTotalPNL.value.times(tokenStore.tokenUsdPrice(usdtToken))
  )

  return {
    spotBalances,
    positionTotalPNL,
    spotTotalUsdBalance,
    positionTotalMargin,
    positionTotalPNLUsd
  }
}
