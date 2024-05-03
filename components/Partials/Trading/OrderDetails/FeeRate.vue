<script lang="ts" setup>
import { ZERO_IN_BASE } from '@shared/utils/constant'
import { BigNumberInBase } from '@injectivelabs/utils'
import {
  TradeForm,
  TradeField,
  UiMarketWithToken,
  TradeExecutionType
} from '@/types'

const tradingFormValues = useFormValues<TradeForm>() as Ref<TradeForm>

const props = defineProps({
  fees: {
    type: Object as PropType<BigNumberInBase>,
    required: true
  },

  market: {
    type: Object as PropType<UiMarketWithToken>,
    required: true
  },

  notionalValue: {
    type: Object as PropType<BigNumberInBase>,
    default: ZERO_IN_BASE
  }
})

const {
  makerFeeRate,
  makerFeeRateDiscount,
  takerFeeRate,
  takerFeeRateDiscount
} = useTradeFee(computed(() => props.market))

const marketHasNegativeMakerFee = computed(() =>
  new BigNumberInBase(props.market.makerFeeRate).lt(0)
)

const tradeTypeMarket = computed(() =>
  [TradeExecutionType.Market, TradeExecutionType.StopMarket].includes(
    tradingFormValues.value[TradeField.TradingType]
  )
)

const feeReturned = computed(() => {
  if (!props.notionalValue) {
    return ZERO_IN_BASE
  }

  if (props.notionalValue.isNaN() || props.notionalValue.lte(0)) {
    return ZERO_IN_BASE
  }

  return props.notionalValue.times(
    new BigNumberInBase(takerFeeRate.value).minus(makerFeeRate.value.abs())
  )
})

const { valueToString: feesToFormat } = useSharedBigNumberFormatter(
  computed(() => props.fees),
  {
    decimalPlaces: props.market.priceDecimals
  }
)

const { valueToString: feeReturnedToFormat } = useSharedBigNumberFormatter(
  feeReturned,
  {
    decimalPlaces: props.market.priceDecimals
  }
)
</script>

<template>
  <CommonTextInfo
    v-if="
      !(tradingFormValues[TradeField.PostOnly] && marketHasNegativeMakerFee) ||
      tradeTypeMarket
    "
    :title="$t('trade.fee')"
    class="mt-2"
  >
    <template v-if="!tradeTypeMarket" #context>
      <div class="flex items-center gap-2 ml-2">
        <AppTooltip
          class="ml-2"
          :content="
            marketHasNegativeMakerFee
              ? $t('trade.fee_order_details_note_negative_margin')
              : $t('trade.fee_order_details_note', {
                  feeReturnedToFormat
                })
          "
        />

        <AppTooltip
          v-if="makerFeeRateDiscount.gt(0) || takerFeeRateDiscount.gt(0)"
          class="text-blue-500"
          :content="
            $t('trade.fees_tooltip_discount', {
              maker: makerFeeRateDiscount.times(100).toFixed(),
              taker: takerFeeRateDiscount.times(100).toFixed()
            })
          "
        >
          <SharedIcon
            name="check-circle"
            class="text-blue-500 w-3 h-3 min-w-3"
          />
        </AppTooltip>
      </div>
    </template>

    <template v-else #context>
      <div class="flex items-center gap-2 ml-2">
        <AppTooltip :content="$t('trade.fees_tooltip')" />

        <AppTooltip
          v-if="takerFeeRateDiscount.gt(0)"
          class="text-blue-500"
          :content="
            $t('trade.taker_fees_tooltip_discount', {
              taker: takerFeeRateDiscount.times(100).toFixed()
            })
          "
        >
          <SharedIcon
            name="check-circle"
            class="text-blue-500 w-3 h-3 min-w-3"
          />
        </AppTooltip>
      </div>
    </template>

    <span
      v-if="fees.gt(0)"
      class="font-mono flex items-start break-all"
      data-cy="trading-page-details-fee-value-text-content"
    >
      <span class="mr-1">≈</span>
      {{ feesToFormat }}
      <span class="text-gray-500 ml-1 break-normal">
        {{ market.quoteToken.symbol }}
      </span>
    </span>
    <span v-else class="text-gray-500 ml-1"> &mdash; </span>
  </CommonTextInfo>
</template>
