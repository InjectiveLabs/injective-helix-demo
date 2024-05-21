<script setup lang="ts">
import { BigNumberInBase } from '@injectivelabs/utils'
import { MarketHeaderType, UiMarketAndSummaryWithVolumeInUsd } from '@/types'
import { deprecatedMarkets, upcomingMarkets } from '~/app/data/market'

const props = defineProps({
  isLoading: Boolean,
  isMarketsPage: Boolean,

  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const isAscending = ref(false)
const sortBy = ref(MarketHeaderType.Volume)

const sortedMarkets = computed(() => {
  const upcomingMarketsSlugs = upcomingMarkets.map(({ slug }) => slug)
  const deprecatedMarketsSlugs = deprecatedMarkets.map(({ slug }) => slug)

  if (sortBy.value.trim() === '') {
    return props.markets
  }

  const markets = [...props.markets].sort(
    (
      m1: UiMarketAndSummaryWithVolumeInUsd,
      m2: UiMarketAndSummaryWithVolumeInUsd
    ) => {
      if (
        upcomingMarketsSlugs.includes(m1.market.slug) ||
        deprecatedMarketsSlugs.includes(m1.market.slug)
      ) {
        return 1
      }

      if (sortBy.value === MarketHeaderType.Price) {
        return new BigNumberInBase(m2.summary.price || 0).comparedTo(
          m1.summary.price || 0
        )
      }

      if (sortBy.value === MarketHeaderType.Market) {
        return m1.market.ticker.localeCompare(m2.market.ticker)
      }

      if (sortBy.value === MarketHeaderType.Change) {
        if (new BigNumberInBase(m2.summary.change).eq(m1.summary.change)) {
          return m1.market.ticker.localeCompare(m2.market.ticker)
        }

        return new BigNumberInBase(m2.summary.change)
          .minus(m1.summary.change)
          .toNumber()
      }

      // if (new BigNumberInBase(m2.volumeInUsd).eq(m1.volumeInUsd)) {
      //   return m1.market.ticker.localeCompare(m2.market.ticker)
      // }

      // default: sort by volume
      return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
      // return m2.volumeInUsd.minus(m1.volumeInUsd).toNumber()
    }
  )

  return isAscending.value ? markets.reverse() : markets
})

function handleIsAscending(value: boolean) {
  isAscending.value = value
}

function handleSortBy(value: MarketHeaderType) {
  sortBy.value = value
}
</script>

<template>
  <AppHocLoading v-bind="{ isLoading }">
    <div class="overflow-x-auto">
      <div class="min-w-[700px]">
        <PartialsMarketsCommonHeader
          v-bind="{ isAscending, isMarketsPage, sortBy }"
          @update:is-ascending="handleIsAscending"
          @update:sort-by="handleSortBy"
        />

        <div class="divide-y">
          <PartialsMarketsCommonRow
            v-for="{ market, summary, volumeInUsd } in sortedMarkets"
            :key="market.marketId"
            v-bind="{ market, summary, volumeInUsd, isMarketsPage }"
          />
        </div>
      </div>
    </div>
  </AppHocLoading>
</template>
