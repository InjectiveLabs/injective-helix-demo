<script setup lang="ts">
import { TokenType } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { stableCoinSymbols } from '@/app/data/token'
import type { UiMarketWithToken } from '@/types'

const sharedTokenStore = useSharedTokenStore()

const props = withDefaults(
  defineProps<{
    market: UiMarketWithToken
  }>(),
  {}
)

const { lastTradedPrice: spotLastTradedPrice } = useSpotLastPrice(
  computed(() => props.market)
)

const isStableQuoteAsset = computed(() =>
  stableCoinSymbols.includes(props.market.quoteToken.symbol)
)

const lastTradedPriceInUsd = computed(() =>
  spotLastTradedPrice.value.times(
    sharedTokenStore.tokenUsdPrice(props.market.quoteToken)
  )
)

const marketCap = computed(() => {
  const totalSupply = sharedToBalanceInTokenInBase({
    decimalPlaces: props.market.baseToken.decimals,
    value: sharedTokenStore.supplyMap[props.market.baseToken.denom] || 0
  })
  const usdPrice = sharedTokenStore.tokenUsdPrice(props.market.baseToken)

  return new BigNumberInBase(usdPrice).times(totalSupply)
})
</script>

<template>
  <PartialsTradeStatsHeaderItem
    v-if="!isStableQuoteAsset"
    :title="$t('trade.stats.usdValue')"
  >
    <p>
      <SharedAmountUsd
        v-bind="{
          shouldAbbreviate: false,
          amount: lastTradedPriceInUsd.toFixed()
        }"
      />
    </p>
  </PartialsTradeStatsHeaderItem>

  <PartialsTradeStatsInfoCommon v-bind="{ market, isSpot: true }" />

  <PartialsTradeStatsHeaderItem
    v-if="
      market.baseToken.tokenType === TokenType.Cw20 ||
      market.baseToken.tokenType === TokenType.TokenFactory
    "
  >
    <template #title>
      <CommonHeaderTooltip
        v-bind="{
          textColorClass: 'text-coolGray-400',
          tooltip: $t('trade.stats.marketCapTooltip')
        }"
      >
        {{ $t('trade.stats.marketCap') }}
      </CommonHeaderTooltip>
    </template>

    <p>
      <SharedAmountUsd
        v-bind="{
          amount: marketCap,
          shouldAbbreviate: false
        }"
      >
        <template #prefix>$</template>
      </SharedAmountUsd>
    </p>
  </PartialsTradeStatsHeaderItem>
</template>
