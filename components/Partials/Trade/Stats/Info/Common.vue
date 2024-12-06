<script setup lang="ts">
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import { stableCoinSymbols } from '@/app/data/token'
import { UiMarketWithToken } from '@/types'

const spotStore = useSpotStore()
const tokenStore = useTokenStore()
const derivativeStore = useDerivativeStore()

const props = withDefaults(
  defineProps<{
    isSpot?: boolean
    market: UiMarketWithToken
  }>(),
  {}
)

const summary = computed(() => {
  if (props.isSpot) {
    return spotStore.marketsSummary.find(
      (market) => market.marketId === props.market.marketId
    )
  }

  return derivativeStore.marketsSummary.find(
    (market) => market.marketId === props.market.marketId
  )
})

const isStableQuoteAsset = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)

const volumeInUsd = computed(() =>
  volume.value.times(tokenStore.tokenUsdPrice(props.market.quoteToken))
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
  <PartialsTradeStatsHeaderItem>
    <template #title>
      <CommonHeaderTooltip text-color-class="text-coolGray-400">
        <template #default>
          {{ $t('trade.stats.total_market_volume_24h') }}
        </template>
        <template #customTooltip>
          <span v-if="isStableQuoteAsset">
            {{ $t('trade.stats.market_volume_24h_tooltip') }}
          </span>
          <span v-else>
            <AppUsdAmount
              v-bind="{
                isShowNoDecimals: true,
                amount: volumeInUsd.toFixed(),
                decimalPlaces: market.priceDecimals
              }"
            />
            <span class="ml-1">USD</span>
          </span>
        </template>
      </CommonHeaderTooltip>
    </template>
    <p class="font-mono">
      <AppAmount
        v-bind="{
          amount: volume.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
      />

      {{ market.quoteToken.symbol }}
    </p>
  </PartialsTradeStatsHeaderItem>

  <div v-if="!isStableQuoteAsset" class="lg:hidden">
    <PartialsTradeStatsHeaderItem>
      <template #title>
        <p class="text-coolGray-400">
          {{ $t('trade.stats.totalVolumeInUsd') }}
        </p>
      </template>
      <div class="font-mono">
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
    <p class="font-mono">
      <AppAmount
        v-bind="{
          amount: high.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
      />
    </p>
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsHeaderItem :title="$t('trade.stats.low')">
    <p class="font-mono">
      <AppAmount
        v-bind="{
          amount: low.toFixed(),
          decimalPlaces: market.priceDecimals
        }"
      />
    </p>
  </PartialsTradeStatsHeaderItem>
</template>
