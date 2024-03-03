<script setup lang="ts">
definePageMeta({
  middleware: ['orderbook']
})

const route = useRoute()
const derivativeStore = useDerivativeStore()

const market = computed(() =>
  derivativeStore.markets.find((market) => market.slug === route.params.slug)
)

useOrderbook(
  computed(() => market.value),
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
