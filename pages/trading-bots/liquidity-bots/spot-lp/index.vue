<script setup lang="ts">
import { spotGridMarkets } from '@/app/json'
import { MARKETS_HISTORY_CHART_ONE_HOUR } from '~/app/utils/constants'

const spotStore = useSpotStore()
const exchangeStore = useExchangeStore()

const market = useQueryRef('market', 'inj-usdt')

const marketOptions = computed(() =>
  spotStore.markets
    .filter(({ slug }) =>
      spotGridMarkets.some((market) => market.slug === slug)
    )
    .map((market) => ({
      label: market.ticker,
      value: market.slug,
      avatar: {
        src: market.baseToken.logo
      }
    }))
    .toSorted((a, b) => {
      if (a.value === 'inj-usdt') return -1
      if (b.value === 'inj-usdt') return 1
      return a.label.localeCompare(b.label)
    })
)

const selectedMarket = computed(() =>
  spotStore.markets.find((m) => m.slug === market.value)
)

watch(
  selectedMarket,
  (market) => {
    if (market) {
      exchangeStore.fetchMarketHistory({
        marketIds: [market.marketId],
        countback: 7 * 24,
        resolution: MARKETS_HISTORY_CHART_ONE_HOUR
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <UContainer>
    <div class="flex flex-col gap-4 text-center items-center my-10">
      <h3 class="text-6xl font-bold">
        {{ $t('liquidityBots.title') }}
      </h3>
      <p class="text-xl">
        {{ $t('liquidityBots.description') }}
      </p>
    </div>

    <div class="grid grid-cols-2 gap-4 *:border *:p-4 *:rounded-lg my-10">
      <div>
        <p class="text-xl font-bold">
          {{ $t('liquidityBots.setLiquidityBot') }}
        </p>
        <p class="text-sm font-semibold my-4">
          {{ $t('liquidityBots.selectPair') }}
        </p>

        <USelectMenu
          v-model="market"
          value-attribute="value"
          :options="marketOptions"
          searchable
          :search-attributes="['label', 'value']"
          size="xl"
        >
          <template #leading>
            <UAvatar
              v-if="selectedMarket"
              :src="selectedMarket.baseToken.logo"
              size="2xs"
              :alt="market"
            />
          </template>
        </USelectMenu>

        <PartialsLiquidityBotsSpotForm
          v-if="selectedMarket"
          v-bind="{ market: selectedMarket }"
          class="mt-4"
        />
      </div>
      <PartialsLiquidityBotsSpotChart
        v-if="selectedMarket"
        v-bind="{ market: selectedMarket }"
      />
    </div>
  </UContainer>
</template>
