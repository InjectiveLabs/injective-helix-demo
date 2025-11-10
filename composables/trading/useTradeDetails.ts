import { SharedMarketType } from '@shared/types'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { safeAmount, quantizeNumber } from '@/app/utils/helpers'
import {
  calculateNotional,
  calculateFeeAmount,
  calculateSlippagePrice,
  calculateMinimumNotional,
  calculateEstimatedSlippage,
  calculateNotionalBeforeFee,
  calculateQuantityFromNotional
} from '@/app/utils/trading/calculations'
import {
  WorkerMessageType,
  OrderbookWorkerKey,
  WorkerMessageResponseType
} from '@/types'
import type {
  TradeDetails,
  UiMarketWithToken,
  OrderbookWorkerType,
  OrderbookWorkerResult,
  ReceiveQuantityInfoType,
  ReceiveNotionalInfoType
} from '@/types'

export function useTradeDetails({
  isBuy,
  market,
  leverage,
  limitPrice,
  isPostOnly,
  isLimitOrder,
  takerFeeRate,
  triggerPrice,
  isTriggerOrder,
  slippagePercentage
}: {
  isBuy: ComputedRef<boolean>
  leverage?: ComputedRef<string>
  limitPrice: ComputedRef<string>
  isPostOnly: ComputedRef<boolean>
  isLimitOrder: ComputedRef<boolean>
  triggerPrice?: ComputedRef<string>
  isTriggerOrder?: ComputedRef<boolean>
  market: ComputedRef<UiMarketWithToken>
  slippagePercentage: ComputedRef<string>
  takerFeeRate: ComputedRef<BigNumberInBase>
}): TradeDetails {
  const worker = inject(
    OrderbookWorkerKey
  ) as unknown as Ref<OrderbookWorkerType>

  const isSpot = computed(() => market.value.type === SharedMarketType.Spot)

  const quantity = ref('0')
  const notional = ref('0')

  const enoughLiquidity = ref(false)
  const bestPrice = ref(ZERO_IN_BASE)
  const worstPrice = ref(ZERO_IN_BASE)
  const averagePrice = ref(ZERO_IN_BASE)
  const calculatedNotional = ref(ZERO_IN_BASE)

  function updatePricesFromWorkerData(
    data: ReceiveQuantityInfoType['data'] | ReceiveNotionalInfoType['data']
  ) {
    enoughLiquidity.value = data.enoughLiquidity
    bestPrice.value = new BigNumberInBase(data.bestPrice)
    worstPrice.value = new BigNumberInBase(data.worstPrice)
    averagePrice.value = new BigNumberInBase(data.averagePrice)

    calculatedNotional.value = calculateNotional({
      price: new BigNumberInBase(worstPrice.value),
      quantity: new BigNumberInBase(safeAmount(quantity.value))
    })
  }

  function setPricesForLimitOrTriggerOrder() {
    if (isLimitOrder.value) {
      const limitPriceInBase = new BigNumberInBase(safeAmount(limitPrice.value))

      bestPrice.value = limitPriceInBase
      worstPrice.value = limitPriceInBase
      averagePrice.value = limitPriceInBase
    } else if (isTriggerOrder?.value) {
      const triggerPriceInBase = new BigNumberInBase(
        safeAmount(triggerPrice?.value)
      )

      // with Stop-Market, we don't know what the exact price will be,
      // so we use the trigger price as the best price
      bestPrice.value = triggerPriceInBase
      worstPrice.value = slippagePrice.value
      averagePrice.value = slippagePrice.value
    }
  }

  const _quantity = computed({
    get: () => quantity.value,
    set: (value) => {
      quantity.value = value

      const quantityInBase = new BigNumberInBase(safeAmount(value))

      if (isLimitOrder.value || isTriggerOrder?.value) {
        setPricesForLimitOrTriggerOrder()

        calculatedNotional.value = calculateNotional({
          quantity: quantityInBase,
          price: worstPrice.value as BigNumberInBase
        })
        notional.value = notionalWithFee.value.toFixed()
        enoughLiquidity.value = true

        return
      }

      worker.value?.postMessage({
        type: WorkerMessageType.Quantity,
        data: {
          isBuy: isBuy.value,
          isSpot: isSpot.value,
          quantity: quantityInBase.toFixed(),
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals
        }
      })
    }
  })

  const _notional = computed({
    get: () => notional.value,
    set: (value) => {
      notional.value = value

      const notionalInBase = new BigNumberInBase(safeAmount(value))

      const notionalMinusFee = calculateNotionalBeforeFee({
        feeRate: feeRate.value,
        notional: notionalInBase
      })

      if (isLimitOrder.value || isTriggerOrder?.value) {
        setPricesForLimitOrTriggerOrder()

        const calculatedQuantity = calculateQuantityFromNotional({
          notional: notionalMinusFee,
          price: worstPrice.value as BigNumberInBase
        })
        const calculatedQuantityQuantized = quantizeNumber(
          calculatedQuantity,
          market.value.quantityTensMultiplier
        )
        quantity.value = calculatedQuantityQuantized.toFixed()

        calculatedNotional.value = calculateNotional({
          price: worstPrice.value as BigNumberInBase,
          quantity: calculatedQuantityQuantized
        })
        enoughLiquidity.value = true

        return
      }

      worker.value?.postMessage({
        type: WorkerMessageType.Notional,
        data: {
          isBuy: isBuy.value,
          isSpot: isSpot.value,
          notional: notionalMinusFee.toFixed(),
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals
        }
      })
    }
  })

  const slippageTolerance = computed(() =>
    new BigNumberInBase(safeAmount(slippagePercentage.value)).div(100)
  )

  const slippagePrice = computed(() =>
    calculateSlippagePrice({
      isBuy: isBuy.value,
      slippageTolerance: slippageTolerance.value,
      price: new BigNumberInBase(bestPrice.value)
    })
  )

  const estSlippagePercentage = computed(() =>
    calculateEstimatedSlippage({
      isBuy: isBuy.value,
      bestPrice: bestPrice.value as BigNumberInBase,
      worstPrice: worstPrice.value as BigNumberInBase
    })
  )

  const feeRate = computed(() => {
    if (isLimitOrder.value && isPostOnly.value) {
      return ZERO_IN_BASE
    }

    return takerFeeRate.value
  })

  const feeAmount = computed(() =>
    calculateFeeAmount({
      feeRate: feeRate.value,
      value: calculatedNotional.value as BigNumberInBase
    })
  )

  const notionalWithFee = computed(() =>
    calculatedNotional.value.plus(feeAmount.value)
  )

  const hasSlippageWarning = computed(() =>
    estSlippagePercentage.value.gt(slippagePercentage.value)
  )

  const margin = computed(() => {
    const leverageInBase = new BigNumberInBase(safeAmount(leverage?.value))

    if (isSpot.value || leverageInBase.isZero()) {
      return ZERO_IN_BASE
    }

    return quantizeNumber(
      new BigNumberInBase(calculatedNotional.value).div(leverageInBase),
      -market.value.quoteToken.decimals
    )
  })

  const marginWithFee = computed(() => margin.value.plus(feeAmount.value))

  const executionPrice = computed(() => {
    const price = isLimitOrder.value
      ? new BigNumberInBase(limitPrice.value)
      : slippagePrice.value

    return quantizeNumber(price, market.value.priceTensMultiplier)
  })

  const minimumAmountInQuote = computed(() => {
    const calculatedMinimumNotional = calculateMinimumNotional({
      price: executionPrice.value,
      priceDecimals: market.value.priceDecimals,
      quantityTensMultiplier: market.value.quantityTensMultiplier
    })

    const fixedMarketMinimumNotional = new BigNumberInBase(
      market.value.minNotionalInToken
    )

    return calculatedMinimumNotional.gt(fixedMarketMinimumNotional)
      ? calculatedMinimumNotional
      : fixedMarketMinimumNotional
  })

  worker.value.addEventListener('message', (ev) => {
    if (isLimitOrder.value || isTriggerOrder?.value) {
      return
    }

    const { data, messageType } = ev.data as OrderbookWorkerResult

    if (messageType === WorkerMessageResponseType.ReceiveQuantityInfo) {
      updatePricesFromWorkerData(data)
      notional.value = notionalWithFee.value.toFixed()
    }

    if (messageType === WorkerMessageResponseType.ReceiveNotionalInfo) {
      quantity.value = quantizeNumber(
        new BigNumberInBase(data.quantity),
        market.value.quantityTensMultiplier
      ).toFixed()
      updatePricesFromWorkerData(data)
    }
  })

  onUnmounted(() => {
    worker.value?.postMessage({
      type: WorkerMessageType.ClearValue,
      data: undefined
    })
  })

  return {
    margin,
    feeRate,
    feeAmount,
    marginWithFee,
    slippagePrice,
    executionPrice,
    notionalWithFee,
    hasSlippageWarning,
    notional: _notional,
    quantity: _quantity,
    minimumAmountInQuote,
    estSlippagePercentage,
    enoughLiquidity: computed(() => enoughLiquidity.value),
    bestPrice: computed(() => bestPrice.value as BigNumberInBase),
    worstPrice: computed(() => worstPrice.value as BigNumberInBase),
    averagePrice: computed(() => averagePrice.value as BigNumberInBase),
    calculatedNotional: computed(
      () => calculatedNotional.value as BigNumberInBase
    )
  }
}
