<script setup lang="ts">
import { Status, StatusType } from '@injectivelabs/utils'
import { CandlestickData, Time, WhitespaceData } from 'lightweight-charts'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '~/app/utils/constants'

const props = defineProps({
  marketId: {
    type: String as PropType<string>,
    required: true
  }
})
const status = reactive(new Status(StatusType.Idle))

const exchangeStore = useExchangeStore()

onMounted(() => {
  status.setLoading()

  exchangeStore
    .getMarketsHistory({
      marketIds: [props.marketId],
      countback: 30 * 24,
      resolution: MARKETS_HISTORY_CHART_ONE_HOUR
    })
    .finally(() => {
      status.setIdle()
    })
})

const candlesticksData = computed<
  (CandlestickData<Time> | WhitespaceData<Time>)[]
>(() => {
  const marketHistory = exchangeStore.marketsHistory.find(
    (market) => market.marketId === props.marketId
  )

  if (!marketHistory) {
    return []
  }

  return marketHistory.time.map((time, index) => ({
    time: time as Time,
    open: marketHistory.openPrice[index],
    high: marketHistory.highPrice[index],
    low: marketHistory.lowPrice[index],
    close: marketHistory.closePrice[index]
  }))
})
</script>

<template>
  <AppHocLoading v-bind="{ status }" class="h-full">
    <CommonTradingChart
      v-bind="{
        candlesticksData: candlesticksData
      }"
    />
  </AppHocLoading>
</template>
