<script lang="ts" setup>
import { SharedMarketType } from '@shared/types'
import { Status, StatusType } from '@injectivelabs/utils'
import { getChronosDatafeedEndpoint } from '@/app/utils/helpers'
import { UiSpotMarket, UiMarketWithToken, TradingChartInterval } from '@/types'

const appStore = useAppStore()

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const isSpot = props.market.type === SharedMarketType.Spot

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

function onIntervalChange(value: TradingChartInterval) {
  appStore.setUserState({
    ...appStore.userState,
    preferences: {
      ...appStore.userState.preferences,
      tradingChartInterval: value
    }
  })
}
</script>

<template>
  <div ref="trading-view-wrap" class="h-full relative">
    <AppHocLoading v-bind="{ status }" is-helix />
    <ClientOnly>
      <PartialsTradingMarketChartTradingView
        v-show="status.isNotLoading()"
        ref="trading-view"
        :symbol="symbol"
        :interval="
          appStore.userState.preferences.tradingChartInterval ||
          TradingChartInterval.D
        "
        :datafeed-endpoint="datafeedEndpoint"
        @ready="onReady"
        @interval:change="onIntervalChange"
      />
    </ClientOnly>
  </div>
</template>
