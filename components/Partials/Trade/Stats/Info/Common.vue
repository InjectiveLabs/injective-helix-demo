<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { stableCoinSymbols } from '@/app/data/token'
import { SpotMarketCyTags } from '@/types'
import type { UiMarketWithToken } from '@/types'

const sharedSpotStore = useSharedSpotStore()
const sharedTokenStore = useSharedTokenStore()
const sharedDerivativeStore = useSharedDerivativeStore()

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)

const summary = computed(() => {
  if (props.isSpot) {
    return sharedSpotStore.marketsSummary.find(
      (market) => market.marketId === props.market.marketId
    )
  }

  return sharedDerivativeStore.marketsSummary.find(
    (market) => market.marketId === props.market.marketId
  )
})

const isStableQuoteAsset = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)

const volumeInUsd = computed(() =>
  volume.value.times(sharedTokenStore.tokenUsdPrice(props.market.quoteToken))
)

const { valueToBigNumber: volume } = useSharedBigNumberFormatter(
  computed(() => {
    if (!summary.value) {
      return ZERO_IN_BASE
    }

    return new BigNumberInBase(summary.value.volume)
  }),
  {
    decimalPlaces: stableCoinSymbols.includes(props.market.quoteToken.symbol)
      ? 0
      : props.market.priceDecimals
  }
)

const high = computed(() => {
  if (!summary.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(summary.value.high)
})

const low = computed(() => {
  if (!summary.value) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(summary.value.low)
})
</script>

<template>
  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.marketVolume24h')">
    <p>
      <AppAmount
        v-bind="{
          amount: volume.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
        :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsInfoVol)"
      />

      {{ market.quoteToken.symbol }}
    </p>
  </PartialsTradeStatsHeaderItem>

  <div v-if="!isStableQuoteAsset" class="flex items-center lg:hidden">
    <PartialsTradeStatsHeaderItem class="w-full">
      <template #title>
        <p class="text-coolGray-400">
          {{ $t('trade.stats.volumeInUsd') }}
        </p>
      </template>
      <div>
        <AppAmount
          v-bind="{
            amount: volumeInUsd.toFixed(),
            decimalPlaces: market.priceDecimals
          }"
        />
        <span class="ml-1">USD</span>
      </div>
    </PartialsTradeStatsHeaderItem>
  </div>

  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.high')">
    <p>
      <AppAmount
        v-bind="{
          amount: high.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
        :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsInfoHigh)"
      />
    </p>
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.low')">
    <p>
      <AppAmount
        v-bind="{
          amount: low.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
        :data-cy="dataCyTag(SpotMarketCyTags.TradeStatsInfoLow)"
      />
    </p>
  </PartialsTradeStatsHeaderItem>
</template>
