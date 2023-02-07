<script lang="ts" setup>
import { PropType } from 'vue'
import { getExactDecimalsFromNumber } from '@injectivelabs/sdk-ts'
import { UiMarketWithToken, TradeExecutionType } from '@/types'

const props = defineProps({
  postOnly: Boolean,

  tradingType: {
    type: String as PropType<TradeExecutionType>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))

const makerFeeRateToFormat = computed(() => {
  const number = makerFeeRate.value.times(100)

  return number.toFormat(getExactDecimalsFromNumber(number.toNumber()))
})

const takerFeeRateToFormat = computed(() => {
  const number = takerFeeRate.value.times(100)

  return number.toFormat(getExactDecimalsFromNumber(number.toNumber()))
})
</script>

<template>
  <CommonTextInfo
    v-if="
      [TradeExecutionType.Market, TradeExecutionType.StopMarket].includes(
        tradingType
      )
    "
    :title="$t('trade.taker_rate')"
    class="mt-2"
  >
    <template #context>
      <CommonInfoTooltip class="ml-2" :tooltip="$t('trade.taker_rate_note')" />
    </template>
    <span
      class="font-mono flex items-center"
      data-cy="trading-page-details-fee-percentage-text-content"
    >
      <span>
        {{ `${takerFeeRateToFormat}%` }}
      </span>
    </span>
  </CommonTextInfo>

  <CommonTextInfo
    v-else-if="postOnly"
    :title="$t('trade.maker_rate')"
    class="mt-2"
  >
    <template #context>
      <CommonInfoTooltip class="ml-2" :tooltip="$t('trade.maker_rate_note')" />
    </template>
    <span
      class="font-mono flex items-center"
      data-cy="trading-page-details-fee-percentage-text-content"
    >
      <span>
        {{ `${makerFeeRateToFormat}%` }}
      </span>
    </span>
  </CommonTextInfo>

  <CommonTextInfo v-else :title="$t('trade.maker_taker_rate')" class="mt-2">
    <template #context>
      <CommonInfoTooltip
        class="ml-2"
        :tooltip="$t('trade.maker_taker_rate_note')"
      />
    </template>
    <span
      class="font-mono flex items-center"
      data-cy="trading-page-details-fee-percentage-text-content"
    >
      <span>
        {{ `${makerFeeRateToFormat}%/${takerFeeRateToFormat}%` }}
      </span>
    </span>
  </CommonTextInfo>
</template>
