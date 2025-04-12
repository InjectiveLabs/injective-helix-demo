<script setup lang="ts">
import { TokenType } from '@injectivelabs/sdk-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import { stableCoinSymbols } from '@/app/data/token'
import { UiMarketWithToken } from '@/types'

const tokenStore = useTokenStore()

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
    tokenStore.tokenUsdPrice(props.market.quoteToken)
  )
)

const { valueToFixed: marketCapToFixed } = useSharedBigNumberFormatter(
  computed(() => {
    const totalSupply = sharedToBalanceInTokenInBase({
      decimalPlaces: props.market.baseToken.decimals,
      value: tokenStore.supplyMap[props.market.baseToken.denom] || 0
    })
    const usdPrice = tokenStore.tokenUsdPrice(props.market.baseToken)

    return new BigNumberInBase(usdPrice).times(totalSupply)
  })
)
</script>

<template>
  <PartialsTradeStatsHeaderItem
    v-if="!isStableQuoteAsset"
    :title="$t('trade.stats.usd_value')"
  >
    <p>
      <AppUsdAmount
        v-bind="{
          decimalPlaces: market.priceDecimals,
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
      <span>$</span>
      <AppUsdAmount
        v-bind="{
          amount: marketCapToFixed,
          decimalPlaces: market.priceDecimals
        }"
      />
    </p>
  </PartialsTradeStatsHeaderItem>
</template>
