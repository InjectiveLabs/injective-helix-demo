import type { Ref } from 'vue'
import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
import { Route } from '@injectivelabs/sdk-ts'
import { INJ_DENOM } from '@injectivelabs/utils'
import { AccountBalance } from '@/types'
import { SWAP_LOW_LIQUIDITY_SYMBOLS, usdtToken } from '@/app/data/token'

const getBalanceWithToken = (
  swapDenom: string,
  balances: AccountBalance[]
): BalanceWithTokenAndPrice | undefined => {
  const balanceWithToken = balances.find(({ denom }) => denom === swapDenom)

  if (!balanceWithToken) {
    return
  }

  return {
    token: balanceWithToken?.token,
    denom: balanceWithToken?.denom,
    balance: balanceWithToken?.availableMargin,
    usdPrice: balanceWithToken?.usdPrice
  } as BalanceWithTokenAndPrice
}

export function useSwapTokenSelector({
  balances,
  inputDenom,
  outputDenom
}: {
  balances: Ref<AccountBalance[]>
  inputDenom: Ref<string>
  outputDenom: Ref<string>
}) {
  const swapStore = useSwapStore()

  const tradableTokenMaps = computed(() =>
    swapStore.routes.reduce(
      (tokens, route: Route) => {
        const inputTokenWithBalance = getBalanceWithToken(
          route.sourceDenom,
          balances.value
        )

        const outputTokenWithBalance = getBalanceWithToken(
          route.targetDenom,
          balances.value
        )

        if (!inputTokenWithBalance || !outputTokenWithBalance) {
          return tokens
        }

        /** Filter out illiquid markets */
        if (
          SWAP_LOW_LIQUIDITY_SYMBOLS.includes(
            inputTokenWithBalance?.token.symbol.toUpperCase()
          ) ||
          SWAP_LOW_LIQUIDITY_SYMBOLS.includes(
            outputTokenWithBalance?.token.symbol.toUpperCase()
          )
        ) {
          return tokens
        }

        const inputTokens = tokens[route.targetDenom]
          ? [...tokens[route.targetDenom], inputTokenWithBalance]
          : [inputTokenWithBalance]

        const outputTokens = tokens[route.sourceDenom]
          ? [...tokens[route.sourceDenom], outputTokenWithBalance]
          : [outputTokenWithBalance]

        return {
          ...tokens,
          [route.targetDenom]: inputTokens,
          [route.sourceDenom]: outputTokens
        }
      },
      {} as Record<string, BalanceWithTokenAndPrice[]>
    )
  )

  const inputDenomOptions = computed(
    () =>
      Object.keys(tradableTokenMaps.value).map((denom) => {
        const tokenWithBalance = getBalanceWithToken(denom, balances.value)

        return tokenWithBalance
      }) as BalanceWithTokenAndPrice[]
  )

  const outputDenomOptions = computed(
    () => tradableTokenMaps.value[inputDenom.value]
  )

  /**
   * Token selector output denom must be tradable to the input denom
   * So we either keep the currently selected output denom or update to a default one
   **/
  const selectorOutputDenom = computed(() => {
    const selectedOutputDenom = tradableTokenMaps.value[inputDenom.value].find(
      (token: BalanceWithTokenAndPrice) => token.denom === outputDenom.value
    )?.denom

    if (tradableTokenMaps.value[inputDenom.value]) {
      return usdtToken.denom
    }

    const defaultOutputDenom =
      tradableTokenMaps.value[inputDenom.value][0]?.denom

    return selectedOutputDenom || defaultOutputDenom || usdtToken.denom
  })

  /**
   * Token selector input denom must be tradable to the output denom
   * So we either keep the currently selected input denom or update to a default one
   **/
  const selectorInputDenom = computed(() => {
    const selectedInputDenom = tradableTokenMaps.value[outputDenom.value]?.find(
      (token: BalanceWithTokenAndPrice) => token.denom === inputDenom.value
    )?.denom

    if (!tradableTokenMaps.value[outputDenom.value]) {
      return INJ_DENOM
    }

    const defaultInputDenom =
      tradableTokenMaps.value[outputDenom.value][0]?.denom

    return selectedInputDenom || defaultInputDenom || INJ_DENOM
  })

  return {
    selectorOutputDenom,
    selectorInputDenom,
    inputDenomOptions,
    outputDenomOptions
  }
}
