<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const derivativeStore = useDerivativeStore()
const market = computed(() =>
  derivativeStore.markets.find((market) => market.slug === 'btc-usdt-perp')
)

useOrderbook(
  computed(() => market.value as UiMarketWithToken),
  false
)
</script>

<template>
  <PartialsTradeLayout v-if="market" v-bind="{ market }">
    <template #form>
      <pre class="text-xs">
        Form
      </pre>
    </template>
  </PartialsTradeLayout>
</template>
