<script setup lang="ts">
import { Status } from '@injectivelabs/utils'
import { ORDERBOOK_ROWS, ORDERBOOK_ROW_HEIGHT } from '@/app/utils/constants'
import { OrderbookLayout, UiMarketWithToken, OrderbookStatusKey } from '@/types'

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
    orderbookLayout: OrderbookLayout
  }>(),
  {
    isSpot: false
  }
)

const orderbookStatus = inject(OrderbookStatusKey) as Status

const orderbookStore = useOrderbookStore()

const activeBuysIndex = ref(-1)
const activeSellsIndex = ref(-1)

const buysSectionRows = computed(() =>
  props.orderbookLayout === OrderbookLayout.Buys
    ? ORDERBOOK_ROWS * 2
    : ORDERBOOK_ROWS
)

const sellsSectionRows = computed(() =>
  props.orderbookLayout === OrderbookLayout.Sells
    ? ORDERBOOK_ROWS * 2
    : ORDERBOOK_ROWS
)

const buysSectionHeight = computed(
  () => buysSectionRows.value * ORDERBOOK_ROW_HEIGHT + 'px'
)

const sellsSectionHeight = computed(
  () => sellsSectionRows.value * ORDERBOOK_ROW_HEIGHT + 'px'
)

const highestVolume = computed(() => {
  const numbers = []

  if (props.orderbookLayout !== OrderbookLayout.Sells) {
    numbers.push(
      Number(
        orderbookStore.buys[
          (orderbookStore.buys.length > buysSectionRows.value
            ? buysSectionRows.value
            : orderbookStore.buys.length) - 1
        ]?.totalVolume || 0
      )
    )
  }

  if (props.orderbookLayout !== OrderbookLayout.Buys) {
    numbers.push(
      Number(
        orderbookStore.sells[
          (orderbookStore.sells.length > sellsSectionRows.value
            ? sellsSectionRows.value
            : orderbookStore.sells.length) - 1
        ]?.totalVolume || 0
      )
    )
  }

  return Math.max(...numbers).toString()
})

function setBuysIndex(index: number) {
  activeBuysIndex.value = index
}

function setSellsIndex(index: number) {
  activeSellsIndex.value = index
}
</script>

<template>
  <div>
    <div class="flex justify-between py-2 px-3">
      <p class="text-xs space-x-1.5 flex-1">
        <span class="text-coolGray-500">{{ $t('trade.price') }}</span>
        <span class="font-bold uppercase">{{ market.quoteToken.symbol }}</span>
      </p>

      <p class="text-xs space-x-1.5 flex-1 text-center">
        <span class="text-coolGray-500">{{ $t('trade.amount') }}</span>
        <span class="font-bold uppercase">{{ market.baseToken.symbol }}</span>
      </p>

      <p class="text-xs space-x-1.5 flex-1 text-right">
        <span class="text-coolGray-500">{{ $t('trade.total') }}</span>
        <span class="font-bold uppercase">{{ market.quoteToken.symbol }}</span>
      </p>
    </div>

    <div
      v-if="orderbookLayout !== OrderbookLayout.Buys"
      :style="{ height: sellsSectionHeight }"
      class="flex flex-col-reverse px-1"
      @mouseleave="activeSellsIndex = -1"
    >
      <template v-if="orderbookStatus.isLoading()">
        <PartialsTradeOrderbookBuysSellsSkeletonRecord
          v-for="i in sellsSectionRows"
          :key="i"
          :index="i"
        />
      </template>

      <template v-else>
        <PartialsTradeOrderbookBuysSellsRecord
          v-for="(record, i) in orderbookStore.sells.slice(0, sellsSectionRows)"
          v-bind="{
            isActive: i <= activeSellsIndex,
            index: i,
            record,
            highestVolume
          }"
          :key="i"
          @set:index="setSellsIndex"
        />
      </template>
    </div>

    <div class="h-[44px] border-y my-1 flex">
      <PartialsTradeOrderbookBuysSellsMidMarkPrice
        v-bind="{ market, isSpot }"
      />
    </div>

    <div
      v-if="orderbookLayout !== OrderbookLayout.Sells"
      :style="{ height: buysSectionHeight }"
      class="px-1"
      @mouseleave="activeBuysIndex = -1"
    >
      <template v-if="orderbookStatus.isLoading()">
        <PartialsTradeOrderbookBuysSellsSkeletonRecord
          v-for="i in buysSectionRows"
          :key="i"
          :index="i"
          is-buy
        />
      </template>

      <template v-else>
        <PartialsTradeOrderbookBuysSellsRecord
          v-for="(record, i) in orderbookStore.buys.slice(0, buysSectionRows)"
          v-bind="{
            isActive: i <= activeBuysIndex,
            index: i,
            record,
            highestVolume
          }"
          :key="i"
          is-buy
          @set:index="setBuysIndex"
        />
      </template>
    </div>
  </div>
</template>
