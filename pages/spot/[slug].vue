<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const spotStore = useSpotStore()

const market = computed(() =>
  spotStore.markets.find((market) => market.slug === route.params.slug)
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
