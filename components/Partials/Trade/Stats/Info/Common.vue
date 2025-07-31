<script setup lang="ts">
import { dataCyTag } from '@shared/utils'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { stableCoinSymbols } from '@/app/data/token'
import { UI_ZERO_DECIMAL } from '@/app/utils/constants'
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
</script>

<template>
  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.marketVolume24h')">
    <p>
      <SharedAmount
        v-bind="{
          useSubscript: true,
          shouldAbbreviate: false,
          amount: volume.toFixed(),
          decimals: UI_ZERO_DECIMAL
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
        <SharedAmount
          v-bind="{
            useSubscript: true,
            shouldAbbreviate: false,
            decimals: UI_ZERO_DECIMAL,
            amount: volumeInUsd.toFixed()
          }"
        />
        <span class="ml-1">USD</span>
      </div>
    </PartialsTradeStatsHeaderItem>
  </div>
</template>
