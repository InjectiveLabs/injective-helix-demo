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
  const worker = inject(
    OrderbookWorkerKey
  ) as unknown as Ref<OrderbookWorkerType>

  const quantity = ref<string>('0')
  const notional = ref<string>('0')

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
          quantity: value,
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

      worker.value?.postMessage({
        type: WorkerMessageType.Notional,
        data: {
          isBuy: isBuy.value,
          isSpot: true,
          notional: value,
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
      return bestPrice.value.times(slippagePercentage.value)
    }

    return worstPrice.value.times(slippagePercentage.value)
  })

  const feePercentage = computed(() => {
    return new BigNumberInBase(market.value.takerFeeRate)
  })

  const feeAmount = computed(() => {
    return new BigNumberInBase(calculatedNotional.value).times(
      feePercentage.value
    )
  })

  const totalNotional = computed(() => {
    return new BigNumberInBase(calculatedNotional.value).plus(feeAmount.value)
  })

  worker.value.addEventListener('message', (ev) => {
    const { data, messageType } = ev.data as OrderbookWorkerResult

    if (messageType === WorkerMessageResponseType.ReceiveQuantityInfo) {
      averagePrice.value = new BigNumberInBase(data.averagePrice)
      worstPrice.value = new BigNumberInBase(data.worstPrice)
      notional.value = calculatedNotional.value
      calculatedNotional.value = worstPrice.value
        .times(quantity.value)
        .toString()
    }

    if (messageType === WorkerMessageResponseType.ReceiveNotionalInfo) {
      quantity.value = data.quantity
      averagePrice.value = new BigNumberInBase(data.averagePrice)
      worstPrice.value = new BigNumberInBase(data.worstPrice)

      calculatedNotional.value = worstPrice.value
        .times(quantity.value)
        .toString()
    }
  })

  return {
    feeAmount,
    totalNotional,
    calculatedNotional,
    slippagePrice,
    notional: _notional,
    quantity: _quantity
  }
}
