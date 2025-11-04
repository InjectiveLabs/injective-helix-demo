import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { quantizeNumber } from '@/app/utils/helpers'
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
  SpotDetails,
  UiSpotMarket,
  OrderbookWorkerType,
  OrderbookWorkerResult
} from '@/types'

export function useSpotDetails({
  isBuy,
  market,
  limitPrice,
  isPostOnly,
  isLimitOrder,
  takerFeeRate,
  slippagePercentage
}: {
  isBuy: ComputedRef<boolean>
  limitPrice: ComputedRef<string>
  isPostOnly: ComputedRef<boolean>
  market: ComputedRef<UiSpotMarket>
  isLimitOrder: ComputedRef<boolean>
  slippagePercentage: ComputedRef<string>
  takerFeeRate: ComputedRef<BigNumberInBase>
}): SpotDetails {
  function safeAmount(value: string) {
    const isInvalid =
      new BigNumberInBase(value).isNaN() ||
      value === '' ||
      value === null ||
      value === undefined

    return isInvalid ? '0' : value
  }

  const worker = inject(
    OrderbookWorkerKey
  ) as unknown as Ref<OrderbookWorkerType>

  const quantity = ref('0')
  const notional = ref('0')

  const enoughLiquidity = ref(false)
  const bestPrice = ref(ZERO_IN_BASE)
  const worstPrice = ref(ZERO_IN_BASE)
  const averagePrice = ref(ZERO_IN_BASE)
  const calculatedNotional = ref(ZERO_IN_BASE)

  const _quantity = computed({
    get: () => quantity.value,
    set: (value) => {
      quantity.value = value

      if (isLimitOrder.value) {
        const quantityInBase = new BigNumberInBase(safeAmount(value))
        const limitPriceInBase = new BigNumberInBase(
          safeAmount(limitPrice.value)
        )

        bestPrice.value = limitPriceInBase
        worstPrice.value = limitPriceInBase
        averagePrice.value = limitPriceInBase

        calculatedNotional.value = calculateNotional({
          price: limitPriceInBase,
          quantity: quantityInBase
        })

        notional.value = notionalWithFee.value.toFixed()

        enoughLiquidity.value = true

        return
      }

      worker.value?.postMessage({
        type: WorkerMessageType.Quantity,
        data: {
          isSpot: true,
          isBuy: isBuy.value,
          quantity: safeAmount(value),
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

      if (isLimitOrder.value) {
        const limitPriceInBase = new BigNumberInBase(
          safeAmount(limitPrice.value)
        )

        bestPrice.value = limitPriceInBase
        worstPrice.value = limitPriceInBase
        averagePrice.value = limitPriceInBase

        const calculatedQuantity = calculateQuantityFromNotional({
          price: limitPriceInBase,
          notional: notionalMinusFee
        })

        const calculatedQuantityQuantized = quantizeNumber(
          calculatedQuantity,
          market.value.quantityTensMultiplier
        )

        quantity.value = calculatedQuantityQuantized.toFixed()

        calculatedNotional.value = calculateNotional({
          price: limitPriceInBase,
          quantity: calculatedQuantityQuantized
        })

        enoughLiquidity.value = true

        return
      }

      worker.value?.postMessage({
        type: WorkerMessageType.Notional,
        data: {
          isSpot: true,
          isBuy: isBuy.value,
          notional: notionalMinusFee.toFixed(),
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals
        }
      })
    }
  })

  const slippageTolerance = computed(() => {
    return new BigNumberInBase(safeAmount(slippagePercentage.value)).div(100)
  })

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
    if (isLimitOrder.value) {
      return
    }

    const { data, messageType } = ev.data as OrderbookWorkerResult

    if (messageType === WorkerMessageResponseType.ReceiveQuantityInfo) {
      enoughLiquidity.value = data.enoughLiquidity
      bestPrice.value = new BigNumberInBase(data.bestPrice)
      worstPrice.value = new BigNumberInBase(data.worstPrice)
      averagePrice.value = new BigNumberInBase(data.averagePrice)

      calculatedNotional.value = calculateNotional({
        price: new BigNumberInBase(worstPrice.value),
        quantity: new BigNumberInBase(safeAmount(quantity.value))
      })

      notional.value = notionalWithFee.value.toFixed()
    }

    if (messageType === WorkerMessageResponseType.ReceiveNotionalInfo) {
      quantity.value = quantizeNumber(
        new BigNumberInBase(data.quantity),
        market.value.quantityTensMultiplier
      ).toFixed()
      enoughLiquidity.value = data.enoughLiquidity
      bestPrice.value = new BigNumberInBase(data.bestPrice)
      worstPrice.value = new BigNumberInBase(data.worstPrice)
      averagePrice.value = new BigNumberInBase(data.averagePrice)

      calculatedNotional.value = calculateNotional({
        price: new BigNumberInBase(worstPrice.value),
        quantity: new BigNumberInBase(safeAmount(quantity.value))
      })
    }
  })

  onUnmounted(() => {
    worker.value?.postMessage({
      type: WorkerMessageType.ClearValue,
      data: undefined
    })
  })

  return {
    feeRate,
    feeAmount,
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
