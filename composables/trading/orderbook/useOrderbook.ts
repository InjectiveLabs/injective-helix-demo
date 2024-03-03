import { ComputedRef } from 'nuxt/dist/app/compat/capi'
// eslint-disable-next-line
import OrderbookWorker from '@/assets/worker/orderbookWorker?worker'
import { spotMarketStream } from '@/app/client/streams/spot'
import { derivativesMarketStream } from '@/app/client/streams/derivatives'
import { indexerDerivativesApi, indexerSpotApi } from '~/app/Services'
import { UiMarketWithToken } from '@/types'
import { OrderbookWorkerMessage, WorkerMessageType } from '@/types/worker'

interface OrderbookWorker extends Omit<Worker, 'postMessage'> {
  postMessage(message: OrderbookWorkerMessage): void
}

export function useOrderbook(
  market: ComputedRef<UiMarketWithToken | undefined>,
  isSpot: boolean
) {
  const orderbookStore = useOrderbookStore()

  const aggregation = 3

  const worker = shallowRef<OrderbookWorker | null>(null)

  onMounted(() => {
    if (typeof Worker !== 'undefined') {
      worker.value = new OrderbookWorker()

      worker.value.onmessage = (event) => {
        orderbookStore.$patch({
          buys: event.data.buys,
          sells: event.data.sells
        })
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

      worker.value?.postMessage({
        isSpot: true,
        type: WorkerMessageType.Fetch,
        baseDecimals: market.value.baseToken.decimals,
        quoteDecimals: market.value.quoteToken.decimals,
        orderbook: data,
        aggregation
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

        worker.value?.postMessage({
          isSpot: false,
          type: WorkerMessageType.Fetch,
          baseDecimals: market.value.baseToken.decimals,
          quoteDecimals: market.value.quoteToken.decimals,
          orderbook: data,
          aggregation
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
          isSpot: true,
          type: WorkerMessageType.Stream,
          baseDecimals: market.baseToken.decimals,
          quoteDecimals: market.quoteToken.decimals,
          orderbook: data.orderbook!,
          aggregation
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
            isSpot: false,
            type: WorkerMessageType.Stream,
            baseDecimals: market.baseToken.decimals,
            quoteDecimals: market.quoteToken.decimals,
            orderbook: data.orderbook!,
            aggregation
          })
        }
      }
    )

    fetchDerivativeOrderbook()
  }

  watch(
    [market, worker],
    ([market, worker]) => {
      if (!worker || !market) {
        return
      }

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
  })

  onUnmounted(() => {
    orderbookStore.$reset()
  })
}
