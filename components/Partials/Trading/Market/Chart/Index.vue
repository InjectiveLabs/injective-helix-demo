<script lang="ts" setup>
import { Status, StatusType } from '@injectivelabs/utils'
import { SharedMarketType } from '@shared/types'
import { getChronosDatafeedEndpoint } from '@/app/utils/helpers'
import { UiSpotMarket, UiMarketWithToken } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === SharedMarketType.Spot
const interval = '1D'

const status = reactive(new Status(StatusType.Loading))

const symbol = computed(() => {
  if (!isSpot) {
    return props.market.ticker
  }

  const spotTicker = `${(props.market as UiSpotMarket).baseDenom}/${
    (props.market as UiSpotMarket).quoteDenom
  }`

  return spotTicker.replaceAll('ibc/', 'ibc@')
})

const datafeedEndpoint = computed(() =>
  getChronosDatafeedEndpoint(
    props.market.type === SharedMarketType.Derivative ? 'derivative' : 'spot'
  )
)

function onReady() {
  status.setIdle()
}
</script>

<template>
  <div ref="trading-view-wrap" class="h-full relative">
    <AppHocLoading v-bind="{ status }" is-helix />
    <ClientOnly>
      <PartialsTradingMarketChartTradingView
        v-show="status.isNotLoading()"
        ref="trading-view"
        :interval="interval"
        :symbol="symbol"
        :datafeed-endpoint="datafeedEndpoint"
        @ready="onReady"
      />
    </ClientOnly>
  </div>
</template>
