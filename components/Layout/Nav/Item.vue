<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { BusEvents, DefaultMarket, TradeClickOrigin } from '@/types'
import { amplitudeTradeTracker } from '@/app/providers/amplitude'

const props = defineProps({
  dense: Boolean
})

const attrs = useAttrs()

const classes = computed(() => {
  if (props.dense) {
    return ['hover:text-blue-500']
  }

  return ['px-6', 'py-2', 'hover:bg-gray-800', 'hover:text-white']
})

const spotMarket = computed(() => {
  type Attrs = { to: { params: { spot: string } } }

  const attributes = attrs as unknown as Attrs

  if (!attributes || !attributes.to || !attributes.to.params) {
    return ''
  }

  return attributes.to.params.spot
})

const futuresMarket = computed(() => {
  type Attrs = { to: { params: { futures: string } } }

  const attributes = attrs as unknown as Attrs

  if (!attributes || !attributes.to || !attributes.to.params) {
    return ''
  }

  return attributes.to.params.futures
})

const market = computed(() =>
  spotMarket ? DefaultMarket.Spot : DefaultMarket.Perpetual
)

const marketType = computed(() =>
  spotMarket ? MarketType.Spot : MarketType.Perpetual
)

function handleVisit() {
  if (spotMarket.value || futuresMarket.value) {
    handleTradeClickedTrack()
  }

  useEventBus<string>(BusEvents.NavLinkClicked).emit()
}

function handleTradeClickedTrack() {
  amplitudeTradeTracker.navigateToTradePageTrackEvent({
    market: market.value,
    marketType: marketType.value,
    origin: TradeClickOrigin.TopMenu
  })
}
</script>

<template>
  <NuxtLink
    v-bind="$attrs"
    class="text-gray-200 hover:bg-gray-800 hover:text-white text-sm font-semibold rounded-lg cursor-pointer mx-px h-10 flex items-center"
    :class="classes"
    exact
    @click="handleVisit"
  >
    <span class="block">
      <slot></slot>
    </span>
  </NuxtLink>
</template>
