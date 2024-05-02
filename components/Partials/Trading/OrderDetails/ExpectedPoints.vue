<script lang="ts" setup>
import {
  cosmosSdkDecToBigNumber,
  getExactDecimalsFromNumber
} from '@injectivelabs/sdk-ts'
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  TradeForm,
  TradeField,
  UiMarketWithToken,
  TradeExecutionType
} from '@/types'

const formValues = useFormValues() as Ref<TradeForm>

const props = defineProps({
  fees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const {
  isMarketDisqualified,
  marketTakerMakerExpectedPts,
  marketIncludedInTradingReward
} = useTradeReward(computed(() => props.market))

const { makerFeeRate, takerFeeRate } = useTradeFee(computed(() => props.market))

const tradeTypeMarket = computed(() =>
  [TradeExecutionType.Market, TradeExecutionType.StopMarket].includes(
    formValues.value[TradeField.TradingType]
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

  const boostedMultiplier = cosmosSdkDecToBigNumber(
    marketTakerMakerExpectedPts.value.makerPointsMultiplier
  )

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

  const boostedMultiplier = cosmosSdkDecToBigNumber(
    marketTakerMakerExpectedPts.value.takerPointsMultiplier
  )

  return new BigNumberInBase(props.fees).times(boostedMultiplier)
})

const expectedPts = computed(() => {
  if (!formValues.value[TradeField.PostOnly] || tradeTypeMarket.value) {
    return takerExpectedPts.value
  }

  return makerExpectedPts.value
})

const expectedPtsToFormat = computed(() => {
  if (!tradeTypeMarket.value && formValues.value[TradeField.PostOnly]) {
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
  <CommonTextInfo
    v-if="expectedPts.gte(0)"
    :title="$t('trade.expected_points')"
    class="mt-2"
  >
    <template #context>
      <AppTooltip class="ml-2" :content="$t('trade.expected_points_note')" />
    </template>

    <span class="font-mono flex items-start break-all">
      {{ `${expectedPtsToFormat}` }}
      <span class="text-gray-500 ml-1 break-normal">
        {{ $t('tradeAndEarn.pts') }}
      </span>
    </span>
  </CommonTextInfo>
</template>
