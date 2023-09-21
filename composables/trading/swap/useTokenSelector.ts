import type { Ref } from 'vue'
import { BalanceWithTokenAndPrice } from '@injectivelabs/sdk-ui-ts'
import { Route } from '@injectivelabs/sdk-ts'
import { AccountBalance } from '@/types'

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
   * So we either keep the curently selected output denom or update to a default one
   **/
  const selectorOutputDenom = computed(() => {
    const selectedOutputDenom = tradableTokenMaps.value[inputDenom.value].find(
      (token: BalanceWithTokenAndPrice) => token.denom === outputDenom.value
    )?.denom
    const defaultOutputDenom =
      tradableTokenMaps.value[inputDenom.value][0].denom

    return selectedOutputDenom || defaultOutputDenom
  })

  /**
   * Token selector input denom must be tradable to the output denom
   * So we either keep the currently selected input denom or update to a default one
   **/
  const selectorInputDenom = computed(() => {
    const selectedInputDenom = tradableTokenMaps.value[outputDenom.value]?.find(
      (token: BalanceWithTokenAndPrice) => token.denom === inputDenom.value
    )?.denom
    const defaultInputDenom =
      tradableTokenMaps.value[outputDenom.value][0].denom

    return selectedInputDenom || defaultInputDenom
  })

  return {
    selectorOutputDenom,
    selectorInputDenom,
    inputDenomOptions,
    outputDenomOptions
  }
}
