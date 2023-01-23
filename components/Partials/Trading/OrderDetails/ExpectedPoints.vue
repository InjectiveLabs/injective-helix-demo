<script lang="ts" setup>
import { PropType } from 'vue'
import { ZERO_IN_BASE } from '@injectivelabs/sdk-ui-ts'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  cosmosSdkDecToBigNumber,
  getExactDecimalsFromNumber
} from '@injectivelabs/sdk-ts'
import { UiMarketWithToken, TradeExecutionType } from '@/types'

const props = defineProps({
  postOnly: Boolean,

  fees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  tradingType: {
    type: String as PropType<TradeExecutionType>,
    required: true
  }
})

const {
  marketIncludedInTradingReward,
  marketTakerMakerExpectedPts,
  isMarketDisqualified
} = useTradeReward(computed(() => props.market))
const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))

const tradeTypeMarket = computed(() =>
  [TradeExecutionType.Market, TradeExecutionType.StopMarket].includes(
    props.tradingType
  )
)

const makerExpectedPts = computed(() => {
  if (
    makerFeeRate.value.lte(0) ||
    isMarketDisqualified.value ||
    !marketIncludedInTradingReward.value
  ) {
    return ZERO_IN_BASE
  }

  if (!marketTakerMakerExpectedPts.value) {
    return ZERO_IN_BASE
  }

  const makerPointsMultiplier =
    marketTakerMakerExpectedPts.value.makerPointsMultiplier || 1

  const boostedMultiplier = cosmosSdkDecToBigNumber(makerPointsMultiplier)

  return new BigNumberInBase(props.fees).times(boostedMultiplier)
})

const takerExpectedPts = computed(() => {
  if (
    takerFeeRate.value.lte(0) ||
    isMarketDisqualified.value ||
    !marketIncludedInTradingReward.value
  ) {
    return ZERO_IN_BASE
  }

  if (!marketTakerMakerExpectedPts.value) {
    return ZERO_IN_BASE
  }

  const takerPointsMultiplier =
    marketTakerMakerExpectedPts.value.takerPointsMultiplier || 1

  const boostedMultiplier = cosmosSdkDecToBigNumber(takerPointsMultiplier)

  return new BigNumberInBase(props.fees).times(boostedMultiplier)
})

const expectedPts = computed(() => {
  if (!props.postOnly || tradeTypeMarket.value) {
    return takerExpectedPts.value
  }

  return makerExpectedPts.value
})

const expectedPtsToFormat = computed(() => {
  if (!tradeTypeMarket.value && props.postOnly) {
    const makerExpectedPtsBasedOnTradingType = tradeTypeMarket.value
      ? makerExpectedPts.value
      : makerExpectedPts.value.abs()

    return makerExpectedPtsBasedOnTradingType.toFormat(
      getExactDecimalsFromNumber(makerExpectedPtsBasedOnTradingType.toNumber())
    )
  }

  return takerExpectedPts.value.toFormat(
    getExactDecimalsFromNumber(takerExpectedPts.value.toNumber())
  )
})
</script>

<template>
  <AppTextInfo
    v-if="expectedPts.gte(0)"
    :title="$t('trade.expected_points')"
    class="mt-2"
  >
    <template #context>
      <AppInfoTooltip
        class="ml-2"
        :tooltip="$t('trade.expected_points_note')"
      />
    </template>

    <span class="font-mono flex items-start break-all">
      {{ `${expectedPtsToFormat}` }}
      <span class="text-gray-500 ml-1 break-normal">
        {{ $t('pts') }}
      </span>
    </span>
  </AppTextInfo>
</template>
