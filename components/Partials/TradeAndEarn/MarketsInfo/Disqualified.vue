<script lang="ts" setup>
const sharedSpotStore = useSharedSpotStore()
const sharedDerivativeStore = useSharedDerivativeStore()

const { disqualifiedMarketIdsList } = useTradeReward()

const disqualifiedMarkets = computed(() =>
  [
    ...sharedSpotStore.marketsWithToken,
    ...sharedDerivativeStore.marketsWithToken
  ]
    .filter((m) => disqualifiedMarketIdsList.value.includes(m.marketId))
    .map((m) => m.ticker)
)
</script>

<template>
  <PartialsCommonStatsItem>
    <template #value>
      <span v-if="disqualifiedMarkets.length > 0" class="font-mono text-lg">
        {{ disqualifiedMarkets.join(', ') }}
      </span>
      <span v-else class="text-xs font-normal">
        {{ $t('trade.there_are_no_disqualified_markets_on_this_relayer') }}
      </span>
    </template>
    <template #title>
      <div class="flex items-center justify-center text-coolGray-450">
        {{ $t('trade.disqualified_markets') }}
        <AppTooltip
          class="ml-2 text-coolGray-450"
          :content="$t('trade.disqualified_markets_tooltip')"
        />
      </div>
    </template>
  </PartialsCommonStatsItem>
</template>
