<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketWithToken[]>,
    required: true
  }
})

const emit = defineEmits<{
  'set:market': [market: UiMarketWithToken]
}>()

const search = ref('')

const marketsFiltered = computed(() => {
  return props.markets.filter((market) => {
    const formattedSearch = search.value.trim().toLowerCase()

    return (
      market.ticker.toLowerCase().startsWith(formattedSearch) ||
      market.baseToken.name.toLowerCase().startsWith(formattedSearch) ||
      market.quoteToken.name.toLowerCase().startsWith(formattedSearch)
    )
  })
})

onMounted(() => {
  document.getElementById('search-market')?.focus()
})

function setMarket(market: UiMarketWithToken) {
  emit('set:market', market)
}
</script>

<template>
  <div class="flex flex-1 flex-col overflow-hidden">
    <div class="flex p-2 border-b">
      <div class="flex items-center p-2">
        <SharedIcon name="search" />
      </div>

      <input
        id="search-market"
        v-model="search"
        type="text"
        class="bg-transparent focus:outline-none p-2 rounded-md"
        placeholder="Search..."
        autocomplete="off"
      />
    </div>

    <div class="overflow-y-auto flex-1 md:max-h-[400px]">
      <div v-for="market in marketsFiltered" :key="market.marketId">
        <CommonMarketSelectorItem v-bind="{ market }" @set:market="setMarket" />
      </div>
    </div>
  </div>
</template>
