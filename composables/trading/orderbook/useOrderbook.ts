import { Status, StatusType } from '@injectivelabs/utils'
import { indexerDerivativesApi, indexerSpotApi } from '@shared/Service'
import {
  WorkerMessageType,
  OrderbookWorkerResult,
  OrderbookWorkerMessage,
  WorkerMessageResponseType
} from '@/types/worker'
import { spotMarketStream } from '@/app/client/streams/spot'
// eslint-disable-next-line
import OrderbookWorker from '@/assets/worker/orderbookWorker?worker'
import { derivativesMarketStream } from '@/app/client/streams/derivatives'
import {
  AggregationKey,
  UiMarketWithToken,
  OrderbookWorkerKey,
  OrderbookStatusKey
} from '@/types'

interface OrderbookWorker extends Omit<Worker, 'postMessage'> {
  postMessage(message: OrderbookWorkerMessage): void
}

export function useDerivativeOrderbook(
  market: ComputedRef<UiMarketWithToken | undefined>
) {
  const isSpot = false

  return useOrderbook(market, isSpot)
}

export function useSpotOrderbook(
  market: ComputedRef<UiMarketWithToken | undefined>
) {
  const isSpot = true

  return useOrderbook(market, isSpot)
}

export function useOrderbook(
  market: ComputedRef<UiMarketWithToken | undefined>,
  isSpot: boolean
) {
  const orderbookStore = useOrderbookStore()

  const aggregation = ref(market.value?.priceDecimals || 0)
  const orderbookStatus = reactive(new Status(StatusType.Loading))

  const worker = shallowRef<OrderbookWorker | null>(null)

  onMounted(() => {
    if (typeof Worker !== 'undefined') {
      worker.value = new OrderbookWorker()

      worker.value.onmessage = (event) => {
        const data = event.data as OrderbookWorkerResult

        if (data.messageType === WorkerMessageResponseType.ReplaceOrderbook) {
          orderbookStore.$patch({
            buys: data.data.buys,
            sells: data.data.sells,
            midPrice: data.data.midPrice
          })
        }

        if (data.messageType === WorkerMessageResponseType.WorstPrice) {
          orderbookStore.worstPrice = data.data.worstPrice
        }
      }
    } else {
      // console.error('Web worker is not supported')
    }
  })

  let spotStream:
    | ReturnType<typeof spotMarketStream.streamSpotOrderbookUpdate>
    | undefined
  let derivativesStream:
    | ReturnType<typeof derivativesMarketStream.streamDerivativeOrderbookUpdate>
    | undefined

  function fetchSpotOrderbook() {
    if (!market.value) {
      return
    }

    indexerSpotApi.fetchOrderbookV2(market.value.marketId).then((data) => {
      if (!market.value) {
        return
      }

      orderbookStatus.setIdle()

      worker.value?.postMessage({
        type: WorkerMessageType.Fetch,
        data: {
          isSpot: true,
          orderbook: data,
          sequence: data.sequence,
          aggregation: aggregation.value,
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals
        }
      })
    })
  }

  function fetchDerivativeOrderbook() {
    if (!market.value) {
      return
    }

    indexerDerivativesApi
      .fetchOrderbookV2(market.value.marketId)
      .then((data) => {
        if (!market.value) {
          return
        }

        orderbookStatus.setIdle()

        worker.value?.postMessage({
          type: WorkerMessageType.Fetch,
          data: {
            isSpot: false,
            orderbook: data,
            sequence: data.sequence,
            aggregation: aggregation.value,
            baseDecimals: market.value.baseToken.decimals,
            quoteDecimals: market.value.quoteToken.decimals
          }
        })
      })
  }

  function fetchAndStreamSpot(market: UiMarketWithToken) {
    if (spotStream) {
      spotStream.unsubscribe()
    }

    spotStream = spotMarketStream.streamSpotOrderbookUpdate({
      marketIds: [market.marketId],
      callback: (data) => {
        worker.value?.postMessage({
          type: WorkerMessageType.Stream,
          data: {
            isSpot: true,
            orderbook: data.orderbook!,
            aggregation: aggregation.value,
            sequence: data.orderbook!.sequence,
            baseDecimals: market.baseToken.decimals,
            quoteDecimals: market.quoteToken.decimals
          }
        })
      }
    })

    fetchSpotOrderbook()
  }

  function fetchAndStreamDerivative(market: UiMarketWithToken) {
    if (derivativesStream) {
      derivativesStream.unsubscribe()
    }

    derivativesStream = derivativesMarketStream.streamDerivativeOrderbookUpdate(
      {
        marketIds: [market.marketId],
        callback: (data) => {
          worker.value?.postMessage({
            type: WorkerMessageType.Stream,
            data: {
              isSpot: false,
              baseDecimals: market.baseToken.decimals,
              quoteDecimals: market.quoteToken.decimals,
              orderbook: data.orderbook!,
              aggregation: aggregation.value,
              sequence: data.orderbook!.sequence
            }
          })
        }
      }
    )

    fetchDerivativeOrderbook()
  }

  provide(OrderbookWorkerKey, worker)
  provide(AggregationKey, aggregation)
  provide(OrderbookStatusKey, orderbookStatus)

  watch(aggregation, () => {
    worker.value?.postMessage({
      type: WorkerMessageType.Aggregation,
      data: {
        isSpot,
        aggregation: aggregation.value,
        baseDecimals: market.value?.baseToken.decimals || 0,
        quoteDecimals: market.value?.quoteToken.decimals || 0
      }
    })
  })

  watch(
    [market, worker],
    ([market, worker]) => {
      if (!worker || !market) {
        return
      }

      spotStream?.unsubscribe()
      derivativesStream?.unsubscribe()

      if (isSpot) {
        fetchAndStreamSpot(market)
      } else {
        fetchAndStreamDerivative(market)
      }
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (worker.value) {
      worker.value.terminate()
    }

    spotStream?.unsubscribe()
    derivativesStream?.unsubscribe()

    orderbookStore.$reset()
  })

  setTimeout(() => {
    if (isSpot) {
      fetchSpotOrderbook()
    } else {
      fetchDerivativeOrderbook()
    }
  }, 5 * 1000)
}
