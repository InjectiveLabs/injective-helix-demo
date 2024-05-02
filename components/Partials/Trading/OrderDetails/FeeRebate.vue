<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  UI_MINIMAL_AMOUNT,
  UI_DEFAULT_DISPLAY_DECIMALS
} from '@/app/utils/constants'
import { UiMarketWithToken } from '@/types'

const props = defineProps({
  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  }
})

const { makerFeeRate } = useTradeFee(computed(() => props.market))

const marketHasNegativeMakerFee = computed(() =>
  new BigNumberInBase(props.market.makerFeeRate).lt(0)
)

const feeRebates = computed(() => {
  if (!props.notionalValue) {
    return ZERO_IN_BASE
  }

  if (props.notionalValue.isNaN()) {
    return ZERO_IN_BASE
  }

  return new BigNumberInBase(
    props.notionalValue.times(makerFeeRate.value).abs()
  ).times(0.6 /* Only 60% of the fees are getting returned */)
})

const { valueToString: feeRebatesToFormat } = useBigNumberFormatter(
  feeRebates,
  {
    decimalPlaces: feeRebates.value.lte(UI_MINIMAL_AMOUNT)
      ? UI_DEFAULT_DISPLAY_DECIMALS
      : props.market.priceDecimals
  }
)
</script>

<template>
  <CommonTextInfo
    v-if="marketHasNegativeMakerFee"
    :title="$t('trade.estFeeRebate')"
    class="mt-2"
  >
    <template #context>
      <AppTooltip class="ml-2" :content="$t('trade.estFeeRebate_note')" />
    </template>
    <span
      v-if="feeRebates.gt(0)"
      data-cy="trading-page-details-fee-rebate-value-text-content"
      class="font-mono flex items-start break-all"
    >
      {{ feeRebatesToFormat }}
      <span class="text-gray-500 ml-1 break-normal">
        {{ market.quoteToken.symbol }}
      </span>
    </span>
    <span v-else class="text-gray-500 ml-1"> &mdash; </span>
  </CommonTextInfo>
</template>
