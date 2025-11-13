import { Status, StatusType } from '@injectivelabs/utils'
import { getIndexerSpotApi, getIndexerDerivativesApi } from '@shared/Service'
import OrderbookWorker from '@/assets/worker/orderbookWorker?worker'
import {
  BusEvents,
  AggregationKey,
  WorkerMessageType,
  OrderbookWorkerKey,
  OrderbookStatusKey,
  WorkerMessageResponseType
} from '@/types'
import type {
  UiMarketWithToken,
  OrderbookWorkerType,
  OrderbookWorkerResult
} from '@/types'

export function useDerivativeOrderbook(
  market: ComputedRef<undefined | UiMarketWithToken>
) {
  const isSpot = false

  return useOrderbook(market, isSpot)
}

export function useSpotOrderbook(
  market: ComputedRef<undefined | UiMarketWithToken>
) {
  const isSpot = true

  return useOrderbook(market, isSpot)
}

export function useOrderbook(
  market: ComputedRef<undefined | UiMarketWithToken>,
  isSpot: boolean
) {
  const orderbookStore = useOrderbookStore()

  const aggregation = ref(market.value?.priceDecimals || 0)
  const orderbookStatus = reactive(new Status(StatusType.Loading))

  const worker = shallowRef<null | OrderbookWorkerType>(null)

  onMounted(() => {
    if (typeof Worker !== 'undefined') {
      worker.value = new OrderbookWorker()

      worker.value.addEventListener('message', (event) => {
        const data = event.data as OrderbookWorkerResult

        if (data.messageType === WorkerMessageResponseType.ReplaceOrderbook) {
          orderbookStore.$patch({
            buys: data.data.buys,
            sells: data.data.sells,
            highestBuyPrice: data.data.highestBuyPrice,
            lowestSellPrice: data.data.lowestSellPrice
          })

          useEventBus(BusEvents.OrderbookReplaced).emit()
        }
      })
    } else {
      // console.error('Web worker is not supported')
    }
  })

  function fetchSpotOrderbook() {
    const currentMarket = market.value

    if (!currentMarket) {
      return
    }

    getIndexerSpotApi().then((indexerSpotApi) => {
      indexerSpotApi.fetchOrderbookV2(currentMarket.marketId).then((data) => {
        orderbookStatus.setIdle()

        worker.value?.postMessage({
          type: WorkerMessageType.Fetch,
          data: {
            isSpot: true,
            orderbook: data,
            sequence: data.sequence,
            aggregation: aggregation.value,
            baseDecimals: currentMarket.baseToken.decimals,
            quoteDecimals: currentMarket.quoteToken.decimals
          }
        })
      })
    })
  }

  function fetchDerivativeOrderbook() {
    const currentMarket = market.value

    if (!currentMarket) {
      return
    }

    getIndexerDerivativesApi().then((indexerDerivativesApi) => {
      indexerDerivativesApi
        .fetchOrderbookV2(currentMarket.marketId)
        .then((data) => {
          orderbookStatus.setIdle()

          worker.value?.postMessage({
            type: WorkerMessageType.Fetch,
            data: {
              isSpot: false,
              orderbook: data,
              sequence: data.sequence,
              aggregation: aggregation.value,
              baseDecimals: currentMarket.baseToken.decimals,
              quoteDecimals: currentMarket.quoteToken.decimals
            }
          })
        })
    })
  }

  function fetchAndStreamSpot(market: UiMarketWithToken) {
    orderbookStore.cancelSpotOrderbookUpdate()

    orderbookStore.streamSpotOrderbookUpdate({
      marketId: market.marketId,
      onResetCallback: fetchSpotOrderbook,
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
    orderbookStore.cancelDerivativeOrderbookUpdate()

    orderbookStore.streamDerivativeOrderbookUpdate({
      marketId: market.marketId,
      onResetCallback: fetchDerivativeOrderbook,
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
    })

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

      orderbookStore.cancelSpotOrderbookUpdate()
      orderbookStore.cancelDerivativeOrderbookUpdate()

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

    orderbookStore.cancelSpotOrderbookUpdate()
    orderbookStore.cancelDerivativeOrderbookUpdate()

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
