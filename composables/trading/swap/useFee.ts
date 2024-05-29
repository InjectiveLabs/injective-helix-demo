import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase, BigNumberInWei } from '@injectivelabs/utils'
import { MAX_QUOTE_DECIMALS } from '@/app/utils/constants'
import { SwapForm } from '@/types'

export function useSwapFee(formValues: Ref<Partial<SwapForm>>) {
  const swapStore = useSwapStore()
  const { orderedRouteTokensAndDecimals } = useSwap(formValues)

  const fees = computed(
    () =>
      swapStore.outputQuantity.expectedFees ||
      swapStore.inputQuantity.expectedFees ||
      []
  )

  const swapRoutesFees = computed(() => {
    if (fees.value.length === 0) {
      return []
    }

    const routeSymbols = orderedRouteTokensAndDecimals.value.reduce(
      (routeSymbols, { token }, index, tokens) => {
        if (index === tokens.length - 1) {
          return [...routeSymbols]
        }

        return [
          ...routeSymbols,
          [{ from: token.symbol, to: tokens[index + 1].token.symbol }]
        ]
      },
      [] as { from: string; to: string }[][]
    )

    return routeSymbols.map((symbols, index) => {
      const fee = fees.value[index]
      const token = orderedRouteTokensAndDecimals.value.find(
        ({ token }) => token.denom === fee.denom
      )

      const amountFormatted = new BigNumberInWei(fee.amount).toBase(
        token?.token.decimals || 0
      )

      return {
        symbols,
        usdAmount: amountFormatted
          .times(token?.usdPrice || 0)
          .toFixed(MAX_QUOTE_DECIMALS)
      }
    })
  })

  const totalFee = computed<BigNumberInBase>(() => {
    if (swapRoutesFees.value.length === 0) {
      return ZERO_IN_BASE
    }

    return swapRoutesFees.value.reduce(
      (total, { usdAmount }) => total.plus(usdAmount),
      new BigNumberInBase(0)
    )
  })

  return { swapRoutesFees, totalFee }
}
