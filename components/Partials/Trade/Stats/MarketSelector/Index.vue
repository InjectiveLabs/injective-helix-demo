<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const appStore = useAppStore()

function toggleOpen() {
  appStore.marketsOpen = !appStore.marketsOpen
}
</script>

<template>
  <div
    class="flex basis-[clamp(360px,25%,400px)] items-center pr-4 border-r hover:bg-brand-800 cursor-pointer select-none"
    @click="toggleOpen"
  >
    <CommonTokenIcon class="mx-4" v-bind="{ token: market.baseToken }" />
    <div>
      <p class="uppercase tracking-wider font-bold text-sm">
        {{ market.slug }}
      </p>
      <p class="text-gray-400 text-xs">{{ market.baseToken.name }}</p>
    </div>

    <div class="text-gray-400 ml-auto flex items-center">
      <div class="ml-10 mr-4 text-sm">
        {{ $t('trade.allMarkets') }}
      </div>
      <BaseIcon name="chevron" is-sm class="-rotate-90" />
    </div>
  </div>

  <div v-if="appStore.marketsOpen" class="absolute top-full w-full left-0 flex">
    <div
      class="basis-[800px] bg-brand-900 border p-4 rounded-md overflow-y-auto h-[calc(100vh-132px)]"
    >
      <PartialsTradeMarkets />
    </div>
  </div>
</template>
