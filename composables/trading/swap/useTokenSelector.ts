import { Route } from '@injectivelabs/sdk-ts'
import { injToken, usdtToken } from '@shared/data/token'
import { SharedBalanceWithTokenAndPrice } from '@shared/types'
import { useTokenStore } from '../../../store/token'
import { SWAP_LOW_LIQUIDITY_SYMBOLS } from '@/app/data/token'
import { AccountBalance } from '@/types'

export function useSwapTokenSelector({
  balances,
  inputDenom,
  outputDenom
}: {
  inputDenom: Ref<string>
  outputDenom: Ref<string>
  balances: ComputedRef<AccountBalance[]>
}) {
  const swapStore = useSwapStore()
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()

  const tradableTokenMaps = computed(() =>
    swapStore.routes
      .filter(({ steps }) =>
        steps.every((routeMarketId) =>
          spotStore.markets.find(({ marketId }) => routeMarketId === marketId)
        )
      )
      .reduce(
        (tokens, route: Route) => {
          const inputBalance = balances.value.find(
            ({ denom }) => denom === route.sourceDenom
          )
          const inputToken = tokenStore.tokenByDenomOrSymbol(route.sourceDenom)

          const inputTokenWithBalance = {
            token: inputToken,
            denom: route.sourceDenom,
            balance: inputBalance?.availableBalance || '0',
            usdPrice: tokenStore.tokenUsdPrice(inputToken)
          }

          const outputBalance = balances.value.find(
            ({ denom }) => denom === route.targetDenom
          )
          const outputToken = tokenStore.tokenByDenomOrSymbol(route.targetDenom)

          const outputTokenWithBalance = {
            token: outputToken,
            denom: route.targetDenom,
            balance: outputBalance?.availableBalance || '0',
            usdPrice: tokenStore.tokenUsdPrice(inputToken)
          }

          if (!inputTokenWithBalance.token || !outputTokenWithBalance.token) {
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
        {} as Record<string, SharedBalanceWithTokenAndPrice[]>
      )
  )

  const inputDenomOptions = computed(() => {
    if (!tradableTokenMaps.value) {
      return []
    }

    return (
      Object.keys(tradableTokenMaps.value)
        .map((denom) => {
          const balance = balances.value.find(
            (balance) => balance.denom === denom
          )
          const token = tokenStore.tokenByDenomOrSymbol(denom)

          return {
            token,
            denom,
            balance: balance?.availableBalance || '0',
            usdPrice: tokenStore.tokenUsdPrice(token)
          }
        })
        .filter(
          (balanceWithToken) =>
            balanceWithToken && balanceWithToken.denom !== outputDenom.value
        ) as SharedBalanceWithTokenAndPrice[]
    ).sort(
      (
        b1: SharedBalanceWithTokenAndPrice,
        b2: SharedBalanceWithTokenAndPrice
      ) => {
        if (b1.token.symbol === usdtToken.symbol) {
          return -1
        }

        if (b2.token.symbol === usdtToken.symbol) {
          return 1
        }

        return b1.token.symbol.localeCompare(b2.token.symbol)
      }
    )
  })

  const outputDenomOptions = computed(() => {
    if (!tradableTokenMaps.value[inputDenom.value]) {
      return []
    }

    return tradableTokenMaps.value[inputDenom.value].sort(
      (
        b1: SharedBalanceWithTokenAndPrice,
        b2: SharedBalanceWithTokenAndPrice
      ) => {
        if (b1.token.symbol === injToken.symbol) {
          return -1
        }

        if (b2.token.symbol === injToken.symbol) {
          return 1
        }

        return b1.token.symbol.localeCompare(b2.token.symbol)
      }
    )
  })

  /**
   * Token selector output denom must be tradable to the input denom
   * So we either keep the currently selected output denom or update to a default one
   **/
  const selectorOutputDenom = computed(() => {
    const hasRouteToUsdt = tradableTokenMaps.value[inputDenom.value]?.find(
      ({ denom }) => denom === usdtToken.denom
    )

    if (hasRouteToUsdt) {
      return usdtToken.denom
    }

    const selectedOutputDenom = tradableTokenMaps.value[inputDenom.value].find(
      (token: SharedBalanceWithTokenAndPrice) =>
        token.denom === outputDenom.value
    )?.denom

    const defaultOutputDenom =
      tradableTokenMaps.value[inputDenom.value][0]?.denom

    return selectedOutputDenom || defaultOutputDenom
  })

  /**
   * Token selector input denom must be tradable to the output denom
   * So we either keep the currently selected input denom or update to a default one
   **/
  const selectorInputDenom = computed(() => {
    const selectedInputDenom = tradableTokenMaps.value[outputDenom.value]?.find(
      (token: SharedBalanceWithTokenAndPrice) =>
        token.denom === inputDenom.value
    )?.denom

    if (!tradableTokenMaps.value[outputDenom.value]) {
      return injToken.denom
    }

    const defaultInputDenom =
      tradableTokenMaps.value[outputDenom.value][0]?.denom

    return selectedInputDenom || defaultInputDenom || injToken.denom
  })

  return {
    inputDenomOptions,
    outputDenomOptions,
    selectorInputDenom,
    selectorOutputDenom
  }
}
