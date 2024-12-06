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

      const bankBalance = accountStore.isDefaultSubaccount
        ? accountStore.balancesMap[balance.denom]
        : '0'

      const totalBalance = new BigNumberInBase(balance.totalBalance)
        .plus(bankBalance)
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

  const spotTotalBalanceInUsd = computed(() =>
    spotBalances.value.reduce((total, balance) => {
      const tokenUsdPrice = tokenStore.tokenUsdPrice(balance.token)

      const formattedBalance = sharedToBalanceInTokenInBase({
        value: balance.balance,
        decimalPlaces: balance.token.decimals
      })

      return total.plus(
        new BigNumberInBase(formattedBalance).times(tokenUsdPrice)
      )
    }, ZERO_IN_BASE)
  )

  const positionTotalMarginInUsd = computed(() =>
    positionStore.subaccountPositions.reduce((total, position) => {
      if (
        !derivativeStore.markets.find(
          ({ marketId }) => marketId === position.marketId
        )
      ) {
        return total
      }

      const quoteToken =
        tokenStore.tokenByDenomOrSymbol(position.denom) || usdtToken

      const formattedPosition = sharedToBalanceInTokenInBase({
        value: position.margin,
        decimalPlaces: quoteToken.decimals
      })

      return new BigNumberInBase(total)
        .plus(
          new BigNumberInBase(formattedPosition).times(
            tokenStore.tokenUsdPrice(quoteToken)
          )
        )
        .toFixed()
    }, '0')
  )

  const positionTotalPNLInUsd = computed(() =>
    positionStore.subaccountPositions.reduce((sum, position) => {
      if (
        !derivativeStore.markets.find(
          ({ marketId }) => marketId === position.marketId
        )
      ) {
        return sum
      }

      const quoteToken =
        tokenStore.tokenByDenomOrSymbol(position.denom) || usdtToken
      const markPrice = derivativeStore.marketMarkPriceMap[position.marketId]
        .price
        ? new BigNumberInBase(
            derivativeStore.marketMarkPriceMap[position.marketId].price
          )
        : sharedToBalanceInTokenInBase({
            value: position.markPrice,
            decimalPlaces: quoteToken.decimals
          })

      const price = sharedToBalanceInTokenInBase({
        value: position.entryPrice,
        decimalPlaces: quoteToken.decimals
      })

      const pnl = new BigNumberInBase(position.quantity)
        .times(markPrice.minus(price))
        .times(position.direction === TradeDirection.Long ? 1 : -1)

      const pnlInUsd = pnl.times(tokenStore.tokenUsdPrice(quoteToken))

      return sum.plus(pnlInUsd)
    }, ZERO_IN_BASE)
  )

  const perpBalancesInUsd = computed(() =>
    positionTotalPNLInUsd.value.plus(positionTotalMarginInUsd.value).toFixed()
  )

  return {
    spotBalances,
    perpBalancesInUsd,
    spotTotalBalanceInUsd,
    positionTotalPNLInUsd
  }
}
