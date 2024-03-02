<script setup lang="ts">
import { UiMarketWithToken } from '@/types'

defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const appStore = useAppStore()

const el = ref<HTMLElement | null>(null)
const toggleEl = ref<HTMLElement | null>(null)

function toggleOpen() {
  appStore.marketsOpen = !appStore.marketsOpen
}

onClickOutside(
  el,
  () => {
    appStore.marketsOpen = false
  },
  { ignore: [toggleEl] }
)

function closeMarketSection() {
  appStore.marketsOpen = false
}
</script>

<template>
  <div
    ref="toggleEl"
    class="flex basis-[clamp(360px,25%,400px)] items-center pr-4 border-r hover:bg-brand-800 cursor-pointer select-none"
    @click="toggleOpen"
  >
    <CommonTokenIcon class="mx-4" v-bind="{ token: market.baseToken }" />
    <div>
      <p class="uppercase tracking-wider font-bold text-sm">
        {{ market.ticker }}
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

  <div
    v-if="appStore.marketsOpen"
    class="absolute backdrop-blur-sm top-full z-30 w-screen left-0 flex"
    @keydown.escape="closeMarketSection"
  >
    <div
      ref="el"
      class="basis-[800px] min-w-0 overflow-y-auto bg-brand-900 border h-[calc(100vh-132px)]"
      @click.stop
    >
      <PartialsTradeMarkets />
    </div>
  </div>
</template>
