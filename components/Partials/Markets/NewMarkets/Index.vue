<script lang="ts" setup>
import { newMarketsSlug } from '@/app/data/market'
import { UiMarketAndSummaryWithVolumeInUsd } from '@/types'

const props = defineProps({
  markets: {
    type: Array as PropType<UiMarketAndSummaryWithVolumeInUsd[]>,
    required: true
  }
})

const newMarkets = computed(
  () =>
    newMarketsSlug
      .map((slug) =>
        props.markets.find(
          (market) => market.market.slug.toLowerCase() === slug.toLowerCase()
        )
      )
      .filter(
        (market) => market?.market && market?.summary
      ) as UiMarketAndSummaryWithVolumeInUsd[]
)
</script>

<template>
  <div class="w-full mx-auto xl:w-4/5 relative">
    <div class="bg-cover bg-center">
      <div class="mt-6">
        <div class="flex justify-between items-center mb-4">
          <h3
            class="text-xl tracking-wider leading-6 font-bold hidden md:block"
          >
            {{ $t('markets.newMarkets') }}
          </h3>

          <div id="new-markets-navigate" class="hidden md:block" />
        </div>

        <AppHorizontalScrollView
          class="md:hidden"
          v-bind="{ isCarousel: true }"
        >
          <template
            v-for="(newMarket, index) in newMarkets"
            :key="`${newMarket.market.marketId}-${index}`"
          >
            <PartialsMarketsCard
              v-if="newMarket && newMarket.summary"
              class="flex-0-full col-span-4"
              data-cy="market-card-whats-new"
              v-bind="{
                market: newMarket.market,
                summary: newMarket.summary,
                volumeInUsd: newMarket.volumeInUsd
              }"
            >
              {{ $t('markets.whatsNew') }}
            </PartialsMarketsCard>
          </template>
        </AppHorizontalScrollView>

        <PartialsMarketsNewMarketsCarousel
          class="hidden md:block"
          v-bind="{ markets: newMarkets }"
        />
      </div>
    </div>
  </div>
</template>
