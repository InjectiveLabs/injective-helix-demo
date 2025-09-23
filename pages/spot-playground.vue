<script setup lang="ts">
import { OrderbookWorkerKey, UiSpotMarket } from '~/types'

const jsonStore = useSharedJsonStore()
const sharedSpotStore = useSharedSpotStore()
const orderbookStore = useOrderbookStore()

const market = computed(
  () =>
    sharedSpotStore.marketsWithToken.find(
      (market) => market.ticker.toLowerCase() === 'inj/usdt'
    ) as UiSpotMarket
)

useSpotOrderbook(market)

const isReady = ref(false)

onMounted(() => {
  isReady.value = true
})
</script>

<template>
  <div>
    <div
      class="flex gap-2 p-4"
      v-if="orderbookStore.buys.length > 0 && orderbookStore.sells.length > 0"
    >
      <table
        v-for="(side, index) in [orderbookStore.buys, orderbookStore.sells]"
        class="[&_td]:p-2 [&_th]:p-2 border border-gray-300 rounded-md min-w-xs text-left"
      >
        <thead>
          <tr>
            <th>{{ index === 0 ? 'Buys' : 'Sells' }}</th>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="value in side.slice(0, 10)">
            <td></td>
            <td>{{ value.price }}</td>
            <td>{{ value.quantity }}</td>
          </tr>
        </tbody>
      </table>

      <InjectTest v-if="isReady" :market="market" />
    </div>
  </div>
</template>
