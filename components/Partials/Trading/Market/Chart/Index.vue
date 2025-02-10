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

// todo: remove this once the market is fixed on chain
const TRADFI_MARKET_ID =
  '0x2236b4cd97300c79fca5c2fff4b647ab24a6d48c1554255ff8ec7cf29429ba74'

const symbol = computed(() => {
  if (!isSpot) {
    return props.market.marketId === TRADFI_MARKET_ID
      ? 'SPY/USDT PERP'
      : props.market.ticker
  }

  return `${(props.market as UiSpotMarket).baseDenom}/${
    (props.market as UiSpotMarket).quoteDenom
  }`
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
