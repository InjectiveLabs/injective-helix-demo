import { ComputedRef } from 'nuxt/dist/app/compat/capi'
import OrderbookWorker from '@/assets/worker/orderbookWorker?worker'

export function useOrderbook(market: ComputedRef, _isSpot: boolean) {
  const result = ref('')

  let worker: Worker | null = null

  onMounted(() => {
    if (typeof Worker !== 'undefined') {
      // Create a new web worker
      worker = new OrderbookWorker()
      // Send a message to the worker
      worker.postMessage([10, 5])
      // Listen for messages from the worker
      worker.onmessage = (event) => {
        result.value = event.data
      }
    } else {
      //   console.error('Web worker is not supported')
    }
  })

  watch([market], () => {
    //
  })

  onUnmounted(() => {
    if (worker) {
      worker.terminate()
    }
  })

  return result
}
