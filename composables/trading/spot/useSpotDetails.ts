import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  WorkerMessageType,
  OrderbookWorkerKey,
  WorkerMessageResponseType
} from '@/types'
import type {
  UiSpotMarket,
  OrderbookWorkerType,
  OrderbookWorkerResult
} from '@/types'

export function useSpotDetails({
  slippagePercentage,
  isBuy,
  market
}: {
  isBuy: ComputedRef<boolean>
  market: ComputedRef<UiSpotMarket>
  slippagePercentage: ComputedRef<string>
}) {
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

  const quantity = ref<string>('0')
  const notional = ref<string>('0')
  const feeAmount = ref<string>('0')
  const totalNotional = ref<string>('0')
  const enoughLiquidity = ref<boolean>(false)

  const _quantity = computed({
    get: () => {
      return quantity.value
    },
    set: (value) => {
      quantity.value = value

      worker.value?.postMessage({
        type: WorkerMessageType.Quantity,
        data: {
          isBuy: isBuy.value,
          isSpot: true,
          quantity: safeAmount(value),
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals
        }
      })
    }
  })

  const _notional = computed({
    get: () => {
      return notional.value
    },
    set: (value) => {
      notional.value = value

      const notionalInBase = new BigNumberInBase(safeAmount(value))

      const notionalMinusFee = notionalInBase.minus(
        notionalInBase.times(feePercentage.value)
      )

      worker.value?.postMessage({
        type: WorkerMessageType.Notional,
        data: {
          isBuy: isBuy.value,
          isSpot: true,
          notional: notionalMinusFee.toString(),
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals
        }
      })
    }
  })

  const calculatedNotional = ref<string>('0')

  const bestPrice = ref<BigNumberInBase>(ZERO_IN_BASE)
  const worstPrice = ref<BigNumberInBase>(ZERO_IN_BASE)
  const averagePrice = ref<BigNumberInBase>(ZERO_IN_BASE)

  const slippagePrice = computed(() => {
    if (isBuy.value) {
      return bestPrice.value.times(
        new BigNumberInBase(1).plus(slippagePercentage.value)
      )
    }

    return bestPrice.value.times(
      new BigNumberInBase(1).minus(slippagePercentage.value)
    )
  })

  const estSlippagePercentage = computed(() => {
    if (bestPrice.value.isZero() || worstPrice.value.isZero()) {
      return new BigNumberInBase(0)
    }

    if (isBuy.value) {
      return new BigNumberInBase(worstPrice.value)
        .div(bestPrice.value)
        .minus(1)
        .times(100)
        .toFixed(2)
    }
    return new BigNumberInBase(bestPrice.value)
      .div(worstPrice.value)
      .minus(1)
      .times(100)
      .toFixed(2)
  })

  const feePercentage = computed(() => {
    return new BigNumberInBase(market.value.takerFeeRate)
  })

  worker.value.addEventListener('message', (ev) => {
    const { data, messageType } = ev.data as OrderbookWorkerResult

    if (messageType === WorkerMessageResponseType.ReceiveQuantityInfo) {
      averagePrice.value = new BigNumberInBase(data.averagePrice)
      worstPrice.value = new BigNumberInBase(data.worstPrice)
      bestPrice.value = new BigNumberInBase(data.bestPrice)
      enoughLiquidity.value = data.enoughLiquidity
      // Calculate notional based on average price for accurate total cost
      const calculatedNotionalInBase = worstPrice.value.times(
        safeAmount(quantity.value)
      )

      calculatedNotional.value = calculatedNotionalInBase.toString()

      feeAmount.value = calculatedNotionalInBase
        .times(feePercentage.value)
        .toString()

      notional.value = calculatedNotionalInBase.plus(feeAmount.value).toString()
      totalNotional.value = notional.value
    }

    if (messageType === WorkerMessageResponseType.ReceiveNotionalInfo) {
      quantity.value = data.quantity
      averagePrice.value = new BigNumberInBase(data.averagePrice)
      worstPrice.value = new BigNumberInBase(data.worstPrice)
      bestPrice.value = new BigNumberInBase(data.bestPrice)
      enoughLiquidity.value = data.enoughLiquidity

      // Calculate notional based on average price for accurate total cost
      const calculatedNotionalInBase = worstPrice.value.times(
        safeAmount(quantity.value)
      )

      calculatedNotional.value = calculatedNotionalInBase.toString()

      feeAmount.value = calculatedNotionalInBase
        .times(feePercentage.value)
        .toString()

      totalNotional.value = calculatedNotionalInBase
        .plus(feeAmount.value)
        .toString()
    }
  })

  return {
    feeAmount,
    bestPrice,
    worstPrice,
    averagePrice,
    totalNotional,
    calculatedNotional,
    slippagePrice,
    notional: _notional,
    quantity: _quantity,
    enoughLiquidity,
    estSlippagePercentage
  }
}
