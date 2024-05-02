import { SharedUiSpotMarket } from '@shared/types'
import { BigNumberInBase } from '@injectivelabs/utils'
import { usdtToken, injToken } from '@shared/data/token'
import { formatAmountToAllowableAmount } from '@injectivelabs/sdk-ts'
import {
  ONE_IN_BASE,
  MAX_QUOTE_DECIMALS,
  MAX_QUOTE_TENS_MULTIPLIER
} from '@/app/utils/constants/index'
import { SwapForm, SwapFormField, TokenAndPriceAndDecimals } from '@/types'

export function useSwap(formValues: Ref<Partial<SwapForm>>) {
  const swapStore = useSwapStore()
  const spotStore = useSpotStore()
  const tokenStore = useTokenStore()

  const activeRoute = computed(() =>
    swapStore.routes.find((route) =>
      [route.sourceDenom, route.targetDenom].every(
        (denom) =>
          denom === formValues.value[SwapFormField.InputDenom] ||
          denom === formValues.value[SwapFormField.OutputDenom]
      )
    )
  )

  const routeMarkets = computed(() => {
    if (!activeRoute.value) {
      return []
    }

    return activeRoute.value.steps
      .map((routeMarketId) =>
        spotStore.markets.find(({ marketId }) => marketId === routeMarketId)
      )
      .filter((market) => market) as SharedUiSpotMarket[]
  })

  const routeTokensAndDecimals = computed(() => {
    if (!routeMarkets.value) {
      return [] as TokenAndPriceAndDecimals[]
    }

    return routeMarkets.value.reduce(
      (
        tokenWithDecimals,
        {
          baseToken,
          quoteToken,
          quantityDecimals,
          priceTensMultiplier,
          quantityTensMultiplier
        }
      ) => {
        const tokens = [] as TokenAndPriceAndDecimals[]

        const { denom: baseDenom } = baseToken
        const { denom: quoteDenom } = quoteToken

        const baseTokenExistsInRoute = tokenWithDecimals.find(
          ({ token }) => token.denom === baseDenom
        )

        const quoteTokenExistsInRoute = tokenWithDecimals.find(
          ({ token }) => token.denom === quoteDenom
        )

        if (!baseTokenExistsInRoute) {
          tokens.push(...tokenWithDecimals, {
            quantityDecimals,
            token: baseToken,
            denom: baseToken.denom,
            tensMultiplier: quantityTensMultiplier,
            usdPrice: baseToken ? tokenStore.tokenUsdPrice(baseToken) : 0
          })
        }

        if (!quoteTokenExistsInRoute) {
          tokens.push(...tokenWithDecimals, {
            token: quoteToken,
            denom: quoteToken.denom,
            tensMultiplier: priceTensMultiplier,
            quantityDecimals: MAX_QUOTE_DECIMALS,
            usdPrice: quoteToken ? tokenStore.tokenUsdPrice(quoteToken) : 0
          })
        }

        return tokens
      },
      [] as TokenAndPriceAndDecimals[]
    ) as TokenAndPriceAndDecimals[]
  })

  const orderedRouteTokensAndDecimals = computed(() => {
    return formValues.value[SwapFormField.InputDenom] ===
      routeTokensAndDecimals.value[0]?.token.denom
      ? routeTokensAndDecimals.value
      : [...routeTokensAndDecimals.value].reverse()
  })

  const inputToken = computed(() =>
    orderedRouteTokensAndDecimals.value.find(
      ({ denom }) => denom === formValues.value[SwapFormField.InputDenom]
    )
  )

  const outputToken = computed(() =>
    orderedRouteTokensAndDecimals.value.find(
      ({ denom }) => denom === formValues.value[SwapFormField.OutputDenom]
    )
  )

  const minimumOutput = computed(() => {
    const slippageInBigNumber = new BigNumberInBase(
      formValues.value[SwapFormField.Slippage] || 0
    ).div(100)
    const slippageMultiplier = ONE_IN_BASE.minus(slippageInBigNumber)

    return formatAmountToAllowableAmount(
      new BigNumberInBase(formValues.value[SwapFormField.OutputAmount] || 0)
        .times(slippageMultiplier)
        .toFixed(MAX_QUOTE_DECIMALS, BigNumberInBase.ROUND_DOWN),
      outputToken.value?.tensMultiplier ?? MAX_QUOTE_TENS_MULTIPLIER
    )
  })

  const maximumInput = computed(() => {
    const slippageInBigNumber = new BigNumberInBase(
      formValues.value[SwapFormField.Slippage] || 0
    ).div(100)
    const slippageMultiplier = ONE_IN_BASE.plus(slippageInBigNumber)

    return formatAmountToAllowableAmount(
      new BigNumberInBase(formValues.value[SwapFormField.InputAmount] || 0)
        .times(slippageMultiplier)
        .toFixed(MAX_QUOTE_DECIMALS, BigNumberInBase.ROUND_UP),
      inputToken.value?.tensMultiplier ?? MAX_QUOTE_TENS_MULTIPLIER
    )
  })

  const invalidInput = computed(() => {
    const isUserInput = new BigNumberInBase(
      formValues.value[SwapFormField.InputAmount] || ''
    ).gt(0)
    const outputQuantityIsZero = new BigNumberInBase(
      swapStore.outputQuantity.resultQuantity
    ).isZero()
    const outputAmountTooLowFromSlippage =
      new BigNumberInBase(minimumOutput.value).isZero() &&
      new BigNumberInBase(
        formValues.value[SwapFormField.OutputAmount] || ''
      ).gt(0)

    return (
      isUserInput && (outputQuantityIsZero || outputAmountTooLowFromSlippage)
    )
  })

  return {
    invalidInput,
    maximumInput,
    minimumOutput,
    inputToken,
    outputToken,
    orderedRouteTokensAndDecimals
  }
}

export function useSwapHomepage(formValues: Ref<Partial<SwapForm>>) {
  const {
    invalidInput,
    maximumInput,
    minimumOutput,
    inputToken,
    outputToken,
    orderedRouteTokensAndDecimals
  } = useSwap(formValues)

  return {
    invalidInput,
    maximumInput,
    minimumOutput,
    inputToken: computed(
      () =>
        inputToken.value ||
        ({
          token: usdtToken,
          denom: usdtToken.denom,
          usdPrice: 0,
          quantityDecimals: 3
        } as TokenAndPriceAndDecimals)
    ),
    outputToken: computed(
      () =>
        outputToken.value ||
        ({
          token: injToken,
          denom: injToken.denom,
          usdPrice: 0,
          quantityDecimals: 3
        } as TokenAndPriceAndDecimals)
    ),
    orderedRouteTokensAndDecimals
  }
}
