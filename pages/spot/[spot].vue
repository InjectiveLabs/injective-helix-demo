<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const spotStore = useSpotStore()
const market = computed(() =>
  spotStore.markets.find((market) => market.slug === 'inj-usdt')
)

useOrderbook(
  computed(() => market.value as UiMarketWithToken),
  true
)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }" is-spot>
    <template #form>
      <pre class="text-xs">
        Form
      </pre>
    </template>
  </PartialsTradeLayout>
</template>
