<script lang="ts" setup>
import { MarketType } from '@injectivelabs/sdk-ui-ts'
import { BusEvents, DefaultMarket, TradeClickOrigin } from '@/types'
import { getDefaultFuturesMarket } from '@/app/utils/market'
import { mixpanelAnalytics } from '@/app/providers/mixpanel'
const props = defineProps({
  isDense: Boolean
})

const attrs = useAttrs()

const classes = computed(() => {
  if (props.isDense) {
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
  spotMarket ? DefaultMarket.Spot : getDefaultFuturesMarket()
)

const marketType = computed(() =>
  spotMarket ? MarketType.Spot : MarketType.Perpetual
)

function onClick() {
  if (spotMarket.value || futuresMarket.value) {
    tradeClickedTrack()
  }

  useEventBus<string>(BusEvents.NavLinkClicked).emit()
}

function tradeClickedTrack() {
  mixpanelAnalytics.navigateToTradePage({
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
    @click="onClick"
  >
    <span class="block">
      <slot></slot>
    </span>
  </NuxtLink>
</template>
