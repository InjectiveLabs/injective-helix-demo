import { BigNumber, BigNumberInBase } from '@injectivelabs/utils'
import { ONE_IN_BASE, ZERO_IN_BASE } from '@shared/utils/constant'
import { quantizeNumber } from '@/app/utils/helpers'
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
  const feeAmount = ref('0')
  const totalNotional = ref('0')
  const enoughLiquidity = ref(false)
  const calculatedNotional = ref('0')
  const bestPrice = ref(ZERO_IN_BASE)
  const worstPrice = ref(ZERO_IN_BASE)
  const averagePrice = ref(ZERO_IN_BASE)

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

        const calculatedNotionalInBase = quantityInBase.times(limitPriceInBase)

        calculatedNotional.value = calculatedNotionalInBase.toFixed()

        feeAmount.value = calculatedNotionalInBase
          .times(feePercentage.value)
          .toFixed()

        notional.value = calculatedNotionalInBase
          .plus(feeAmount.value)
          .toFixed()
        totalNotional.value = notional.value

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

      const notionalMinusFee = notionalInBase.div(
        ONE_IN_BASE.plus(feePercentage.value)
      )

      if (isLimitOrder.value) {
        const limitPriceInBase = new BigNumberInBase(
          safeAmount(limitPrice.value)
        )

        bestPrice.value = limitPriceInBase
        worstPrice.value = limitPriceInBase
        averagePrice.value = limitPriceInBase

        const calculatedQuantity = limitPriceInBase.isZero()
          ? ZERO_IN_BASE
          : notionalMinusFee.div(limitPriceInBase)

        const calculatedQuantityQuantized = quantizeNumber(
          calculatedQuantity,
          market.value.quantityTensMultiplier
        )

        quantity.value = calculatedQuantityQuantized.toFixed()

        const calculatedNotionalInBase = limitPriceInBase.times(
          calculatedQuantityQuantized
        )

        calculatedNotional.value = calculatedNotionalInBase.toFixed()

        feeAmount.value = calculatedNotionalInBase
          .times(feePercentage.value)
          .toFixed()

        totalNotional.value = calculatedNotionalInBase
          .plus(feeAmount.value)
          .toFixed()

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

  const slippagePrice = computed(() => {
    if (isBuy.value) {
      return bestPrice.value.times(ONE_IN_BASE.plus(slippagePercentage.value))
    }

    return bestPrice.value.times(ONE_IN_BASE.minus(slippagePercentage.value))
  })

  const estSlippagePercentage = computed(() => {
    if (bestPrice.value.isZero() || worstPrice.value.isZero()) {
      return ZERO_IN_BASE
    }

    if (isBuy.value) {
      return worstPrice.value.div(bestPrice.value).minus(1).times(100)
    }

    return bestPrice.value.div(worstPrice.value).minus(1).times(100)
  })

  const feePercentage = computed(() => {
    if (isLimitOrder.value && isPostOnly.value) {
      return ZERO_IN_BASE
    }

    return takerFeeRate.value
  })

  const slippageWarning = computed(() =>
    estSlippagePercentage.value.gt(slippagePercentage.value)
  )

  const finalPrice = computed(() => {
    if (isLimitOrder.value) {
      return quantizeNumber(
        new BigNumberInBase(limitPrice.value),
        market.value.priceDecimals
      )
    }

    return quantizeNumber(slippagePrice.value, market.value.priceDecimals)
  })

  const minimumAmountInQuote = computed(() => {
    const price = finalPrice.value

    const minQuantity = new BigNumberInBase(10).exponentiatedBy(
      market.value.quantityTensMultiplier
    )

    console.log(
      'Result = ',
      price.toFixed(6),
      'x',
      minQuantity.toFixed(6),
      '=',
      new BigNumberInBase(
        price
          .times(minQuantity)
          .dp(market.value.priceDecimals, BigNumber.ROUND_UP)
      ).toFixed(6)
    )
    return new BigNumberInBase(
      price
        .times(minQuantity)
        .dp(market.value.priceDecimals, BigNumber.ROUND_UP)
    )
  })

  const isNotionalLessThanMinNotional = computed(() => {
    const priceForNotional = finalPrice.value

    const quantityInBase = new BigNumberInBase(safeAmount(quantity.value))

    if (priceForNotional.isZero() || quantityInBase.isZero()) {
      return
    }

    return quantityInBase
      .times(priceForNotional)
      .lt(market.value.minNotionalInToken)
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

      const calculatedNotionalInBase = worstPrice.value.times(
        safeAmount(quantity.value)
      )

      calculatedNotional.value = calculatedNotionalInBase.toFixed()

      feeAmount.value = calculatedNotionalInBase
        .times(feePercentage.value)
        .toFixed()

      notional.value = calculatedNotionalInBase.plus(feeAmount.value).toFixed()
      totalNotional.value = notional.value
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

      const calculatedNotionalInBase = worstPrice.value.times(
        safeAmount(quantity.value)
      )

      calculatedNotional.value = calculatedNotionalInBase.toFixed()

      feeAmount.value = calculatedNotionalInBase
        .times(feePercentage.value)
        .toFixed()

      totalNotional.value = calculatedNotionalInBase
        .plus(feeAmount.value)
        .toFixed()
    }
  })

  onUnmounted(() => {
    worker.value?.postMessage({
      type: WorkerMessageType.ClearValue,
      data: undefined
    })
  })

  return {
    finalPrice,
    slippagePrice,
    slippageWarning,
    notional: _notional,
    quantity: _quantity,
    minimumAmountInQuote,
    estSlippagePercentage,
    isNotionalLessThanMinNotional,
    feeAmount: computed(() => feeAmount.value),
    totalNotional: computed(() => totalNotional.value),
    enoughLiquidity: computed(() => enoughLiquidity.value),
    calculatedNotional: computed(() => calculatedNotional.value),
    bestPrice: computed(() => bestPrice.value as BigNumberInBase),
    worstPrice: computed(() => worstPrice.value as BigNumberInBase),
    averagePrice: computed(() => averagePrice.value as BigNumberInBase)
  }
}
