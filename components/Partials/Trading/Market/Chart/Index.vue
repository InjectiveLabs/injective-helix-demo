<script lang="ts" setup>
import { PropType } from 'vue'
import { Status, StatusType } from '@injectivelabs/utils'
import { UiSpotMarketWithToken, MarketType } from '@injectivelabs/sdk-ui-ts'
import { getChronosDatafeedEndpoint } from '@/app/utils/helpers'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const isSpot = props.market.type === MarketType.Spot
const interval = '1D'

const status = reactive(new Status(StatusType.Loading))

const symbol = computed(() => {
  if (!isSpot) {
    return props.market.ticker
  }

  const spotTicker = `${(props.market as UiSpotMarketWithToken).baseDenom}/${
    (props.market as UiSpotMarketWithToken).quoteDenom
  }`

  return spotTicker.replaceAll('ibc/', 'ibc@')
})

const datafeedEndpoint = computed(() =>
  getChronosDatafeedEndpoint(
    props.market.type === MarketType.Derivative ? 'derivative' : 'spot'
  )
)

function onReady() {
  status.setIdle()
}
</script>

<template>
  <div
    class="bg-gray-1000 lg:rounded-l-xl lg:shadow-sm h-full overflow-hidden relative"
  >
    <AppLoading v-if="status.isLoading()" />
    <div
      ref="trading-view-wrap"
      class="orderbook-h lg:h-full lg:min-h-full h-full w-full relative flex"
    >
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
  </div>
</template>
