<script lang="ts" setup>
import { getExactDecimalsFromNumber } from '@injectivelabs/sdk-ts'
import {
  TradeForm,
  TradeField,
  UiMarketWithToken,
  TradeExecutionType
} from '@/types'

const tradingFormValues = useFormValues<TradeForm>() as Ref<TradeForm>

const props = defineProps({
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
        tradingFormValues[TradeField.TradingType]
      )
    "
    :title="$t('trade.taker_rate')"
    class="mt-2"
  >
    <template #context>
      <AppTooltip class="ml-2" :content="$t('trade.taker_rate_note')" />
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
    v-else-if="tradingFormValues[TradeField.PostOnly]"
    :title="$t('trade.maker_rate')"
    class="mt-2"
  >
    <template #context>
      <AppTooltip class="ml-2" :content="$t('trade.maker_rate_note')" />
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
      <AppTooltip class="ml-2" :content="$t('trade.maker_taker_rate_note')" />
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
