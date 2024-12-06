import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { SharedBalanceWithToken } from '@shared/types'
import { getCw20AddressFromDenom } from '@/app/utils/helpers'
import { verifiedDenoms } from '@/app/json'

export function useEquity() {
  const tokenStore = useTokenStore()
  const accountStore = useAccountStore()
  // const positionStore = usePositionStore()
  // const derivativeStore = useDerivativeStore()

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

  // activeSubaccountBalances => spotBalances
  const spotTotalUsdBalance = computed(() =>
    spotBalances.value.reduce((total, balance) => {
      const tokenUsdPrice = tokenStore.tokenUsdPrice(balance.token)

      return total.plus(
        new BigNumberInBase(balance.balance).times(tokenUsdPrice)
      )
    }, ZERO_IN_BASE)
  )

  const positionTotalMargin = computed(() => {})
  const positionTotalPNL = computed(() => {})

  return {
    spotBalances,
    positionTotalPNL,
    spotTotalUsdBalance,
    positionTotalMargin
  }
}
